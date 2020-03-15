import core from '../core';
import { Conversation } from '../interfaces';
import Timer = NodeJS.Timer;

import throat from 'throat';

const adManagerThroat = throat(1);


export class AdManager {
    static readonly POSTING_PERIOD = 3 * 60 * 60 * 1000;
    static readonly START_VARIANCE = 3 * 60 * 1000;
    static readonly POST_VARIANCE = 8 * 60 * 1000;
    static readonly POST_DELAY = 1.5 * 60 * 1000;

    static readonly POST_MANUAL_THRESHOLD = 5 * 1000; // don't post anything within 5 seconds of other posts

    private conversation: Conversation;

    private adIndex = 0;
    private active = false;
    private nextPostDue?: Date;
    private expireDue?: Date;
    private firstPost?: Date;
    private interval?: Timer;

    constructor(conversation: Conversation) {
        this.conversation = conversation;
    }

    isActive(): boolean {
        return this.active;
    }


    // tslint:disable-next-line
    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }


    // This makes sure there is a 5s delay between channel posts
    private async sendAdToChannel(msg: string, conv: Conversation.ChannelConversation): Promise<void> {
        await adManagerThroat(
            async() => {
                const delta = Date.now() - core.cache.getLastPost().getTime();

                if ((delta > 0) && (delta < AdManager.POST_MANUAL_THRESHOLD)) {
                    await this.delay(delta);
                }

                await conv.sendAd(msg);
            }
        );
    }


    private async sendNextPost(): Promise<void> {
        const msg = this.getNextAd();

        if ((!msg) || ((this.expireDue) && (this.expireDue.getTime() < Date.now()))) {
            this.stop();
            return;
        }

        const chanConv = (<Conversation.ChannelConversation>this.conversation);

        await this.sendAdToChannel(msg, chanConv);

        // post next ad every 12 - 22 minutes
        const nextInMs = Math.max(0, (chanConv.nextAd - Date.now())) +
            AdManager.POST_DELAY +
            Math.random() * AdManager.POST_VARIANCE;

        this.adIndex = this.adIndex + 1;
        this.nextPostDue = new Date(Date.now() + nextInMs);

        // tslint:disable-next-line: no-unnecessary-type-assertion
        this.interval = setTimeout(
            async() => {
                await this.sendNextPost();
            },
            nextInMs
        ) as Timer;
    }

    getAds(): string[] {
        return this.conversation.settings.adSettings.ads;
    }

    getNextAd(): string | undefined {
        const ads = this.getAds();

        if (ads.length === 0)
            return;

        return ads[this.adIndex % ads.length];
    }

    getNextPostDue(): Date | undefined {
        return this.nextPostDue;
    }

    getExpireDue(): Date | undefined {
        return this.expireDue;
    }

    getFirstPost(): Date | undefined {
        return this.firstPost;
    }

    start(): void {
        const chanConv = (<Conversation.ChannelConversation>this.conversation);
        const initialWait = Math.max(Math.random() * AdManager.START_VARIANCE, (chanConv.nextAd - Date.now()) * 1.1);

        this.adIndex = 0;
        this.active = true;
        this.nextPostDue = new Date(Date.now() + initialWait);
        this.expireDue = new Date(Date.now() + AdManager.POSTING_PERIOD);

        // tslint:disable-next-line: no-unnecessary-type-assertion
        this.interval = setTimeout(
            async() => {
                this.firstPost = new Date();

                await this.sendNextPost();
            },
            initialWait
        ) as Timer;
    }

    stop(): void {
        if (this.interval)
            clearTimeout(this.interval);

        delete this.interval;
        delete this.nextPostDue;
        delete this.expireDue;
        delete this.firstPost;

        this.active = false;
        this.adIndex = 0;

        // const message = new EventMessage(`Advertisements on channel [channel]${this.conversation.name}[/channel] have expired.`);
        // addEventMessage(message);
    }

    renew(): void {
        if (!this.active)
            return;

        this.expireDue = new Date(Date.now() + 3 * 60 * 60 * 1000);
    }
}
