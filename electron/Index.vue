<template>
    <div @mouseover="onMouseOver" id="page" style="position:relative;padding:5px 10px 10px" :class="getThemeClass()" @auxclick.prevent>
        <div v-html="styling"></div>
        <div v-if="!characters" style="display:flex; align-items:center; justify-content:center; height: 100%;">
            <div class="card bg-light" style="width: 400px;">
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
        <logs ref="logsDialog"></logs>
    </div>
</template>

<script lang="ts">
    import {Component, Hook} from '@f-list/vue-ts';
    import Axios from 'axios';
    import * as electron from 'electron';
    import log from 'electron-log'; //tslint:disable-line:match-default-export-name
    import * as fs from 'fs';
    import * as path from 'path';
    import * as qs from 'querystring';
    import Raven from 'raven-js';
    import {promisify} from 'util';
    import Vue from 'vue';
    import Chat from '../chat/Chat.vue';
    import {getKey, Settings} from '../chat/common';
    import core from '../chat/core';
    import l from '../chat/localize';
    import Logs from '../chat/Logs.vue';
    import Socket from '../chat/WebSocket';
    import Modal from '../components/Modal.vue';
    import {SimpleCharacter} from '../interfaces';
    import {Keys} from '../keys';
//    import { BetterSqliteStore } from '../learn/store/better-sqlite3';
//     import { Sqlite3Store } from '../learn/store/sqlite3';
    import CharacterPage from '../site/character_page/character_page.vue';
    import {defaultHost, GeneralSettings, nativeRequire} from './common';
    import {fixLogs} from './filesystem';
    import * as SlimcatImporter from './importer';

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


    log.info('About to load keytar');

    /* tslint:disable: no-any no-unsafe-any */ //because this is hacky

    const keyStore = nativeRequire<{
        getPassword(account: string): Promise<string>
        setPassword(account: string, password: string): Promise<void>
        deletePassword(account: string): Promise<void>
        [key: string]: (...args: any[]) => Promise<any>
    }>('keytar/build/Release/keytar.node');
    for(const key in keyStore) keyStore[key] = promisify(<(...args: any[]) => any>keyStore[key].bind(keyStore, 'fchat'));
    //tslint:enable
    log.info('Loaded keytar.');

    @Component({
        components: {chat: Chat, modal: Modal, characterPage: CharacterPage, logs: Logs}
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
        importProgress = 0;
        profileName = '';
        adName = '';
        fixCharacters: ReadonlyArray<string> = [];
        fixCharacter = '';

        @Hook('created')
        created(): void {
            if(this.settings.account.length > 0) this.saveLogin = true;
            keyStore.getPassword(this.settings.account)
                .then((value: string) => this.password = value, (err: Error) => this.error = err.message);

            Vue.set(core.state, 'generalSettings', this.settings);

            electron.ipcRenderer.on('settings',
                (_: Event, settings: GeneralSettings) => core.state.generalSettings = this.settings = settings);

            electron.ipcRenderer.on('open-profile', (_: Event, name: string) => {
                const profileViewer = <Modal>this.$refs['profileViewer'];
                this.profileName = name;
                profileViewer.show();
            });

            electron.ipcRenderer.on('fix-logs', async() => {
                this.fixCharacters = await core.settingsStore.getAvailableCharacters();
                this.fixCharacter = this.fixCharacters[0];
                (<Modal>this.$refs['fixLogsModal']).show();
            });
            window.addEventListener('keydown', (e) => {
                if(getKey(e) === Keys.Tab && e.ctrlKey && !e.altKey && !e.shiftKey)
                    parent.send('switch-tab', this.character);
            });

            /*if (process.env.NODE_ENV !== 'production') {
                const dt = require('@vue/devtools');

                dt.connect();
            }*/

        }

        async login(): Promise<void> {
            if(this.loggingIn) return;
            this.loggingIn = true;
            try {
                if(!this.saveLogin) await keyStore.deletePassword(this.settings.account);

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
                    await keyStore.setPassword(this.settings.account, this.password);
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


        getThemeClass(): string {
            return `theme-${this.settings.theme}`;
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
    }
</script>

<style>
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
</style>
