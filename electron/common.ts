import * as electron from 'electron';
import * as path from 'path';

export const defaultHost = 'wss://chat.f-list.net/chat2';

export class GeneralSettings {
    account = '';
    closeToTray = true;
    profileViewer = true;
    host = defaultHost;
    logDirectory = path.join(electron.app.getPath('userData'), 'data');
    spellcheckLang: string | undefined = 'en_GB';
    theme = 'default';
    version = electron.app.getVersion();
    beta = false;
    customDictionary: string[] = [];
    hwAcceleration = true;
}

//tslint:disable
const Module = require('module');

export function nativeRequire<T>(module: string): T {
    return Module.prototype.require.call({paths: Module._nodeModulePaths(__dirname)}, module);
}

//tslint:enable