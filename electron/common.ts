import * as electron from 'electron';
import * as fs from 'fs';
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

export function mkdir(dir: string): void {
    try {
        fs.mkdirSync(dir);
    } catch(e) {
        if(!(e instanceof Error)) throw e;
        switch((<Error & {code: string}>e).code) {
            case 'ENOENT':
                const dirname = path.dirname(dir);
                if(dirname === dir) throw e;
                mkdir(dirname);
                mkdir(dir);
                break;
            default:
                try {
                    const stat = fs.statSync(dir);
                    if(stat.isDirectory()) return;
                } catch(e) {
                    console.log(e);
                }
                throw e;
        }
    }
}

//tslint:disable
const Module = require('module');

export function nativeRequire<T>(module: string): T {
    return Module.prototype.require.call({paths: Module._nodeModulePaths(__dirname)}, module);
}

//tslint:enable