import * as qs from 'querystring';
import log from 'electron-log'; //tslint:disable-line:match-default-export-name

import {GeneralSettings} from './common';
import Window from './Window.vue';

const logLevel = (process.env.NODE_ENV === 'production') ? 'info' : 'silly';

log.transports.file.level = logLevel;
log.transports.console.level = logLevel;
log.transports.file.maxSize = 5 * 1024 * 1024;


const params = <{[key: string]: string | undefined}>qs.parse(window.location.search.substr(1));
const settings = <GeneralSettings>JSON.parse(params['settings']!);
//tslint:disable-next-line:no-unused-expression
new Window({
    el: '#app',
    data: {settings}
});
