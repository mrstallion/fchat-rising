//tslint:disable:no-shadowed-variable
declare global {
    interface Function {
        //tslint:disable-next-line:ban-types no-any
        bind<T extends Function>(this: T, thisArg: any): T;
        //tslint:disable-next-line:ban-types no-any
        bind<T, TReturn>(this: (t: T) => TReturn, thisArg: any, arg: T): () => TReturn;
    }
}

import {Channel, Character} from '../fchat/interfaces';
export {Connection, Channel, Character} from '../fchat/interfaces';
export const userStatuses = ['online', 'looking', 'away', 'busy', 'dnd'];
export const channelModes = ['chat', 'ads', 'both'];

export namespace Conversation {
    export interface EventMessage {
        readonly type: Message.Type.Event,
        readonly text: string,
        readonly time: Date
    }

    export interface ChatMessage {
        readonly type: Message.Type,
        readonly sender: Character,
        readonly text: string,
        readonly time: Date
        readonly isHighlight: boolean
    }

    export type Message = EventMessage | ChatMessage;

    export namespace Message {
        export enum Type {
            Message,
            Action,
            Ad,
            Roll,
            Warn,
            Event
        }
    }

    export type RecentChannelConversation = {readonly channel: string, readonly name: string};
    export type RecentPrivateConversation = {readonly character: string};
    export type RecentConversation = RecentChannelConversation | RecentPrivateConversation;

    export type TypingStatus = 'typing' | 'paused' | 'clear';

    interface TabConversation extends Conversation {
        isPinned: boolean
        readonly maxMessageLength: number
        close(): void
        sort(newIndex: number): void
    }

    export interface PrivateConversation extends TabConversation {
        readonly character: Character
        readonly typingStatus: TypingStatus
    }

    export interface ChannelConversation extends TabConversation {
        readonly channel: Channel
        mode: Channel.Mode
        readonly adCountdown: number
        isSendingAds: boolean
    }

    export function isPrivate(conversation: Conversation): conversation is PrivateConversation {
        return (<Partial<PrivateConversation>>conversation).character !== undefined;
    }

    export function isChannel(conversation: Conversation): conversation is ChannelConversation {
        return (<Partial<ChannelConversation>>conversation).channel !== undefined;
    }

    export interface State {
        readonly privateConversations: ReadonlyArray<PrivateConversation>
        readonly channelConversations: ReadonlyArray<ChannelConversation>
        readonly consoleTab: Conversation
        readonly recent: ReadonlyArray<RecentConversation>
        readonly selectedConversation: Conversation
        byKey(key: string): Conversation | undefined
        getPrivate(character: Character): PrivateConversation
        reloadSettings(): void
    }

    export enum Setting {
        True, False, Default
    }

    export interface Settings {
        readonly notify: Setting;
        readonly highlight: Setting;
        readonly highlightWords: ReadonlyArray<string>;
        readonly joinMessages: Setting;
        readonly defaultHighlights: boolean;
    }

    export const enum UnreadState { None, Unread, Mention }

    export interface Conversation {
        enteredText: string;
        infoText: string;
        readonly name: string;
        readonly messages: ReadonlyArray<Message>;
        readonly reportMessages: ReadonlyArray<Message>;
        readonly lastRead: Message | undefined
        errorText: string
        readonly key: string
        readonly unread: UnreadState
        settings: Settings
        send(): void
        loadLastSent(): void
        show(): void
        loadMore(): void
    }
}

export type Conversation = Conversation.Conversation;

export namespace Logs {
    export interface Basic {
        logMessage(conversation: Conversation, message: Conversation.Message): void
        getBacklog(conversation: Conversation): Promise<ReadonlyArray<Conversation.Message>>
    }

    export interface Persistent extends Basic {
        readonly conversations: ReadonlyArray<{readonly id: string, readonly name: string}>
        getLogs(key: string, date: Date): Promise<ReadonlyArray<Conversation.Message>>
        getLogDates(key: string): ReadonlyArray<Date>
    }

    export function isPersistent(logs: Basic): logs is Persistent {
        return (<Partial<Persistent>>logs).getLogs !== undefined;
    }
}

export namespace Settings {
    export type Keys = {
        settings: Settings,
        pinned: {channels: string[], private: string[]},
        conversationSettings: {[key: string]: Conversation.Settings}
        recent: Conversation.RecentConversation[]
    };

    export interface Store {
        get<K extends keyof Keys>(key: K, character?: string): Promise<Keys[K] | undefined>
        getAvailableCharacters(): Promise<ReadonlyArray<string>> | undefined
        set<K extends keyof Keys>(key: K, value: Keys[K]): Promise<void>
    }

    export interface Settings {
        readonly playSound: boolean;
        readonly clickOpensMessage: boolean;
        readonly disallowedTags: ReadonlyArray<string>;
        readonly notifications: boolean;
        readonly highlight: boolean;
        readonly highlightWords: ReadonlyArray<string>;
        readonly showAvatars: boolean;
        readonly animatedEicons: boolean;
        readonly idleTimer: number;
        readonly messageSeparators: boolean;
        readonly eventMessages: boolean;
        readonly joinMessages: boolean;
        readonly alwaysNotify: boolean;
        readonly logMessages: boolean;
        readonly logAds: boolean;
        readonly fontSize: number;
    }
}

export type Settings = Settings.Settings;

export interface Notifications {
    isInBackground: boolean
    notify(conversation: Conversation, title: string, body: string, icon: string, sound: string): void
    playSound(sound: string): void
}

export interface State {
    settings: Settings
}