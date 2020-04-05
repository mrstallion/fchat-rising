<template>
    <!-- hiding elements instead of using 'v-if' is used here as an optimization -->
    <div class="image-preview-wrapper" :class="{interactive: sticky, visible: visible}">
        <div class="image-preview-toolbar" v-show="sticky || debug">
            <a @click="toggleDevMode()" :class="{toggled: debug}" title="Debug Mode"><i class="fa fa-terminal"></i></a>
            <a @click="toggleJsMode()" :class="{toggled: runJs}" title="Expand Images"><i class="fa fa-magic"></i></a>
            <a @click="reloadUrl()" title="Reload Image"><i class="fa fa-redo-alt"></i></a>
            <a @click="reset()" title="Reset Image Viewer"><i class="fa fa-recycle"></i></a>
            <a @click="toggleStickyMode()" :class="{toggled: sticky}" title="Toggle Stickyness"><i class="fa fa-thumbtack"></i></a>
        </div>

        <!-- note: preload requires a webpack config CopyPlugin configuration -->
        <webview
            preload="./preview/assets/browser.pre.js"
            src="about:blank"
            nodeintegration
            webpreferences="allowRunningInsecureContent, autoplayPolicy=no-user-gesture-required"
            id="image-preview-ext"
            ref="imagePreviewExt"
            class="image-preview-external"
            :style="externalPreviewStyle">
        </webview>

        <div
            class="image-preview-local"
            :style="localPreviewStyle"
        >
        </div>

        <i id="preview-spinner" class="fas fa-circle-notch fa-spin" v-show="shouldShowSpinner"></i>
        <i id="preview-error" class="fas fa-times" v-show="shouldShowError"></i>
    </div>
</template>

