//tslint:disable:no-shadowed-variable
import {Connection} from '../fchat';

import {Channel, Character} from '../fchat/interfaces';
import { AdManager } from './ad-manager';
export {Connection, Channel, Character} from '../fchat/interfaces';
export const userStatuses: ReadonlyArray<Character.Status> = ['online', 'looking', 'away', 'busy', 'dnd'];
export const channelModes: ReadonlyArray<Channel.Mode> = ['chat', 'ads', 'both'];

export namespace Conversation {
    interface BaseMessage {
        readonly id: number
        readonly type: Message.Type
        readonly text: string
        readonly time: Date

        score: number;
    }

    export interface EventMessage extends BaseMessage {
        readonly type: Message.Type.Event
    }

    export interface ChatMessage extends BaseMessage {
        readonly isHighlight: boolean
        readonly sender: Character
    }

    export type Message = EventMessage | ChatMessage;

    export interface SFCMessage extends EventMessage {
        sfc: Connection.ServerCommands['SFC'] & {confirmed?: true}
    }

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

    export type TypingStatus = 'typing' | 'paused' | 'clear';

    interface TabConversation extends Conversation {
        isPinned: boolean
        readonly maxMessageLength: number
        close(): Promise<void> | void
        sort(newIndex: number): Promise<void>
    }

    export interface PrivateConversation extends TabConversation {
        readonly character: Character
        readonly typingStatus: TypingStatus
    }

    export interface ChannelConversation extends TabConversation {
        readonly channel: Channel
        mode: Channel.Mode
        readonly nextAd: number
        isSendingAds: boolean
        sendAd(text: string): Promise<void>
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
        readonly recent: ReadonlyArray<RecentPrivateConversation>
        readonly recentChannels: ReadonlyArray<RecentChannelConversation>
        readonly selectedConversation: Conversation
        readonly hasNew: boolean;
        byKey(key: string): Conversation | undefined
        getPrivate(character: Character): PrivateConversation
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
        readonly adSettings: AdSettings;
    }

    export interface AdSettings {
        readonly ads: string[];
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
        readonly adManager: AdManager;
        send(): Promise<void>
        clear(): void
        loadLastSent(): void
        show(): void
        loadMore(): boolean
    }
}

export type Conversation = Conversation.Conversation;

export namespace Logs {
    export type Conversation = {readonly key: string, readonly name: string};
}

export interface Logs {
    logMessage(conversation: Conversation, message: Conversation.Message): Promise<void> | void
    getBacklog(conversation: Conversation): Promise<ReadonlyArray<Conversation.Message>>
    getConversations(character: string): Promise<ReadonlyArray<Logs.Conversation>>
    getLogs(character: string, key: string, date: Date): Promise<ReadonlyArray<Conversation.Message>>
    getLogDates(character: string, key: string): Promise<ReadonlyArray<Date>>
    getAvailableCharacters(): Promise<ReadonlyArray<string>>
    canZip: boolean;
}

export namespace Settings {
    export type Keys = {
        settings: Settings,
        pinned: {channels: string[], private: string[]},
        conversationSettings: {[key: string]: Conversation.Settings | undefined}
        modes: {[key: string]: Channel.Mode | undefined}
        recent: Conversation.RecentPrivateConversation[]
        recentChannels: Conversation.RecentChannelConversation[]
        hiddenUsers: string[]
    };

    export interface Store {
        get<K extends keyof Keys>(key: K, character?: string): Promise<Keys[K] | undefined>
        getAvailableCharacters(): Promise<ReadonlyArray<string>>
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
        readonly showNeedsReply: boolean;
        readonly enterSend: boolean;
        readonly colorBookmarks: boolean;
        readonly bbCodeBar: boolean;
    }
}

export type Settings = Settings.Settings;

export interface Notifications {
    isInBackground: boolean
    notify(conversation: Conversation, title: string, body: string, icon: string, sound: string): Promise<void>
    playSound(sound: string): void
    requestPermission(): Promise<void>
    initSounds(sounds: ReadonlyArray<string>): Promise<void>
}

export interface State {
    settings: Settings
    hiddenUsers: string[]
}