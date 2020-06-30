import Vue, {WatchHandler} from 'vue';
import { CacheManager } from '../learn/cache-manager';
import {Channels, Characters} from '../fchat';
import BBCodeParser from './bbcode';
import {Settings as SettingsImpl} from './common';
import Conversations from './conversations';
import {Channel, Character, Connection, Conversation, Logs, Notifications, Settings, State as StateInterface} from './interfaces';
import { AdCoordinatorGuest } from './ads/ad-coordinator-guest';

function createBBCodeParser(): BBCodeParser {
    const parser = new BBCodeParser();
    for(const tag of state.settings.disallowedTags)
        parser.removeTag(tag);
    return parser;
}

class State implements StateInterface {
    _settings: Settings | undefined = undefined;
    hiddenUsers: string[] = [];

    get settings(): Settings {
        if(this._settings === undefined) throw new Error('Settings load failed.');
        return this._settings;
    }

    set settings(value: Settings) {
        this._settings = value;
        //tslint:disable-next-line:no-floating-promises
        if(data.settingsStore !== undefined) data.settingsStore.set('settings', value);
        data.bbCodeParser = createBBCodeParser();
    }
}

interface VueState {
    readonly channels: Channel.State
    readonly characters: Character.State
    readonly conversations: Conversation.State
    readonly state: StateInterface
}

const state = new State();

const vue = <Vue & VueState>new Vue({
    data: {
        channels: undefined,
        characters: undefined,
        conversations: undefined,
        state
    },
    watch: {
        'state.hiddenUsers': async(newValue: string[], oldValue: string[]) => {
            if(data.settingsStore !== undefined && newValue !== oldValue)
                await data.settingsStore.set('hiddenUsers', newValue);
        }
    }
});

const data = {
    connection: <Connection | undefined>undefined,
    logs: <Logs | undefined>undefined,
    settingsStore: <Settings.Store | undefined>undefined,
    state: vue.state,
    bbCodeParser: new BBCodeParser(),
    conversations: <Conversation.State | undefined>undefined,
    channels: <Channel.State | undefined>undefined,
    characters: <Character.State | undefined>undefined,
    notifications: <Notifications | undefined>undefined,
    cache: <CacheManager | undefined>undefined,
    adCoordinator: <AdCoordinatorGuest | undefined>undefined,

    register<K extends 'characters' | 'conversations' | 'channels'>(module: K, subState: VueState[K]): void {
        Vue.set(vue, module, subState);
        (<VueState[K]>data[module]) = subState;
    },
    watch<T>(getter: (this: VueState) => T, callback: WatchHandler<T>): void {
        vue.$watch(getter, callback);
    },
    async reloadSettings(): Promise<void> {
        state._settings = Object.assign(new SettingsImpl(), await core.settingsStore.get('settings'));
        const hiddenUsers = await core.settingsStore.get('hiddenUsers');
        state.hiddenUsers = hiddenUsers !== undefined ? hiddenUsers : [];
    }
};

export function init(this: any, connection: Connection, logsClass: new() => Logs, settingsClass: new() => Settings.Store,
                     notificationsClass: new() => Notifications): void {
    data.connection = connection;
    data.logs = new logsClass();
    data.settingsStore = new settingsClass();
    data.notifications = new notificationsClass();
    data.cache = new CacheManager();
    data.adCoordinator = new AdCoordinatorGuest();

    // tslint:disable-next-line no-floating-promises
    data.cache.start();

    data.register('characters', Characters(connection));
    data.register('channels', Channels(connection, core.characters));
    data.register('conversations', Conversations());

    connection.onEvent('connecting', async() => {
        await data.reloadSettings();
        data.bbCodeParser = createBBCodeParser();
    });
}

export interface Core {
    readonly connection: Connection
    readonly logs: Logs
    readonly state: StateInterface
    readonly settingsStore: Settings.Store
    readonly conversations: Conversation.State
    readonly characters: Character.State
    readonly channels: Channel.State
    readonly bbCodeParser: BBCodeParser
    readonly notifications: Notifications
    readonly cache: CacheManager
    readonly adCoordinator: AdCoordinatorGuest;

    watch<T>(getter: (this: VueState) => T, callback: WatchHandler<T>): void
}

const core = <Core><any>data; /*tslint:disable-line:no-any*///hack

export default core;
