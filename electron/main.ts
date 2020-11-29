/**
 * @license
 * MIT License
 *
 * Copyright (c) 2018 F-List
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This license header applies to this file and all of the non-third-party assets it includes.
 * @file The entry point for the Electron main thread of F-Chat 3.0.
 * @copyright 2018 F-List
 * @author Maya Wolf <maya@f-list.net>
 * @version 3.0
 * @see {@link https://github.com/f-list/exported|GitHub repo}
 */

// import { DebugLogger } from './debug-logger';
// // @ts-ignore
// const dl = new DebugLogger('main');

import * as electron from 'electron';
import log from 'electron-log'; //tslint:disable-line:match-default-export-name
import * as fs from 'fs';
import * as path from 'path';
// import * as url from 'url';
import l from '../chat/localize';
import {defaultHost, GeneralSettings} from './common';
import { getSafeLanguages, knownLanguageNames, updateSupportedLanguages } from './language';
import * as windowState from './window_state';
import BrowserWindow = Electron.BrowserWindow;
import MenuItem = Electron.MenuItem;
import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fetch from 'node-fetch';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import * as _ from 'lodash';
import DownloadItem = Electron.DownloadItem;
import { AdCoordinatorHost } from '../chat/ads/ad-coordinator-host';
import { IpcMainEvent } from 'electron';

//tslint:disable-next-line:no-require-imports
const pck = require('./package.json');

// Module to control application life.
const app = electron.app;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const windows: Electron.BrowserWindow[] = [];
const characters: string[] = [];
let tabCount = 0;

const baseDir = app.getPath('userData');
fs.mkdirSync(baseDir, {recursive: true});
let shouldImportSettings = false;

const settingsDir = path.join(baseDir, 'data');
fs.mkdirSync(settingsDir, {recursive: true});
const settingsFile = path.join(settingsDir, 'settings');
const settings = new GeneralSettings();

if(!fs.existsSync(settingsFile)) shouldImportSettings = true;
else
    try {
        Object.assign(settings, <GeneralSettings>JSON.parse(fs.readFileSync(settingsFile, 'utf8')));
    } catch(e) {
        log.error(`Error loading settings: ${e}`);
    }

if(!settings.hwAcceleration) {
    log.info('Disabling hardware acceleration.');
    app.disableHardwareAcceleration();
}

// async function setDictionary(lang: string | undefined): Promise<void> {
//     if(lang !== undefined) await ensureDictionary(lang);
//     settings.spellcheckLang = lang;
//     setGeneralSettings(settings);
// }


export function updateSpellCheckerLanguages(langs: string[]): void {
    // console.log('UPDATESPELLCHECKERLANGUAGES', langs);

    // console.log('Language support:', langs);
    electron.session.defaultSession.setSpellCheckerLanguages(langs);

    for (const w of windows) {
        // console.log('LANG SEND');
        w.webContents.session.setSpellCheckerLanguages(langs);
        w.webContents.send('update-dictionaries', langs);
    }
}


async function toggleDictionary(lang: string): Promise<void> {
    const activeLangs = getSafeLanguages(settings.spellcheckLang);

    // console.log('INITIAL LANG', activeLangs, lang);

    let newLangs: string[] = [];

    if (_.indexOf(activeLangs, lang) >= 0) {
        newLangs = _.reject(activeLangs, (al) => (al === lang));
    } else {
        activeLangs.push(lang);
        newLangs = activeLangs;
    }

    settings.spellcheckLang = newLangs;

    setGeneralSettings(settings);

    // console.log('NEW LANG', newLangs);

    updateSpellCheckerLanguages(newLangs);
}

function setGeneralSettings(value: GeneralSettings): void {
    fs.writeFileSync(path.join(settingsDir, 'settings'), JSON.stringify(value));
    for(const w of electron.webContents.getAllWebContents()) w.send('settings', settings);

    shouldImportSettings = false;

    log.transports.file.level = settings.risingSystemLogLevel;
    log.transports.console.level = settings.risingSystemLogLevel;
}