<script lang="ts">
    import * as _ from 'lodash';
    import {Component, Hook} from '@f-list/vue-ts';
    import Vue from 'vue';
    import core from '../core';
    import { EventBus, EventBusEvent } from './event-bus';
    import {domain} from '../../bbcode/core';
    import {ImageDomMutator} from './image-dom-mutator';

    import { ExternalImagePreviewHelper, LocalImagePreviewHelper } from './helper';

    import {Point, WebviewTag, remote} from 'electron';
    import Timer = NodeJS.Timer;
    import IpcMessageEvent = Electron.IpcMessageEvent;


    const screen = remote.screen;

    interface DidFailLoadEvent extends Event {
        errorCode: number;
        errorDescription: string;
    }

    interface DidNavigateEvent extends Event {
        httpResponseCode: number;
        httpStatusText: string;
    }


    @Component
    export default class ImagePreview extends Vue {
        private readonly MinTimePreviewVisible = 100;

        visible = false;

        externalPreviewHelper = new ExternalImagePreviewHelper(this);
        localPreviewHelper = new LocalImagePreviewHelper(this);

        url: string | null = null;
        domain: string | undefined;

        sticky = false;
        runJs = true;
        debug = false;

        jsMutator = new ImageDomMutator(this.debug);

        externalPreviewStyle: Record<string, any> = {};
        localPreviewStyle: Record<string, any> = {};

        state = 'hidden';

        shouldShowSpinner = false;
        shouldShowError = true;


        private interval: Timer | null = null;

        private exitInterval: Timer | null = null;
        private exitUrl: string | null = null;

        private initialCursorPosition: Point | null = null;
        private shouldDismiss = false;
        private visibleSince = 0;

        @Hook('mounted')
        onMounted(): void {
            console.warn('Mounted ImagePreview');

            // tslint:disable-next-line:no-floating-promises
            this.jsMutator.init();

            EventBus.$on(
                'imagepreview-dismiss',
                (eventData: EventBusEvent) => {
                    // console.log('Event dismiss', eventData.url);
                    this.dismiss(eventData.url as string, eventData.force as boolean);
                }
            );

            EventBus.$on(
                'imagepreview-show',
                (eventData: EventBusEvent) => {
                    // console.log('Event show', eventData.url);

                    if (!core.state.settings.risingLinkPreview) {
                        return;
                    }

                    this.show(eventData.url as string);
                }
            );

            EventBus.$on(
                'imagepreview-toggle-stickyness',
                (eventData: EventBusEvent) => {
                    if (!core.state.settings.risingLinkPreview) {
                        return;
                    }

                    const eventUrl = this.jsMutator.mutateUrl(eventData.url as string);

                    if ((this.url === eventUrl) && (this.visible))
                        this.sticky = !this.sticky;
                }
            );

            const webview = this.getWebview();

            webview.addEventListener(
                'update-target-url', // 'did-navigate', // 'dom-ready',
                (event: EventBusEvent) => {
                    const url = webview.getURL();
                    const js = this.jsMutator.getMutatorJsForSite(url, 'update-target-url');

                    // tslint:disable-next-line
                    this.executeJavaScript(js, 'update-target-url', event);
                }
            );


            webview.addEventListener(
                'dom-ready', // 'did-navigate', // 'dom-ready',
                (event: EventBusEvent) => {
                    const url = webview.getURL();
                    const js = this.jsMutator.getMutatorJsForSite(url, 'dom-ready');

                    // tslint:disable-next-line
                    this.executeJavaScript(js, 'dom-ready', event);

                    this.setState('loaded');
                }
            );


            webview.addEventListener(
                'did-fail-load',
                (event: Event) => {

                    const e = event as DidFailLoadEvent;

                    if (e.errorCode !== -3) {
                        this.setState('error'); // -3 is a weird error code, not sure why it occurs
                    }


                    if (e.errorCode < 0) {
                        const url = webview.getURL();

                        if (url.match(/^https?:\/\/(www.)?pornhub.com/)) {
                            const qjs = this.jsMutator.getMutatorJsForSite(url, 'update-target-url')
                                || this.jsMutator.getMutatorJsForSite(url, 'dom-ready');

                            // tslint:disable-next-line
                            this.executeJavaScript(qjs, 'did-fail-load-but-still-loading', event);
                            return;
                        }

                        // console.error('DID FAIL LOAD', event);
                        // const url = this.getUrl() || '';
                        //
                        // const qjs = this.jsMutator.getMutatorJsForSite(url, 'update-target-url')
                        //   || this.jsMutator.getMutatorJsForSite(url, 'dom-ready');
                        //
                        // // tslint:disable-next-line
                        // this.executeJavaScript(qjs, 'did-fail-load-but-still-loading', event);
                        return;
                    }

                    // if (e.errorCode < 100) {
                    //   const url = webview.getURL();
                    //   const js = this.jsMutator.getMutatorJsForSite(url, 'update-target-url');
                    //
                    //   this.executeJavaScript(js, 'did-fail-load-but-still-loading', event);
                    //
                    //   return;
                    // }

                    const js = this.jsMutator.getErrorMutator(e.errorCode, e.errorDescription);

                    // tslint:disable-next-line
                    this.executeJavaScript(js, 'did-fail-load', event);
                }
            );

            webview.addEventListener(
                'did-navigate',
                (event: Event) => {
                    const e = event as DidNavigateEvent;

                    if (e.httpResponseCode >= 400) {
                        const js = this.jsMutator.getErrorMutator(e.httpResponseCode, e.httpStatusText);

                        // tslint:disable-next-line
                        this.executeJavaScript(js, 'did-navigate', event);
                    }
                }
            );

            // webview.getWebContents().on(
            webview.addEventListener(
                'did-finish-load',
                (event: Event) => {
                    this.debugLog('ImagePreview did-finish-load', event);
                }
            );


            webview.addEventListener(
                'ipc-message',
                (event: IpcMessageEvent) => {
                    this.debugLog('ImagePreview ipc-message', event);

                    if (event.channel === 'webview.img') {
                        // tslint:disable-next-line:no-unsafe-any
                        this.updatePreviewSize(parseInt(event.args[0], 10), parseInt(event.args[1], 10));
                    }
                }
            );


            // const webContentsId = webview.getWebContentsId();
            //
            // remote.webContents.fromId(webContentsId).session.on(
            //     'will-download',
            //     (e: Event) => {
            //         e.preventDefault();
            //     }
            // );


            _.each(
                ['did-start-loading', 'load-commit', 'dom-ready', 'will-navigate', 'did-navigate', 'did-navigate-in-page', 'update-target-url', 'ipc-message'],
                (en: string) => {
                    webview.addEventListener(
                        en,
                        (event: Event) => {
                            this.debugLog(`ImagePreview ${en} ${Date.now()}`, event);
                        }
                    );
                }
            );


            setInterval(
                () => {
                    if (((this.visible) && (!this.exitInterval) && (!this.shouldDismiss)) || (this.interval))
                        this.initialCursorPosition = screen.getCursorScreenPoint();

                    if ((this.visible) && (this.shouldDismiss) && (this.hasMouseMovedSince()) && (!this.exitInterval) && (!this.interval)) {
                        this.debugLog('ImagePreview: call hide from interval');

                        this.hide();
                    }

                    this.shouldShowSpinner = this.testSpinner();
                    this.shouldShowError = this.testError();
                },
                50
            );
        }


        reRenderStyles(): void {
            // tslint:disable-next-line:no-unsafe-any
            this.externalPreviewStyle = this.externalPreviewHelper.renderStyle();
            // tslint:disable-next-line:no-unsafe-any
            this.localPreviewStyle = this.localPreviewHelper.renderStyle();

            this.debugLog(
                'ImagePreview: reRenderStyles', 'external',
                JSON.parse(JSON.stringify(this.externalPreviewStyle)),
                'local', JSON.parse(JSON.stringify(this.localPreviewStyle))
            );
        }


        updatePreviewSize(width: number, height: number): void {
            if (!this.externalPreviewHelper.isVisible()) {
                return;
            }

            if ((width) && (height)) {
                this.debugLog('ImagePreview: updatePreviewSize', width, height, width / height);

                this.externalPreviewHelper.setRatio(width / height);
                this.reRenderStyles();
            }
        }


        hide(): void {
            this.debugLog('ImagePreview: hide', this.externalPreviewHelper.isVisible(), this.localPreviewHelper.isVisible());

            this.cancelExitTimer();

            this.url = null;
            this.visible = false;

            this.localPreviewHelper.hide();
            this.externalPreviewHelper.hide();

            this.exitUrl = null;
            this.exitInterval = null;

            this.shouldDismiss = false;

            this.sticky = false;

            this.setState('hidden');

            this.reRenderStyles();
        }

        dismiss(initialUrl: string, force: boolean = false): void {
            const url = this.jsMutator.mutateUrl(initialUrl);

            this.debugLog('ImagePreview: dismiss', url);

            if (this.url !== url)
                return; // simply ignore

            // if (this.debug)
            //    return;

            if (this.sticky)
                return;

            // console.log('DISMISS');

            const due = this.visible ? this.MinTimePreviewVisible - Math.min(this.MinTimePreviewVisible, (Date.now() - this.visibleSince)) : 0;

            this.cancelTimer();

            if (this.exitInterval)
                return;

            this.exitUrl = this.url;
            this.shouldDismiss = true;

            if ((!this.hasMouseMovedSince()) && (!force))
                return;

            this.debugLog('ImagePreview: dismiss.exec', this.externalPreviewHelper.isVisible(), this.localPreviewHelper.isVisible(), url);

            // This timeout makes the preview window disappear with a slight delay, which helps UX
            // when dealing with situations such as quickly scrolling text that moves the cursor away
            // from the link
            // tslint:disable-next-line no-unnecessary-type-assertion
            this.exitInterval = setTimeout(
                () => this.hide(),
                due
            ) as Timer;
        }

        show(initialUrl: string): void {
            const url = this.jsMutator.mutateUrl(initialUrl);

            this.debugLog('ImagePreview: show', this.externalPreviewHelper.isVisible(), this.localPreviewHelper.isVisible(),
                this.visible, this.hasMouseMovedSince(), !!this.interval, this.sticky, url);

            // console.log('SHOW');

            if ((this.visible) && (!this.exitInterval) && (!this.hasMouseMovedSince())) {
                this.debugLog('ImagePreview: show cancel: visible & not moved');
                return;
            }

            if ((this.url === url) && ((this.visible) || (this.interval))) {
                this.debugLog('ImagePreview: same url', url, this.url);
                return;
            }

            if ((this.url) && (this.sticky) && (this.visible)) {
                this.debugLog('ImagePreview: sticky visible');
                return;
            }

            this.debugLog('ImagePreview: show.exec', url);

            const due = ((url === this.exitUrl) && (this.exitInterval)) ? 0 : 100;

            this.url = url;
            this.domain = domain(url);

            this.cancelExitTimer();
            this.cancelTimer();

            // This timer makes sure that just by accidentally brushing across a link won't show (blink) the preview
            // -- you actually have to pause on it
            // tslint:disable-next-line no-unnecessary-type-assertion
            this.interval = setTimeout(
                () => {
                    this.debugLog('ImagePreview: show.timeout', this.url);

                    const isLocal = this.localPreviewHelper.match(this.domain as string);

                    isLocal
                        ? this.localPreviewHelper.show(this.url as string)
                        : this.localPreviewHelper.hide();

                    this.externalPreviewHelper.match(this.domain as string)
                        ? this.externalPreviewHelper.show(this.url as string)
                        : this.externalPreviewHelper.hide();

                    this.interval = null;
                    this.visible = true;
                    this.visibleSince = Date.now();
                    this.shouldDismiss = false;

                    this.initialCursorPosition = screen.getCursorScreenPoint();

                    this.reRenderStyles();

                    this.setState(isLocal ? 'loaded' : 'loading');
                },
                due
            ) as Timer;
        }

        hasMouseMovedSince(): boolean {
            if (!this.initialCursorPosition)
                return true;

            try {
                const p = screen.getCursorScreenPoint();

                return ((p.x !== this.initialCursorPosition.x) || (p.y !== this.initialCursorPosition.y));
            } catch (err) {
                console.error('ImagePreview', err);
                return true;
            }
        }

        cancelTimer(): void {
            if (this.interval)
                clearTimeout(this.interval);

            this.interval = null;
        }

        cancelExitTimer(): void {
            if (this.exitInterval)
                clearTimeout(this.exitInterval);

            this.exitInterval = null;
        }

        isVisible(): boolean {
            return this.visible;
        }

        getUrl(): string | null {
            return this.url;
        }

        /* isExternalUrl(): boolean {
            // 'f-list.net' is tested here on purpose, because keeps the character URLs from being previewed
            return !((this.domain === 'f-list.net') || (this.domain === 'static.f-list.net'));
        }

        isInternalUrl(): boolean {
            return !this.isExternalUrl();
        }*/

        toggleDevMode(): void {
            this.debug = !this.debug;

            this.jsMutator.setDebug(this.debug);
            this.localPreviewHelper.setDebug(this.debug);
            this.externalPreviewHelper.setDebug(this.debug);

            if (this.debug) {
                const webview = this.getWebview();

                webview.openDevTools();
            }
        }


        async executeJavaScript(js: string | undefined, context: string = 'unknown', logDetails?: any): Promise<any> {
            const webview = this.getWebview();

            if (!js) {
                this.debugLog(`ImagePreview ${context}: No JavaScript to execute`, logDetails);
                return;
            }

            this.debugLog(`ImagePreview execute-${context}`, js, logDetails);

            try {
                const result = await (webview.executeJavaScript(js) as unknown as Promise<any>);

                this.debugLog(`ImagePreview result-${context}`, result);

                return result;
            } catch (err) {
                this.debugLog(`ImagePreview error-${context}`, err);
            }
        }

        debugLog(...args: any[]): void {
            if (this.debug) {
                console.log(...args);
            }
        }


        toggleStickyMode(): void {
            this.sticky = !this.sticky;

            if (!this.sticky)
                this.hide();
        }

        toggleJsMode(): void {
            this.runJs = !this.runJs;
        }

        reloadUrl(): void {
            if (this.externalPreviewHelper.isVisible()) {
                const webview = this.getWebview();

                webview.reload();
            }
        }

        getWebview(): WebviewTag {
            return this.$refs.imagePreviewExt as WebviewTag;
        }


        reset(): void {
            this.externalPreviewHelper = new ExternalImagePreviewHelper(this);
            this.localPreviewHelper = new LocalImagePreviewHelper(this);

            this.url = null;
            this.domain = undefined;

            this.sticky = false;
            this.runJs = true;
            this.debug = false;

            this.jsMutator = new ImageDomMutator(this.debug);

            this.cancelExitTimer();
            this.cancelTimer();

            this.exitUrl = null;

            this.initialCursorPosition = null;
            this.shouldDismiss = false;
            this.visibleSince = 0;
            this.shouldShowSpinner = false;
            this.shouldShowError = false;

            this.setState('hidden');

            this.reRenderStyles();
        }


        setState(state: string): void {
            this.debugLog('ImagePreview set-state', state, (this.visibleSince > 0) ? `${(Date.now() - this.visibleSince) / 1000}s` : '');

            this.state = state;
            this.shouldShowSpinner = this.testSpinner();
            this.shouldShowError = this.testError();
        }


        testSpinner(): boolean {
            return (this.visibleSince > 0)
                ? ((this.state === 'loading') && (Date.now() - this.visibleSince > 1000))
                : false;
        }

        testError(): boolean {
            return ((this.state === 'error') && (this.externalPreviewHelper.isVisible()));
        }
    }
