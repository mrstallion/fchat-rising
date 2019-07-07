import * as _ from 'lodash';
import core from '../chat/core';
import { ChannelAdEvent, ChannelMessageEvent, CharacterDataEvent, EventBus } from '../chat/event-bus';
import { Conversation } from '../chat/interfaces';
import { methods } from '../site/character_page/data_store';
import { Character } from '../site/character_page/interfaces';
import { Gender } from '../site/character_page/matcher';
import { AdCache } from './ad-cache';
import { ChannelConversationCache } from './channel-conversation-cache';
import { CharacterProfiler } from './character-profiler';
import { ProfileCache } from './profile-cache';
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
    static readonly PROFILE_QUERY_DELAY = 1000; //1 * 1000;

    adCache: AdCache = new AdCache();
    profileCache: ProfileCache = new ProfileCache();
    channelConversationCache: ChannelConversationCache = new ChannelConversationCache();

    protected queue: ProfileCacheQueueEntry[] = [];

    protected profileTimer: Timer | null = null;
    protected characterProfiler: CharacterProfiler | undefined;


    queueForFetching(name: string): void {
        const key = ProfileCache.nameKey(name);

        if (this.profileCache.has(key))
            return;

        if (!!_.find(this.queue, (q: ProfileCacheQueueEntry) => (q.key === key)))
            return;

        const entry: ProfileCacheQueueEntry = {
            name,
            key,
            added: new Date(),
            score: 0
        };

        this.queue.push(entry);
    }

    async fetchProfile(name: string): Promise<void> {
        try {
            await methods.fieldsGet();

            const c = await methods.characterData(name, -1, true);

            const r = this.profileCache.register(c);

            this.updateAdScoringForProfile(c, r.matchScore);
        } catch (err) {
            console.error('Failed to fetch profile for cache', name, err);
        }
    }


    updateAdScoringForProfile(c: Character, score: number): void {
        _.each(
            core.conversations.channelConversations,
            (ch: ChannelConversation) => {
                _.each(
                    ch.messages, (m: Conversation.Message) => {
                        if ((m.type === Message.Type.Ad) && (m.sender) && (m.sender.name === c.character.name)) {
                            console.log('Update score', score, ch.name, m.sender.name, m.text, m.id);

                            m.score = score;
                        }
                    }
                );
            }
        );
    }


    addProfile(character: string | Character): void {
        if (typeof character === 'string') {
            // console.log('Learn discover', character);

            this.queueForFetching(character);
            return;
        }

        this.profileCache.register(character);
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
        _.each(this.queue, (e: ProfileCacheQueueEntry) => this.calculateScore(e));

        this.queue = _.sortBy(this.queue, 'score');

        return this.queue.pop() as ProfileCacheQueueEntry;
    }

    calculateScore(e: ProfileCacheQueueEntry): number {
        return this.characterProfiler ? this.characterProfiler.calculateInterestScoreForQueueEntry(e) : 0;
    }

    start(): void {
        this.stop();

        EventBus.$on(
            'character-data',
            (data: CharacterDataEvent) => {
                this.addProfile(data.character);
            }
        );

        EventBus.$on(
            'channel-message',
            (data: ChannelMessageEvent) => {
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

                this.addProfile(message.sender.name);
            }
        );

        EventBus.$on(
            'channel-ad',
            (data: ChannelAdEvent) => {
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

                this.addProfile(message.sender.name);
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
                        // console.log('Learn fetch', next.name, next.score);
                        await this.fetchProfile(next.name);
                    }

                    scheduleNextFetch();
                },
                CacheManager.PROFILE_QUERY_DELAY
            );
        };

        scheduleNextFetch();
    }

    stop(): void {
        if (this.profileTimer) {
            clearTimeout(this.profileTimer);
            this.profileTimer = null;
        }

        // should do some $off here
    }


    setProfile(c: Character): void {
        this.characterProfiler = new CharacterProfiler(c, this.adCache);
    }
}
