import { Conversation } from './interfaces';

export class AdManager {
    static readonly POSTING_PERIOD = 3 * 60 * 60 * 1000;
    static readonly START_VARIANCE = 3 * 60 * 1000;
    static readonly POST_VARIANCE = 10 * 60 * 1000;
    static readonly POST_DELAY = 2 * 60 * 1000;

    private conversation: Conversation;

    private adIndex = 0;
    private active = false;
    private nextPostDue?: Date;
    private expireDue?: Date;
    private firstPost?: Date;
    private interval?: any;

    constructor(conversation: Conversation) {
        this.conversation = conversation;
    }

    isActive(): boolean {
        return this.active;
    }

    private async sendNextPost(): Promise<void> {
        const msg = this.getNextAd();

        if ((!msg) || ((this.expireDue) && (this.expireDue.getTime() < Date.now()))) {
            this.stop();
            return;
        }

        const chanConv = (<Conversation.ChannelConversation>this.conversation);

        await chanConv.sendAd(msg);

        // post next ad every 12 - 22 minutes
        const nextInMs = Math.max(0, (chanConv.nextAd - Date.now())) +
            AdManager.POST_DELAY +
            Math.random() * AdManager.POST_VARIANCE;

        this.adIndex = this.adIndex + 1;
        this.nextPostDue = new Date(Date.now() + nextInMs);

        this.interval = setTimeout(
            async() => {
                await this.sendNextPost();
            },
            nextInMs
        );
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

        this.interval = setTimeout(
            async() => {
                this.firstPost = new Date();

                await this.sendNextPost();
            },
            initialWait
        );
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