</script>


<style lang="scss">
    @import "../../node_modules/bootstrap/scss/functions";
    @import "../../node_modules/bootstrap/scss/variables";
    @import "../../node_modules/bootstrap/scss/mixins/breakpoints";

    .image-preview-wrapper {
        z-index: 10000;
        display: none;
        position: absolute;
        left: 0;
        top: 0;
        width: 50%;
        height: 70%;
        pointer-events: none;
        overflow: visible;

        &.visible {
            display: block;
        }

        &.interactive {
            pointer-events: auto;

            .image-preview-local,
            .image-preview-auto {
                // pointer-events: auto;
            }
        }

        .image-preview-external {
            /* position: absolute;
            width: 50%;
            height: 70%;
            top: 0;
            left: 0; */
            width: 100%;
            height: 100%;
            // pointer-events: none;
            background-color: black;
        }

        .image-preview-local {
            /* position: absolute;
            width: 50%;
            height: 70%;
            top: 0;
            left: 0; */
            width: 100%;
            height: 100%;
            // pointer-events: none;
            background-size: contain;
            background-position: top left;
            background-repeat: no-repeat;
            // background-color: black;
        }


        .image-preview-toolbar {
            position: absolute;
            /* background-color: green; */
            left: 0;
            top: 0;
            margin: 1rem;
            height: 3.5rem;
            display: flex;
            -webkit-backdrop-filter: blur(10px);
            flex-direction: row;
            width: 15rem;
            flex-wrap: nowrap;
            background-color: rgba(77, 76, 116, 0.92);
            border-radius: 3px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.5rem;
            box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.2);

            a i.fa {
                font-size: 1.25rem;
                top: 50%;
                position: relative;
                transform: translateY(-50%);
            }

            a {
                flex: 1;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: 3px;
                margin-right: 0.5rem;
                background-color: rgba(0, 0, 0, 0.1);
            }

            a:last-child {
                margin-right: 0;
            }

            .toggled {
                background-color: rgba(255, 255, 255, 0.2);
                box-shadow: 0 0 1px 0px rgba(255, 255, 255, 0.6);
            }
        }

        #preview-spinner {
            color: white;
            opacity: 0.5;
            transition: visibility 0.25s, opacity 0.25s;
            font-size: 30pt;
            position: absolute;
            left: 1rem;
            top: 1rem;
            transform: translateX(-50%), translateY(-50%);
            text-shadow: 0 0 2px #b3b3b3;
        }

        #preview-error {
            color: red;
            transition: all 0.25s;
            font-size: 180pt;
            position: absolute;
            left: 2rem;
            top: 0;
            opacity: 0.8;
        }
    }
</style>
