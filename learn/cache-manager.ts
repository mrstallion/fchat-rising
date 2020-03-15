import * as _ from 'lodash';
import core from '../chat/core';
import { ChannelAdEvent, ChannelMessageEvent, CharacterDataEvent, EventBus } from '../chat/preview/event-bus';
import { Conversation } from '../chat/interfaces';
import { methods } from '../site/character_page/data_store';
import { Character as ComplexCharacter } from '../site/character_page/interfaces';
import { Gender } from './matcher';
import { AdCache } from './ad-cache';
import { ChannelConversationCache } from './channel-conversation-cache';
import { CharacterProfiler } from './character-profiler';
import { ProfileCache } from './profile-cache';
import { IndexedStore } from './store/indexed';
import Timer = NodeJS.Timer;
import ChannelConversation = Conversation.ChannelConversation;
import Message = Conversation.Message;

export interface ProfileCacheQueueEntry {
    name: string;
    key: string;
    added: Date;
    gender?: Gender;
    score: number;
}


export class CacheManager {
    static readonly PROFILE_QUERY_DELAY = 1 * 1000; //1 * 1000;

    adCache: AdCache = new AdCache();
    profileCache: ProfileCache = new ProfileCache();
    channelConversationCache: ChannelConversationCache = new ChannelConversationCache();

    protected queue: ProfileCacheQueueEntry[] = [];

    protected profileTimer: Timer | null = null;
    protected characterProfiler: CharacterProfiler | undefined;

    protected profileStore?: IndexedStore;

    protected lastPost: Date = new Date();


    timeLastPost(): void {
        this.lastPost = new Date();
    }

    getLastPost(): Date {
        return this.lastPost;
    }

    async queueForFetching(name: string, skipCacheCheck: boolean = false): Promise<void> {
        if (!core.state.settings.risingAdScore) {
            return;
        }

        if (!skipCacheCheck) {
            const c = await this.profileCache.get(name);

            if (c) {
                this.updateAdScoringForProfile(c.character, c.matchScore);
                return;
            }
        }

        const key = ProfileCache.nameKey(name);

        if (!!_.find(this.queue, (q: ProfileCacheQueueEntry) => (q.key === key)))
            return;

        const entry: ProfileCacheQueueEntry = {
            name,
            key,
            added: new Date(),
            score: 0
        };

        this.queue.push(entry);

        // console.log('AddProfileForFetching', name, this.queue.length);
    }


    async fetchProfile(name: string): Promise<ComplexCharacter | null> {
        try {
            await methods.fieldsGet();

            const c = await methods.characterData(name, -1, true);

            const r = await this.profileCache.register(c);

            this.updateAdScoringForProfile(c, r.matchScore);

            return c;
        } catch (err) {
            console.error('Failed to fetch profile for cache', name, err);

            return null;
        }
    }


    updateAdScoringForProfile(c: ComplexCharacter, score: number): void {
        EventBus.$emit(
            'character-score',
            {
                character: c,
                score
            }
        );

        _.each(
            core.conversations.channelConversations,
            (ch: ChannelConversation) => {
                _.each(
                    ch.messages, (m: Conversation.Message) => {
                        if ((m.type === Message.Type.Ad) && (m.sender) && (m.sender.name === c.character.name)) {
                            // console.log('Update score', score, ch.name, m.sender.name, m.text, m.id);

                            m.score = score;
                        }
                    }
                );
            }
        );
    }


    async addProfile(character: string | ComplexCharacter): Promise<void> {
        if (typeof character === 'string') {
            // console.log('Learn discover', character);

            await this.queueForFetching(character);
            return;
        }

        await this.profileCache.register(character);
    }


    /*
     * Preference in order (plan):
     *   + has messaged me
     *   + bookmarked / friend
     *
     *   + genders I like
     *   + looking
     *   + online
     *
     *   - busy
     *   - DND
     *   - away
     */
    consumeNextInQueue(): ProfileCacheQueueEntry | null {
        if (this.queue.length === 0) {
            return null;
        }

        // re-score
        _.each(this.queue, (e: ProfileCacheQueueEntry) => e.score = this.calculateScore(e));

        this.queue = _.sortBy(this.queue, 'score');

        // console.log('QUEUE', _.map(this.queue, (q) => `${q.name}: ${q.score}`));

        const entry = this.queue.pop() as ProfileCacheQueueEntry;

        // console.log('PopFromQueue', entry.name, this.queue.length);

        return entry;
    }

    calculateScore(e: ProfileCacheQueueEntry): number {
        return this.characterProfiler ? this.characterProfiler.calculateInterestScoreForQueueEntry(e) : 0;
    }


    async start(): Promise<void> {
        await this.stop();

        this.profileStore = await IndexedStore.open();

        this.profileCache.setStore(this.profileStore);

        EventBus.$on(
            'character-data',
            async(data: CharacterDataEvent) => {
                await this.addProfile(data.character);
            }
        );

        EventBus.$on(
            'channel-message',
            async(data: ChannelMessageEvent) => {
                const message = data.message;
                const channel = data.channel;

                this.channelConversationCache.register(
                    {
                        name: message.sender.name,
                        channelName : channel.name,
                        datePosted: message.time,
                        message: message.text
                    }
                );

                await this.addProfile(message.sender.name);
            }
        );

        EventBus.$on(
            'channel-ad',
            async(data: ChannelAdEvent) => {
                const message = data.message;
                const channel = data.channel;

                this.adCache.register(
                    {
                        name: message.sender.name,
                        channelName : channel.name,
                        datePosted: message.time,
                        message: message.text
                    }
                );

                if (!data.profile) {
                    await this.queueForFetching(message.sender.name, true);
                }

                // this.addProfile(message.sender.name);
            }
        );

        // EventBus.$on(
        //     'private-message',
        //     (data: any) => {}
        // );


        const scheduleNextFetch = () => {
            this.profileTimer = setTimeout(
                async() => {
                    const next = this.consumeNextInQueue();

                    if (next) {
                        try {
                            // console.log('Learn fetch', next.name, next.score);
                            await this.fetchProfile(next.name);
                        } catch (err) {
                            console.error('Profile queue error', err);

                            this.queue.push(next); // return to queue
                        }
                    }

                    scheduleNextFetch();
                },
                CacheManager.PROFILE_QUERY_DELAY
            );
        };

        scheduleNextFetch();
    }


    async stop(): Promise<void> {
        if (this.profileTimer) {
            clearTimeout(this.profileTimer);
            this.profileTimer = null;
        }

        if (this.profileStore) {
            await this.profileStore.stop();
        }

        // should do some $off here?
    }


    setProfile(c: ComplexCharacter): void {
        this.characterProfiler = new CharacterProfiler(c, this.adCache);
    }
}
