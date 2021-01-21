<template>
    <div @mouseover="onMouseOver" id="page" style="position:relative;padding:5px 10px 10px" :class="getThemeClass()" @auxclick.prevent>
        <div v-html="styling"></div>
        <div v-if="!characters" style="display:flex; align-items:center; justify-content:center; height: 100%;">
            <div class="card bg-light" style="width: 400px;">
                <div class="initializer" :class="{visible: !hasCompletedUpgrades, complete: hasCompletedUpgrades, shouldShow: shouldShowSpinner}">
                    <div class="title">
                        Getting ready, please wait...
                        <small>You should only experience this delay once per software update</small>
                    </div>
                    <i class="fas fa-circle-notch fa-spin search-spinner"></i>
                </div>

                <h3 class="card-header" style="margin-top:0;display:flex">
                    {{l('title')}}

                    <a href="#" @click.prevent="showLogs()" class="btn" style="flex:1;text-align:right">
                        <span class="fa fa-file-alt"></span> <span class="btn-text">{{l('logs.title')}}</span>
                    </a>
                </h3>
                <div class="card-body">
                    <div class="alert alert-danger" v-show="error">
                        {{error}}
                    </div>
                    <div class="form-group">
                        <label class="control-label" for="account">{{l('login.account')}}</label>
                        <input class="form-control" id="account" v-model="settings.account" @keypress.enter="login()"
                            :disabled="loggingIn"/>
                    </div>
                    <div class="form-group">
                        <label class="control-label" for="password">{{l('login.password')}}</label>
                        <input class="form-control" type="password" id="password" v-model="password" @keypress.enter="login()"
                            :disabled="loggingIn"/>
                    </div>
                    <div class="form-group" v-show="showAdvanced">
                        <label class="control-label" for="host">{{l('login.host')}}</label>
                        <div class="input-group">
                            <input class="form-control" id="host" v-model="settings.host" @keypress.enter="login()" :disabled="loggingIn"/>
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary" @click="resetHost()"><span class="fas fa-undo-alt"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="advanced"><input type="checkbox" id="advanced" v-model="showAdvanced"/> {{l('login.advanced')}}</label>
                    </div>
                    <div class="form-group">
                        <label for="save"><input type="checkbox" id="save" v-model="saveLogin"/> {{l('login.save')}}</label>
                    </div>
                    <div class="form-group" style="margin:0;text-align:right">
                        <button class="btn btn-primary" @click="login" :disabled="loggingIn">
                            {{l(loggingIn ? 'login.working' : 'login.submit')}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <chat v-else :ownCharacters="characters" :defaultCharacter="defaultCharacter" ref="chat"></chat>
        <div ref="linkPreview" class="link-preview"></div>
        <modal :action="l('importer.importing')" ref="importModal" :buttons="false">
            <span style="white-space:pre-wrap">{{l('importer.importingNote')}}</span>
            <div class="progress" style="margin-top:5px">
                <div class="progress-bar" :style="{width: importProgress * 100 + '%'}"></div>
            </div>
        </modal>
        <modal :buttons="false" ref="profileViewer" dialogClass="profile-viewer">
            <character-page :authenticated="true" :oldApi="true" :name="profileName" :image-preview="true" ref="characterPage"></character-page>
            <template slot="title">
                {{profileName}}
                <a class="btn" @click="openProfileInBrowser"><i class="fa fa-external-link-alt"/></a>
                <a class="btn" @click="openConversation"><i class="fa fa-comment"></i></a>
                <a class="btn" @click="reloadCharacter"><i class="fa fa-sync" /></a>

                <i class="fas fa-circle-notch fa-spin profileRefreshSpinner" v-show="isRefreshingProfile()"></i>

                <div class="profile-title-right">
                  <button class="btn" @click="prevProfile" :disabled="!prevProfileAvailable()"><i class="fas fa-arrow-left"></i></button>
                  <button class="btn" @click="nextProfile" :disabled="!nextProfileAvailable()"><i class="fas fa-arrow-right"></i></button>
                </div>
            </template>
        </modal>
        <modal :action="l('fixLogs.action')" ref="fixLogsModal" @submit="fixLogs" buttonClass="btn-danger">
            <span style="white-space:pre-wrap">{{l('fixLogs.text')}}</span>
            <div class="form-group">
                <label class="control-label">{{l('fixLogs.character')}}</label>
                <select id="import" class="form-control" v-model="fixCharacter">
                    <option v-for="character in fixCharacters" :value="character">{{character}}</option>
                </select>
            </div>
        </modal>
        <modal :buttons="false" ref="wordDefinitionViewer" dialogClass="word-definition-viewer">
            <word-definition :expression="wordDefinitionLookup" ref="characterPage"></word-definition>
            <template slot="title">
                {{wordDefinitionLookup}}

                <a class="btn wordDefBtn dictionary" @click="openDefinitionWithDictionary"><i>D</i></a>
                <a class="btn wordDefBtn thesaurus" @click="openDefinitionWithThesaurus"><i>T</i></a>
                <a class="btn wordDefBtn urbandictionary" @click="openDefinitionWithUrbanDictionary"><i>UD</i></a>
                <a class="btn wordDefBtn wikipedia" @click="openDefinitionWithWikipedia"><i>W</i></a>
            </template>
        </modal>
        <logs ref="logsDialog"></logs>
    </div>
</template>

<script lang="ts">
    import { Component, Hook, Watch } from '@f-list/vue-ts';
    import Axios from 'axios';
    import * as electron from 'electron';
    import log from 'electron-log'; //tslint:disable-line:match-default-export-name
    import * as fs from 'fs';
    import * as path from 'path';
    import * as qs from 'querystring';
    import Raven from 'raven-js';
    // import {promisify} from 'util';
    import Vue from 'vue';
    import Chat from '../chat/Chat.vue';
    import {getKey, Settings} from '../chat/common';
    import core /*, { init as initCore }*/ from '../chat/core';
    import l from '../chat/localize';
    import Logs from '../chat/Logs.vue';
    import Socket from '../chat/WebSocket';
    import Modal from '../components/Modal.vue';
    import {SimpleCharacter} from '../interfaces';
    import {Keys} from '../keys';
    // import { BetterSqliteStore } from '../learn/store/better-sqlite3';
    // import { Sqlite3Store } from '../learn/store/sqlite3';
    import CharacterPage from '../site/character_page/character_page.vue';
    import WordDefinition from '../learn/dictionary/WordDefinition.vue';
    import {defaultHost, GeneralSettings, nativeRequire} from './common';
    import { fixLogs /*SettingsStore, Logs as FSLogs*/ } from './filesystem';
    import * as SlimcatImporter from './importer';
    import _ from 'lodash';
    import { EventBus } from '../chat/preview/event-bus';
    import { DefinitionDictionary } from '../learn/dictionary/definition-dictionary';
    // import Bluebird from 'bluebird';
    // import Connection from '../fchat/connection';
    // import Notifications from './notifications';

    const webContents = electron.remote.getCurrentWebContents();
    const parent = electron.remote.getCurrentWindow().webContents;

    // Allow requests to imgur.com
    const session = electron.remote.session;

    /* tslint:disable:no-unsafe-any no-any no-unnecessary-type-assertion */
    session!.defaultSession!.webRequest!.onBeforeSendHeaders(
        {
            urls: [
                'https://(api|i).imgur.com/.*',
                'http://(api|i).imgur.com/.*'
            ]
        },
        (details: any, callback: any) => {
            details.requestHeaders['Origin'] = null;
            details.headers['Origin'] = null;

            callback({requestHeaders: details.requestHeaders});
        }
    );


    log.info('init.chat.keytar.load.start');

    /* tslint:disable: no-any no-unsafe-any */ //because this is hacky
    //

    const keyStore = nativeRequire<
      {
        getPassword(service: string, account: string): Promise<string>
        setPassword(service: string, account: string, password: string): Promise<void>
        deletePassword(service: string, account: string): Promise<void>
        findCredentials(service: string): Promise<{ account: string, password: string }>
        findPassword(service: string): Promise<string>
        [key: string]: (...args: any[]) => Promise<any>
      }
    >('keytar/build/Release/keytar.node');

    // const keyStore = import('keytar');
    //
    // for(const key in keyStore) keyStore[key] = promisify(<(...args: any[]) => any>keyStore[key].bind(keyStore, 'fchat'));
    //tslint:enable

    log.info('init.chat.keytar.load.done');

    @Component({
        components: {chat: Chat, modal: Modal, characterPage: CharacterPage, logs: Logs, 'word-definition': WordDefinition}
    })
    export default class Index extends Vue {
        showAdvanced = false;
        saveLogin = false;
        loggingIn = false;
        password = '';
        character?: string;
        characters?: SimpleCharacter[];
        error = '';
        defaultCharacter?: number;
        l = l;
        settings!: GeneralSettings;
        hasCompletedUpgrades!: boolean;
        importProgress = 0;
        profileName = '';
        adName = '';
        fixCharacters: ReadonlyArray<string> = [];
        fixCharacter = '';
        wordDefinitionLookup = '';

        shouldShowSpinner = false;

        profileNameHistory: string[] = [];
        profilePointer = 0;


        async startAndUpgradeCache(): Promise<void> {
            log.debug('init.chat.cache.start');

            const timer = setTimeout(
              () => {
                this.shouldShowSpinner = true;
              },
              250
            );

            // tslint:disable-next-line no-floating-promises
            await core.cache.start(this.settings, this.hasCompletedUpgrades);

            log.debug('init.chat.cache.done');

            clearTimeout(timer);

            parent.send('rising-upgrade-complete');
            electron.ipcRenderer.send('rising-upgrade-complete');

            this.hasCompletedUpgrades = true;
        }


        @Watch('profileName')
        onProfileNameChange(newName: string): void {
          if (this.profileNameHistory[this.profilePointer] !== newName) {
            this.profileNameHistory = _.takeRight(
              _.filter(
                _.take(this.profileNameHistory, this.profilePointer + 1),
                (n) => (n !== newName)
              ),
              30
            );

            this.profileNameHistory.push(newName);

            this.profilePointer = this.profileNameHistory.length - 1;
          }
        }


        @Hook('mounted')
        onMounted(): void {
            log.debug('init.chat.mounted');

            EventBus.$on(
              'word-definition',
              (data: any) => {
                this.wordDefinitionLookup = data.lookupWord;

                if (!!data.lookupWord) {
                  (<Modal>this.$refs.wordDefinitionViewer).show();
                }
              }
            );
        }


        @Hook('created')
        async created(): Promise<void> {
            await this.startAndUpgradeCache();

            if(this.settings.account.length > 0) this.saveLogin = true;

            keyStore.getPassword('f-list.net', this.settings.account)
                .then((value: string) => this.password = value, (err: Error) => this.error = err.message);

            log.debug('init.chat.keystore.get.done');

            Vue.set(core.state, 'generalSettings', this.settings);

            electron.ipcRenderer.on('settings',
                (_e: Event, settings: GeneralSettings) => core.state.generalSettings = this.settings = settings);

            electron.ipcRenderer.on('open-profile', (_e: Event, name: string) => {
                const profileViewer = <Modal>this.$refs['profileViewer'];
                this.profileName = name;
                profileViewer.show();
            });

            electron.ipcRenderer.on('reopen-profile', (_e: Event) => {
              if (
                (this.profileNameHistory.length > 0)
                && (this.profilePointer < this.profileNameHistory.length)
                && (this.profilePointer >= 0)
              ) {
                const name = this.profileNameHistory[this.profilePointer];
                const profileViewer = <Modal>this.$refs['profileViewer'];

                if ((this.profileName === name) && (profileViewer.isShown)) {
                  profileViewer.hide();
                  return;
                }

                this.profileName = name;
                profileViewer.show();
              }
            });

            electron.ipcRenderer.on('fix-logs', async() => {
                this.fixCharacters = await core.settingsStore.getAvailableCharacters();
                this.fixCharacter = this.fixCharacters[0];
                (<Modal>this.$refs['fixLogsModal']).show();
            });

            window.addEventListener('keydown', (e) => {
                const key = getKey(e);

                if ((key === Keys.Tab) && (e.ctrlKey) && (!e.altKey)) {
                    parent.send(`${e.shiftKey ? 'previous' : 'switch'}-tab`, this.character);
                }

                if (((key === Keys.PageDown) || (key === Keys.PageUp)) && (e.ctrlKey) && (!e.altKey) && (!e.shiftKey)) {
                  parent.send(`${key === Keys.PageUp ? 'previous' : 'switch'}-tab`, this.character);
                }
            });

            log.debug('init.chat.listeners.done');

            /*if (process.env.NODE_ENV !== 'production') {
                const dt = require('@vue/devtools');

                dt.connect();
            }*/
        }

        async login(): Promise<void> {
            if(this.loggingIn) return;
            this.loggingIn = true;
            try {
                if(!this.saveLogin) await keyStore.deletePassword('f-list.net', this.settings.account);

                core.siteSession.setCredentials(this.settings.account, this.password);

                const data = <{ticket?: string, error: string, characters: {[key: string]: number}, default_character: number}>
                    (await Axios.post('https://www.f-list.net/json/getApiTicket.php', qs.stringify({
                        account: this.settings.account, password: this.password, no_friends: true, no_bookmarks: true,
                        new_character_list: true
                    }))).data;
                if(data.error !== '') {
                    this.error = data.error;
                    return;
                }
                if(this.saveLogin) {
                    electron.ipcRenderer.send('save-login', this.settings.account, this.settings.host);
                    await keyStore.setPassword('f-list.net', this.settings.account, this.password);
                }
                Socket.host = this.settings.host;

                core.connection.onEvent('connecting', async() => {
                    if(!electron.ipcRenderer.sendSync('connect', core.connection.character) && process.env.NODE_ENV === 'production') {
                        alert(l('login.alreadyLoggedIn'));
                        return core.connection.close();
                    }
                    parent.send('connect', webContents.id, core.connection.character);
                    this.character = core.connection.character;
                    if((await core.settingsStore.get('settings')) === undefined &&
                        SlimcatImporter.canImportCharacter(core.connection.character)) {
                        if(!confirm(l('importer.importGeneral'))) return core.settingsStore.set('settings', new Settings());
                        (<Modal>this.$refs['importModal']).show(true);
                        await SlimcatImporter.importCharacter(core.connection.character, (progress) => this.importProgress = progress);
                        (<Modal>this.$refs['importModal']).hide();
                    }
                });
                core.connection.onEvent('connected', () => {
                    core.watch(() => core.conversations.hasNew, (newValue) => parent.send('has-new', webContents.id, newValue));
                    Raven.setUserContext({username: core.connection.character});
                });
                core.connection.onEvent('closed', () => {
                    if(this.character === undefined) return;
                    electron.ipcRenderer.send('disconnect', this.character);
                    this.character = undefined;
                    parent.send('disconnect', webContents.id);
                    Raven.setUserContext();
                });
                core.connection.setCredentials(this.settings.account, this.password);
                this.characters = Object.keys(data.characters).map((name) => ({name, id: data.characters[name], deleted: false}))
                    .sort((x, y) => x.name.localeCompare(y.name));
                this.defaultCharacter = data.default_character;
            } catch(e) {
                this.error = l('login.error');
                log.error('connect.error', e);
                if(process.env.NODE_ENV !== 'production') throw e;
            } finally {
                this.loggingIn = false;
            }
        }

        fixLogs(): void {
            if(!electron.ipcRenderer.sendSync('connect', this.fixCharacter)) return alert(l('login.alreadyLoggedIn'));
            try {
                fixLogs(this.fixCharacter);
                alert(l('fixLogs.success'));
            } catch(e) {
                alert(l('fixLogs.error'));
                throw e;
            } finally {
                electron.ipcRenderer.send('disconnect', this.fixCharacter);
            }
        }

        resetHost(): void {
            this.settings.host = defaultHost;
        }

        onMouseOver(e: MouseEvent): void {
            const preview = (<HTMLDivElement>this.$refs.linkPreview);
            if((<HTMLElement>e.target).tagName === 'A') {
                const target = <HTMLAnchorElement>e.target;
                if(target.hostname !== '') {
                    //tslint:disable-next-line:prefer-template
                    preview.className = 'link-preview ' +
                        (e.clientX < window.innerWidth / 2 && e.clientY > window.innerHeight - 150 ? ' right' : '');
                    preview.textContent = target.href;
                    preview.style.display = 'block';
                    return;
                }
            }
            preview.textContent = '';
            preview.style.display = 'none';
        }

        async openProfileInBrowser(): Promise<void> {
            await electron.remote.shell.openExternal(`https://www.f-list.net/c/${this.profileName}`);

            // tslint:disable-next-line: no-any no-unsafe-any
            (this.$refs.profileViewer as any).hide();
        }

        openConversation(): void {
            //this.
            // this.profileName
            const character = core.characters.get(this.profileName);
            const conversation = core.conversations.getPrivate(character);

            conversation.show();

            // tslint:disable-next-line: no-any no-unsafe-any
            (this.$refs.profileViewer as any).hide();
        }


        isRefreshingProfile(): boolean {
          const cp = this.$refs.characterPage as CharacterPage;

          return cp && cp.refreshing;
        }


        reloadCharacter(): void {
            // tslint:disable-next-line: no-any no-unsafe-any
            (this.$refs.characterPage as any).reload();
        }


        getThemeClass(): Record<string, boolean> {
          try {
            return {
              [`theme-${this.settings.theme}`]: true,
              colorblindMode: core.state.settings.risingColorblindMode
            };
          } catch(err) {
            return { [`theme-${this.settings.theme}`]: true };
          }
        }

        nextProfile(): void {
          if (!this.nextProfileAvailable()) {
            return;
          }

          this.profilePointer++;
          this.profileName = this.profileNameHistory[this.profilePointer];
        }


        nextProfileAvailable(): boolean {
          return (this.profilePointer < this.profileNameHistory.length - 1);
        }


        prevProfile(): void {
          if (!this.prevProfileAvailable()) {
            return;
          }

          this.profilePointer--;
          this.profileName = this.profileNameHistory[this.profilePointer];
        }


        prevProfileAvailable(): boolean {
          return (this.profilePointer > 0);
        }


        get styling(): string {
            try {
                return `<style>${fs.readFileSync(path.join(__dirname, `themes/${this.settings.theme}.css`), 'utf8').toString()}</style>`;
            } catch(e) {
                if((<Error & {code: string}>e).code === 'ENOENT' && this.settings.theme !== 'default') {
                    this.settings.theme = 'default';
                    return this.styling;
                }
                throw e;
            }
        }

        showLogs(): void {
            (<Logs>this.$refs['logsDialog']).show();
        }


        getCleanedWordDefinition(): string {
          return DefinitionDictionary.cleanExpression(this.wordDefinitionLookup);
        }

        async openDefinitionWithDictionary(): Promise<void> {
            await electron.remote.shell.openExternal(`https://www.dictionary.com/browse/${encodeURI(this.getCleanedWordDefinition())}`);
        }


        async openDefinitionWithThesaurus(): Promise<void> {
            await electron.remote.shell.openExternal(`https://www.thesaurus.com/browse/${encodeURI(this.getCleanedWordDefinition())}`);
        }


        async openDefinitionWithUrbanDictionary(): Promise<void> {
            await electron.remote.shell.openExternal(`https://www.urbandictionary.com/define.php?term=${encodeURIComponent(this.getCleanedWordDefinition())}`);
        }


        async openDefinitionWithWikipedia(): Promise<void> {
            await electron.remote.shell.openExternal(`https://en.wikipedia.org/wiki/${encodeURI(this.getCleanedWordDefinition())}`);
        }
    }
</script>

<style lang="scss">
    html, body, #page {
        height: 100%;
    }

    a[href^="#"]:not([draggable]) {
        -webkit-user-drag: none;
        -webkit-app-region: no-drag;
    }


    .profileRefreshSpinner {
        font-size: 12pt;
        opacity: 0.5;
    }


    .profile-viewer {
      .modal-title {
        width: 100%;
        position: relative;

        .profile-title-right {
          float: right;
          bottom: 7px;
          right: 0;
          position: absolute;
        }
      }
    }


    .initializer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        backdrop-filter: blur(3px) grayscale(35%);

        &.shouldShow {
            transition: all 0.25s;

            &.visible {
                opacity: 1;
            }
        }

        &.complete {
            pointer-events: none !important;
        }

        i {
            font-size: 130pt;
            top: 50%;
            right: 50%;
            transform: translate(-50%, -50%);
            width: fit-content;
        }

        .title {
            position: absolute;
            top: 0;
            background: rgba(147, 255, 215, 0.6);
            width: 100%;
            text-align: center;
            padding-top: 20px;
            padding-bottom: 20px;
            font-weight: bold;

            small {
                display: block;
                opacity: 0.8;
            }
        }
    }


    .btn.wordDefBtn {
        background-color: red;
        padding: 0.2rem 0.2rem;
        line-height: 90%;
        margin-right: 0.2rem;
        text-align: center;

        i {
            font-style: normal !important;
            color: white;
            font-weight: bold
        }

        &.thesaurus {
            background-color: #F44725
        }

        &.urbandictionary {
            background-color: #d96a36;

            i {
                color: #fadf4b;
            }
        }

        &.dictionary {
            background-color: #314ca7;
        }

        &.wikipedia {
            background-color: white;

            i {
                color: black;
            }
        }
    }
</style>
