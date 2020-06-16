import * as _ from 'lodash';
import core from '../chat/core';
import { ChannelAdEvent, ChannelMessageEvent, CharacterDataEvent, EventBus, SelectConversationEvent } from '../chat/preview/event-bus';
import { Channel, Conversation } from '../chat/interfaces';
import { methods } from '../site/character_page/data_store';
import { Character as ComplexCharacter } from '../site/character_page/interfaces';
import { Gender } from './matcher';
import { AdCache } from './ad-cache';
import { ChannelConversationCache } from './channel-conversation-cache';
import { CharacterProfiler } from './character-profiler';
import { CharacterCacheRecord, ProfileCache } from './profile-cache';
import { IndexedStore } from './store/indexed';
import Timer = NodeJS.Timer;
import ChannelConversation = Conversation.ChannelConversation;
import Message = Conversation.Message;
import { Character } from '../fchat/interfaces';
import Bluebird from 'bluebird';
import ChatMessage = Conversation.ChatMessage;


export interface ProfileCacheQueueEntry {
    name: string;
    key: string;
    added: Date;
    gender?: Gender;
    score: number;
    channelId?: string;
}


export class CacheManager {
    static readonly PROFILE_QUERY_DELAY = 400; //1 * 1000;

    adCache: AdCache = new AdCache();
    profileCache: ProfileCache = new ProfileCache();
    channelConversationCache: ChannelConversationCache = new ChannelConversationCache();

    protected queue: ProfileCacheQueueEntry[] = [];

    protected profileTimer: Timer | null = null;
    protected characterProfiler: CharacterProfiler | undefined;

    protected profileStore?: IndexedStore;

    protected lastPost: Date = new Date();

    protected lastFetch = Date.now();


    markLastPostTime(): void {
        this.lastPost = new Date();
    }

    getLastPost(): Date {
        return this.lastPost;
    }

    async queueForFetching(name: string, skipCacheCheck: boolean = false, channelId?: string): Promise<void> {
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
            channelId,
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

        this.populateAllConversationsWithScore(c.character.name, score);
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
                // this promise is intentionally NOT chained
                // tslint:disable-next-line: no-floating-promises
              this.onCharacterData(data);
            }
        );

        EventBus.$on(
            'channel-message',
            async(data: ChannelMessageEvent) => {
                // this promise is intentionally NOT chained
                // tslint:disable-next-line: no-floating-promises
                this.onChannelMessage(data);
            }
        );

        EventBus.$on(
            'channel-ad',
            async(data: ChannelAdEvent) => {
                // this promise is intentionally NOT chained
                // tslint:disable-next-line: no-floating-promises
                this.onChannelAd(data);
            }
        );

        EventBus.$on(
            'select-conversation',
            async(data: SelectConversationEvent) => {
              // this promise is intentionally NOT chained
                // tslint:disable-next-line: no-floating-promises
              this.onSelectConversation(data);
            }
        );

        EventBus.$on(
            'conversation-load-more',
            async(data: SelectConversationEvent) => {
              // this promise is intentionally NOT chained
                // tslint:disable-next-line: no-floating-promises
              this.onLoadMoreConversation(data);
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
                            // tslint:disable-next-line: binary-expression-operand-order
                            if ((false) && (next)) {
                              console.log(`Fetch '${next.name}' for channel '${next.channelId}', gap: ${(Date.now() - this.lastFetch)}ms`);
                              this.lastFetch = Date.now();
                            }

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


    async onCharacterData(data: CharacterDataEvent): Promise<void> {
      await this.addProfile(data.character);
    }


    async onChannelMessage(data: ChannelMessageEvent): Promise<void> {
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

        // await this.addProfile(message.sender.name);
    }


    async onChannelAd(data: ChannelAdEvent): Promise<void> {
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

        if ((!data.profile) && (core.conversations.selectedConversation === data.channel)) {
            await this.queueForFetching(message.sender.name, true, data.channel.channel.id);
        }

        // this.addProfile(message.sender.name);
    }


    async onLoadMoreConversation(data: SelectConversationEvent): Promise<void> {
      await this.onSelectConversation(data);
    }


    async onSelectConversation(data: SelectConversationEvent): Promise<void> {
        const conversation = data.conversation;
        const channel = _.get(conversation, 'channel') as (Channel.Channel | undefined);
        const channelId = _.get(channel, 'id', '<missing>');

        // Remove unfinished fetches related to other channels
        this.queue = _.reject(
            this.queue,
          (q) => (!!q.channelId) && (q.channelId !== channelId)
        );

        if (channel) {
            const checkedNames: Record<string, boolean> = {};

            // Add fetchers for unknown profiles in ads
            await Bluebird.each(
              _.filter(
                conversation.messages,
                (m) => {
                  if (m.type !== Message.Type.Ad) {
                    return false;
                  }

                  const chatMessage = m as unknown as ChatMessage;

                  if (chatMessage.sender.name in checkedNames) {
                    return false;
                  }

                  checkedNames[chatMessage.sender.name] = true;
                  return true;
                }
              ),
              async(m: Message) => {
                const chatMessage: ChatMessage = m as unknown as ChatMessage;

                if (chatMessage.score) {
                    return;
                }

                const p = await this.resolvePScore(false, chatMessage.sender, conversation as ChannelConversation, chatMessage, true);

                if (!p) {
                    await this.queueForFetching(chatMessage.sender.name, true, channel.id);
                }
              }
            );
        }
    }


    async resolvePScore(
      skipStore: boolean,
      char: Character.Character,
      conv: ChannelConversation,
      msg?: Message,
      populateAll: boolean = true
    ): Promise<CharacterCacheRecord | undefined> {
      if (!core.characters.ownProfile) {
          return undefined;
      }

      // this is done here so that the message will be rendered correctly when cache is hit
      let p: CharacterCacheRecord | undefined;

      p = await core.cache.profileCache.get(
          char.name,
          skipStore,
          conv.channel.name
      ) || undefined;

      if ((p) && (msg)) {
          // if (p.matchScore === 0) {
          //     console.log(`Fetched score 0 for character ${char.name}`);
          //
          //     p.matchScore = ProfileCache.score(p.character);
          //
          //     await core.cache.profileCache.register(p.character, false);
          //
          //     console.log(`Re-scored character ${char.name} to ${p.matchScore}`);
          // }

          msg.score = p.matchScore;

          if (populateAll) {
            this.populateAllConversationsWithScore(char.name, p.matchScore);
          }
      }

      return p;
    }


    // tslint:disable-next-line: prefer-function-over-method
    protected populateAllConversationsWithScore(characterName: string, score: number): void {
        _.each(
            core.conversations.channelConversations,
            (ch: ChannelConversation) => {
                _.each(
                    ch.messages, (m: Conversation.Message) => {
                        if ((m.type === Message.Type.Ad) && (m.sender) && (m.sender.name === characterName)) {
                            // console.log('Update score', score, ch.name, m.sender.name, m.text, m.id);

                            m.score = score;
                        }
                    }
                );
            }
        );
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