async function addSpellcheckerItems(menu: Electron.Menu): Promise<void> {
    const selected = getSafeLanguages(settings.spellcheckLang);
    const langs = electron.session.defaultSession.availableSpellCheckerLanguages;

    const sortedLangs = _.sortBy(
        _.map(
            langs,
            (lang) => ({lang, name: (lang in knownLanguageNames) ? `${(knownLanguageNames as any)[lang]} (${lang})` : lang})
        ),
        'name'
    );

    for (const lang of sortedLangs)
        menu.append(new electron.MenuItem({
            type: 'checkbox',
            label: lang.name,
            checked: (_.indexOf(selected, lang.lang) >= 0),
            click: async() => toggleDictionary(lang.lang)
        }));
}

function setUpWebContents(webContents: Electron.WebContents): void {
    const openLinkExternally = (e: Event, linkUrl: string) => {
        e.preventDefault();
        const profileMatch = linkUrl.match(/^https?:\/\/(www\.)?f-list.net\/c\/([^/#]+)\/?#?/);
        if(profileMatch !== null && settings.profileViewer) webContents.send('open-profile', decodeURIComponent(profileMatch[2]));
        else return electron.shell.openExternal(linkUrl);
    };

    webContents.on('will-navigate', openLinkExternally);
    webContents.on('new-window', openLinkExternally);
}

function createWindow(): Electron.BrowserWindow | undefined {
    if(tabCount >= 3) return;
    const lastState = windowState.getSavedWindowState();
    const windowProperties: Electron.BrowserWindowConstructorOptions & {maximized: boolean} = {
        ...lastState, center: lastState.x === undefined, show: false,
        webPreferences: { webviewTag: true, nodeIntegration: true, spellcheck: true, enableRemoteModule: true }
    };

    if(process.platform === 'darwin') {
        windowProperties.titleBarStyle = 'hiddenInset';
        // windowProperties.frame = true;
    } else {
       windowProperties.frame = false;
    }

    const window = new electron.BrowserWindow(windowProperties);
    windows.push(window);

    updateSupportedLanguages(electron.session.defaultSession.availableSpellCheckerLanguages);

    const safeLanguages = getSafeLanguages(settings.spellcheckLang);

    // console.log('CREATEWINDOW', safeLanguages);
    electron.session.defaultSession.setSpellCheckerLanguages(safeLanguages);
    window.webContents.session.setSpellCheckerLanguages(safeLanguages);

    log.debug('adblock.init');

    // tslint:disable-next-line:no-floating-promises
    ElectronBlocker.fromLists(
        fetch,
   [
            'https://easylist.to/easylist/easylist.txt',
            'https://easylist.to/easylist/easyprivacy.txt', // EasyPrivacy
            'https://easylist-downloads.adblockplus.org/easylist-cookie.txt', // Easy Cookies
            'https://easylist.to/easylist/fanboy-social.txt', // Fanboy Social
            'https://easylist.to/easylist/fanboy-annoyance.txt', // Fanboy Annoyances
            'https://filters.adtidy.org/extension/chromium/filters/2.txt', // AdGuard Base
            'https://filters.adtidy.org/extension/chromium/filters/11.txt', // AdGuard Mobile Ads
            'https://filters.adtidy.org/extension/chromium/filters/4.txt', // AdGuard Social Media
            'https://filters.adtidy.org/extension/chromium/filters/14.txt', // AdGuard Annoyances
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances.txt', // uBlock Origin Annoyances
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt', // uBlock Origin Filters
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt', // uBlock Origin Privacy
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt', // uBlock Origin Badware
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resource-abuse.txt', // uBlock Origin Resource Abuse
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt' // uBlock Origin Unbreak
        ],
        {
            enableCompression: true
        },
        {
            path: path.join(baseDir, 'adblocker.bin'),
            read: fs.promises.readFile,
            write: fs.promises.writeFile
        }
    ).then(
        (blocker) => {
            log.debug('adblock.load.complete');

            blocker.enableBlockingInSession(electron.session.defaultSession);

            // Temp fix -- manually override adblocker's preload script
            // to point to CJS  that has been copied over with config in webpack.config.js
            const preloadScript = './preview/assets/adblocker/preload.cjs.js'; // require.resolve('@cliqz/adblocker-electron-preload');

            // const originPath = require.resolve('@cliqz/adblocker-electron-preload');
            // const preloadScript = path.resolve(path.dirname(originPath), 'preload.cjs.js');
            log.debug('adblock.preload.path', { finalPath: preloadScript /*, originPath */ });

            electron.session.defaultSession.setPreloads(
                _.concat(
                    _.filter(
                        electron.session.defaultSession.getPreloads(),
                        (p) => (p.indexOf('adblocker-electron-preload') < 0)
                    ),
                    [preloadScript]
                )
            );

            log.debug('adblock.preloaders', { loaders: electron.session.defaultSession.getPreloads() });

            blocker.on('request-blocked', (request: Request) => {
                log.debug('adblock.request.blocked', { url: request.url });
            });

            blocker.on('request-redirected', (request: Request) => {
                log.debug('adblock.request.redirected', { url: request.url });
            });

            blocker.on('request-whitelisted', (request: Request) => {
                log.debug('adblock.request.whitelisted', { url: request.url });
            });

            blocker.on('csp-injected', (request: Request) => {
                log.debug('adblock.inject.csp', { url: request.url });
            });

            blocker.on('script-injected', (script: string, url: string) => {
                log.debug('adblock.inject.script', { length: script.length, url });
            });

            blocker.on('style-injected', (style: string, url: string) => {
                log.debug('adblock.inject.style', { length: style.length, url });
            });
        }
    ).catch(
      (err) => {
        log.warn('adblock.init.error', 'Adblocker failed to initialize.'
            + 'This does not break F-Chat Rising, but may produce slower image previews', err);
      }
    );


    // This prevents automatic download prompts on certain webview URLs without
    // stopping conversation logs from being downloaded
    electron.session.defaultSession.on(
        'will-download',
        (e: Event, item: DownloadItem) => {
            if (!item.getURL().match(/^blob:file:/)) {
                log.info('download.prevent', { item, event: e });
                e.preventDefault();
            }
        }
    );

    // console.log('GOT HERE');

    // tslint:disable-next-line:no-floating-promises
    window.loadFile(
        path.join(__dirname, 'window.html'),
        {
            query: {settings: JSON.stringify(settings), import: shouldImportSettings ? 'true' : ''}
        }
    );


    // window.loadURL(url.format({ //tslint:disable-line:no-floating-promises
    //     pathname: path.join(__dirname, 'window.html'),
    //     protocol: 'file:',
    //     slashes: true,
    //     query: {settings: JSON.stringify(settings), import: shouldImportSettings ? 'true' : []}
    // }));

    setUpWebContents(window.webContents);

    // Save window state when it is being closed.
    window.on('close', () => windowState.setSavedWindowState(window));
    window.on('closed', () => windows.splice(windows.indexOf(window), 1));
    window.once('ready-to-show', () => {
        window.show();
        if(lastState.maximized) window.maximize();
    });

    return window;
}

function showPatchNotes(): void {
    //tslint:disable-next-line: no-floating-promises
    electron.shell.openExternal('https://github.com/mrstallion/fchat-rising/blob/master/CHANGELOG.md');
}


function onReady(): void {
    let hasCompletedUpgrades = false;

    const logLevel = (process.env.NODE_ENV === 'production') ? 'info' : 'silly';

    log.transports.file.level = settings.risingSystemLogLevel || logLevel;
    log.transports.console.level = settings.risingSystemLogLevel || logLevel;
    log.transports.file.maxSize = 5 * 1024 * 1024;

    log.info('Starting application.');

    app.setAppUserModelId('com.squirrel.fchat.F-Chat');
    app.on('open-file', createWindow);

    if(settings.version !== app.getVersion()) {
        showPatchNotes();
        if(settings.host === 'wss://chat.f-list.net:9799')
            settings.host = defaultHost;
        settings.version = app.getVersion();
        setGeneralSettings(settings);
    }

    // require('update-electron-app')(
    //   {
    //     repo: 'https://github.com/mrstallion/fchat-rising.git',
    //     updateInterval: '3 hours',
    //     logger: require('electron-log')
    //   }
    // );

    //tslint:disable-next-line: no-unsafe-any
    const updaterUrl = `https://update.electronjs.org/mrstallion/fchat-rising/${process.platform}-${process.arch}/${pck.version}`;
    if((process.env.NODE_ENV === 'production') && (process.platform !== 'darwin')) {
        electron.autoUpdater.setFeedURL({url: updaterUrl + (settings.beta ? '?channel=beta' : ''), serverType: 'json'});
        setTimeout(() => electron.autoUpdater.checkForUpdates(), 10000);
        const updateTimer = setInterval(() => electron.autoUpdater.checkForUpdates(), 3600000);
        electron.autoUpdater.on('update-downloaded', () => {
            clearInterval(updateTimer);
            const menu = electron.Menu.getApplicationMenu()!;
            const item = menu.getMenuItemById('update') as MenuItem | null;
            if(item !== null) item.visible = true;
            else
                menu.append(new electron.MenuItem({
                    label: l('action.updateAvailable'),
                    submenu: electron.Menu.buildFromTemplate([{
                        label: l('action.update'),
                        click: () => {
                            for(const w of windows) w.webContents.send('quit');
                            electron.autoUpdater.quitAndInstall();
                        }
                    }, {
                        label: l('help.changelog'),
                        click: showPatchNotes
                    }]),
                    id: 'update'
                }));
            electron.Menu.setApplicationMenu(menu);
            for(const w of windows) w.webContents.send('update-available', true);
        });
        electron.autoUpdater.on('update-not-available', () => {
            for(const w of windows) w.webContents.send('update-available', false);
            const item = electron.Menu.getApplicationMenu()!.getMenuItemById('update') as MenuItem | null;
            if(item !== null) item.visible = false;
        });
        electron.autoUpdater.on('error', (e) => log.error(e));
    }

    const viewItem = {
        label: `&${l('action.view')}`,
        submenu: <Electron.MenuItemConstructorOptions[]>[
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
        ]
    };
    if(process.env.NODE_ENV !== 'production')
        viewItem.submenu.unshift({role: 'reload'}, {role: 'forceReload'}, {role: 'toggleDevTools'}, {type: 'separator'});
    const spellcheckerMenu = new electron.Menu();
    //tslint:disable-next-line:no-floating-promises
    addSpellcheckerItems(spellcheckerMenu);
    const themes = fs.readdirSync(path.join(__dirname, 'themes')).filter((x) => x.substr(-4) === '.css').map((x) => x.slice(0, -4));
    const setTheme = (theme: string) => {
        settings.theme = theme;
        setGeneralSettings(settings);
    };

    const setSystemLogLevel = (logLevell: log.LevelOption) => {
        settings.risingSystemLogLevel = logLevell;
        setGeneralSettings(settings);
    };

    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate([
        {
            label: `&${l('title')}`,
            submenu: [
                {
                    label: l('action.newWindow'),
                    click: () => {
                        if (hasCompletedUpgrades) createWindow();
                    },
                    accelerator: 'CmdOrCtrl+n'
                },
                {
                    label: l('action.newTab'),
                    click: (_m: Electron.MenuItem, w: Electron.BrowserWindow) => {
                        if((hasCompletedUpgrades) && (tabCount < 3)) w.webContents.send('open-tab');
                    },
                    accelerator: 'CmdOrCtrl+t'
                },
                {
                    label: l('settings.logDir'),
                    click: (_m, window: BrowserWindow) => {
                        const dir = electron.dialog.showOpenDialogSync(
                            {defaultPath: settings.logDirectory, properties: ['openDirectory']});
                        if(dir !== undefined) {
                            if(dir[0].startsWith(path.dirname(app.getPath('exe'))))
                                return electron.dialog.showErrorBox(l('settings.logDir'), l('settings.logDir.inAppDir'));
                            const button = electron.dialog.showMessageBoxSync(window, {
                                message: l('settings.logDir.confirm', dir[0], settings.logDirectory),
                                buttons: [l('confirmYes'), l('confirmNo')],
                                cancelId: 1
                            });
                            if(button === 0) {
                                for(const w of windows) w.webContents.send('quit');
                                settings.logDirectory = dir[0];
                                setGeneralSettings(settings);
                                app.quit();
                            }
                        }
                    }
                },
                {
                    label: l('settings.closeToTray'), type: 'checkbox', checked: settings.closeToTray,
                    click: (item: Electron.MenuItem) => {
                        settings.closeToTray = item.checked;
                        setGeneralSettings(settings);
                    }
                }, {
                    label: l('settings.profileViewer'), type: 'checkbox', checked: settings.profileViewer,
                    click: (item: Electron.MenuItem) => {
                        settings.profileViewer = item.checked;
                        setGeneralSettings(settings);
                    }
                },
                {label: l('settings.spellcheck'), submenu: spellcheckerMenu},
                {
                    label: l('settings.theme'),
                    submenu: themes.map((x) => ({
                        checked: settings.theme === x,
                        click: () => setTheme(x),
                        label: x,
                        type: <'radio'>'radio'
                    }))
                }, {
                    label: l('settings.hwAcceleration'), type: 'checkbox', checked: settings.hwAcceleration,
                    click: (item: Electron.MenuItem) => {
                        settings.hwAcceleration = item.checked;
                        setGeneralSettings(settings);
                    }
                },

                // {
                //     label: l('settings.beta'), type: 'checkbox', checked: settings.beta,
                //     click: async(item: Electron.MenuItem) => {
                //         settings.beta = item.checked;
                //         setGeneralSettings(settings);
                //         // electron.autoUpdater.setFeedURL({url: updaterUrl+(item.checked ? '?channel=beta' : ''), serverType: 'json'});
                //         // return electron.autoUpdater.checkForUpdates();
                //     }
                // },
                {
                    label: l('fixLogs.action'),
                    click: (_m, window: BrowserWindow) => window.webContents.send('fix-logs')
                },

                {type: 'separator'},
                {
                    label: 'Rising',
                    submenu: [
                        {
                            label: 'System log level',
                            submenu: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'].map((level: string) => (
                                {
                                    checked: settings.risingSystemLogLevel === level,
                                    label: `${level.substr(0, 1).toUpperCase()}${level.substr(1)}`,
                                    click: () => setSystemLogLevel(level as log.LevelOption),
                                    type: <'radio'>'radio'
                                }
                            ))
                        }
                    ]
                },
                {
                    label: 'Show/hide current profile',
                    click: (_m: Electron.MenuItem, w: Electron.BrowserWindow) => {
                        w.webContents.send('reopen-profile');
                    },
                    accelerator: 'CmdOrCtrl+p'
                },


                {type: 'separator'},
                {role: 'minimize'},
                {
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : undefined,
                    label: l('action.quit'),
                    click(_m: Electron.MenuItem, window: Electron.BrowserWindow): void {
                        if(characters.length === 0) return app.quit();
                        const button = electron.dialog.showMessageBoxSync(window, {
                            message: l('chat.confirmLeave'),
                            buttons: [l('confirmYes'), l('confirmNo')],
                            cancelId: 1
                        });
                        if(button === 0) {
                            for(const w of windows) w.webContents.send('quit');
                            app.quit();
                        }
                    }
                }
            ] as MenuItemConstructorOptions[]
        }, {
            label: `&${l('action.edit')}`,
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'selectall'}
            ] as MenuItemConstructorOptions[]
        }, viewItem, {
            label: `&${l('help')}`,
            submenu: [
                {
                    label: l('help.fchat'),
                    click: () => electron.shell.openExternal('https://github.com/mrstallion/fchat-rising/blob/master/README.md')
                },
                // {
                //     label: l('help.feedback'),
                //     click: () => electron.shell.openExternal('https://goo.gl/forms/WnLt3Qm3TPt64jQt2')
                // },
                {
                    label: l('help.rules'),
                    click: () => electron.shell.openExternal('https://wiki.f-list.net/Rules')
                },
                {
                    label: l('help.faq'),
                    click: () => electron.shell.openExternal('https://wiki.f-list.net/Frequently_Asked_Questions')
                },
                {
                    label: l('help.report'),
                    click: () => electron.shell.openExternal('https://wiki.f-list.net/How_to_Report_a_User#In_chat')
                },
                {label: l('version', app.getVersion()), click: showPatchNotes}
            ]
        }
    ]));
    electron.ipcMain.on('tab-added', (_event: Event, id: number) => {
        const webContents = electron.webContents.fromId(id);
        setUpWebContents(webContents);
        ++tabCount;
        if(tabCount === 3)
            for(const w of windows) w.webContents.send('allow-new-tabs', false);
    });
    electron.ipcMain.on('tab-closed', () => {
        --tabCount;
        for(const w of windows) w.webContents.send('allow-new-tabs', true);
    });
    electron.ipcMain.on('save-login', (_event: Event, account: string, host: string) => {
        settings.account = account;
        settings.host = host;
        setGeneralSettings(settings);
    });
    electron.ipcMain.on('connect', (e: Event & {sender: Electron.WebContents}, character: string) => {
        if(characters.indexOf(character) !== -1) return e.returnValue = false;
        characters.push(character);
        e.returnValue = true;
    });
    electron.ipcMain.on('dictionary-add', (_event: Event, word: string) => {
        // if(settings.customDictionary.indexOf(word) !== -1) return;
        // settings.customDictionary.push(word);
        // setGeneralSettings(settings);
        for(const w of windows) w.webContents.session.addWordToSpellCheckerDictionary(word);
    });
    electron.ipcMain.on('dictionary-remove', (_event: Event /*, word: string*/) => {
        // settings.customDictionary.splice(settings.customDictionary.indexOf(word), 1);
        // setGeneralSettings(settings);
    });
    electron.ipcMain.on('disconnect', (_event: Event, character: string) => {
        const index = characters.indexOf(character);
        if(index !== -1) characters.splice(index, 1);
    });


    const adCoordinator = new AdCoordinatorHost();
    electron.ipcMain.on('request-send-ad', (event: IpcMainEvent, adId: string) => (adCoordinator.processAdRequest(event, adId)));


    const emptyBadge = electron.nativeImage.createEmpty();

    const badge = electron.nativeImage.createFromPath(
        //tslint:disable-next-line:no-require-imports no-unsafe-any
        path.join(__dirname, <string>require('./build/badge.png').default)
    );

    electron.ipcMain.on('has-new', (e: Event & {sender: Electron.WebContents}, hasNew: boolean) => {
        if(process.platform === 'darwin') app.dock.setBadge(hasNew ? '!' : '');
        const window = electron.BrowserWindow.fromWebContents(e.sender) as BrowserWindow | undefined;
        if(window !== undefined) window.setOverlayIcon(hasNew ? badge : emptyBadge, hasNew ? 'New messages' : '');
    });

    electron.ipcMain.on('rising-upgrade-complete', () => {
        hasCompletedUpgrades = true;
        for(const w of electron.webContents.getAllWebContents()) w.send('rising-upgrade-complete');
    });

    createWindow();
}

const isSquirrelStart = require('electron-squirrel-startup'); //tslint:disable-line:no-require-imports
if(isSquirrelStart || process.env.NODE_ENV === 'production' && !app.requestSingleInstanceLock()) app.quit();
else app.on('ready', onReady);
app.on('second-instance', createWindow);
app.on('window-all-closed', () => app.quit());
