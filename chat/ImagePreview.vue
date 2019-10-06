<template>
    <!-- hiding elements instead of using 'v-if' is used here as an optimization -->
    <div class="image-preview-wrapper" :class="{visible: visible, interactive: sticky}">
        <div class="image-preview-toolbar" v-if="sticky || debug">
            <a @click="toggleDevMode()" :class="{toggled: debug}" title="Debug Mode"><i class="fa fa-terminal"></i></a>
            <a @click="toggleJsMode()" :class="{toggled: runJs}" title="Expand Images"><i class="fa fa-magic"></i></a>
            <a @click="reloadUrl()" title="Reload Image"><i class="fa fa-redo-alt"></i></a>
            <a @click="toggleStickyMode()" :class="{toggled: sticky}" title="Toggle Stickyness"><i class="fa fa-thumbtack"></i></a>
        </div>

        <webview src="about:blank" webpreferences="allowRunningInsecureContent, autoplayPolicy=no-user-gesture-required" id="image-preview-ext" ref="imagePreviewExt" class="image-preview-external" :style="{display: externalPreviewHelper.isVisible() ? 'flex' : 'none'}"></webview>

        <div
            class="image-preview-local"
            :style="{backgroundImage: `url(${localPreviewHelper.getUrl()})`, display: localPreviewHelper.isVisible() ? 'block' : 'none'}"
        >
        </div>
    </div>
</template>

<script lang="ts">
    import * as _ from 'lodash';
    import {Component, Hook} from '@f-list/vue-ts';
    import Vue from 'vue';
    import { EventBus, EventBusEvent } from './event-bus';
    import {domain} from '../bbcode/core';
    import {ImagePreviewMutator} from './image-preview-mutator';
    import {Point, screen, WebviewTag} from 'electron';
    import Timer = NodeJS.Timer;


    interface DidFailLoadEvent extends Event {
        errorCode: number;
        errorDescription: string;
    }

    interface DidNavigateEvent extends Event {
        httpResponseCode: number;
        httpStatusText: string;
    }


    abstract class ImagePreviewHelper {
        protected visible = false;
        protected url: string | null = 'about:blank';
        protected parent: ImagePreview;

        abstract show(url: string): void;
        abstract hide(): void;
        abstract match(domainName: string): boolean;

        constructor(parent: ImagePreview) {
            this.parent = parent;
        }

        isVisible(): boolean {
            return this.visible;
        }

        getUrl(): string | null {
            return this.url;
        }
    }


    class LocalImagePreviewHelper extends ImagePreviewHelper {
        hide(): void {
            this.visible = false;
            this.url = null;
        }


        show(url: string): void {
            this.visible = true;
            this.url = url;
        }


        match(domainName: string): boolean {
            return ((domainName === 'f-list.net') || (domainName === 'static.f-list.net'));
        }
    }


    class ExternalImagePreviewHelper extends ImagePreviewHelper {
        protected lastExternalUrl: string | null = null;

        protected allowCachedUrl = true;

        hide(): void {
            const wasVisible = this.visible;

            if (this.parent.debug)
                console.log('ImagePreview: exec hide mutator');

            if (wasVisible) {
                const webview = this.parent.getWebview();

                if (this.allowCachedUrl) {
                    webview.executeJavaScript(this.parent.jsMutator.getHideMutator());
                } else {
                    webview.loadURL('about:blank');
                }

                this.visible = false;
            }
        }


        show(url: string): void {
            const webview = this.parent.getWebview();

            try {
                if ((this.allowCachedUrl) && ((webview.getURL() === url) || (url === this.lastExternalUrl))) {
                    if (this.parent.debug)
                        console.log('ImagePreview: exec re-show mutator');

                    webview.executeJavaScript(this.parent.jsMutator.getReShowMutator());
                } else {
                    if (this.parent.debug)
                        console.log('ImagePreview: must load; skip re-show because urls don\'t match', this.url, webview.getURL());

                    webview.loadURL(url);
                }

            } catch (err) {
                console.error('ImagePreview: Webview reuse error', err);
            }

            this.url = url;
            this.lastExternalUrl = url;
            this.visible = true;
        }

        match(domainName: string): boolean {
            return !((domainName === 'f-list.net') || (domainName === 'static.f-list.net'));
        }
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

        jsMutator = new ImagePreviewMutator(this.debug);

        private interval: Timer | null = null;

        private exitInterval: Timer | null = null;
        private exitUrl: string | null = null;

        private initialCursorPosition: Point | null = null;
        private shouldDismiss = false;
        private visibleSince = 0;

        @Hook('mounted')
        onMounted(): void {
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

                    this.show(eventData.url as string);
                }
            );

            EventBus.$on(
                'imagepreview-toggle-stickyness',
                (eventData: EventBusEvent) => {
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

                    if (this.debug)
                        console.log('ImagePreview update-target', event, js);

                    if ((js) && (this.runJs))
                        webview.executeJavaScript(js);
                }
            );


            webview.addEventListener(
                'dom-ready', // 'did-navigate', // 'dom-ready',
                (event: EventBusEvent) => {
                    const url = webview.getURL();
                    const js = this.jsMutator.getMutatorJsForSite(url, 'dom-ready');

                    if (this.debug)
                        console.log('ImagePreview dom-ready', event, js);

                    if ((js) && (this.runJs))
                        webview.executeJavaScript(js, true);
                }
            );


            webview.addEventListener(
                'did-fail-load',
                (event: Event) => {
                    const e = event as DidFailLoadEvent;

                    const js = this.jsMutator.getErrorMutator(e.errorCode, e.errorDescription);

                    if (this.debug)
                        console.log('ImagePreview did-fail-load', event, js);

                    if ((js) && (this.runJs) && (e.errorCode >= 400))
                        webview.executeJavaScript(js);
                }
            );

            webview.addEventListener(
                'did-navigate',
                (event: Event) => {
                    const e = event as DidNavigateEvent;

                    if (e.httpResponseCode >= 400) {
                        const js = this.jsMutator.getErrorMutator(e.httpResponseCode, e.httpStatusText);

                        if (this.debug)
                            console.log('ImagePreview did-navigate', event, js);

                        if ((js) && (this.runJs))
                            webview.executeJavaScript(js);
                    }
                }
            );

            // webview.getWebContents().on(
            webview.addEventListener(
                'did-finish-load',
                (event: Event) => {
                    if (this.debug)
                        console.log('ImagePreview did-finish-load', event);

                    webview.getWebContents().session.on(
                        'will-download',
                        (e: Event) => {
                            e.preventDefault();
                        }
                    );
                }
            );


            _.each(
                ['did-start-loading', 'load-commit', 'dom-ready', 'will-navigate', 'did-navigate', 'did-navigate-in-page', 'update-target-url'],
                (en: string) => {
                    webview.addEventListener(
                        en,
                        (event: Event) => {
                            if (this.debug)
                                console.log(`ImagePreview ${en} ${Date.now()}`, event);
                        }
                    );
                }
            );


            setInterval(
                () => {
                    if (((this.visible) && (!this.exitInterval) && (!this.shouldDismiss)) || (this.interval))
                        this.initialCursorPosition = screen.getCursorScreenPoint();

                    if ((this.visible) && (this.shouldDismiss) && (this.hasMouseMovedSince()) && (!this.exitInterval) && (!this.interval)) {
                        if (this.debug) {
                            console.log('ImagePreview: call hide from interval');
                        }

                        this.hide();
                    }
                },
                10
            );
        }

        hide(): void {
            if (this.debug)
                console.log('ImagePreview: hide', this.externalPreviewHelper.isVisible(), this.localPreviewHelper.isVisible());

            this.cancelExitTimer();

            this.url = null;
            this.visible = false;

            this.localPreviewHelper.hide();
            this.externalPreviewHelper.hide();

            this.exitUrl = null;
            this.exitInterval = null;

            this.shouldDismiss = false;

            this.sticky = false;
        }

        dismiss(initialUrl: string, force: boolean = false): void {
            const url = this.jsMutator.mutateUrl(initialUrl);

            if (this.debug) {
                console.log('ImagePreview: dismiss', url);
            }

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

            if (this.debug)
                console.log('ImagePreview: dismiss.exec', this.externalPreviewHelper.isVisible(), this.localPreviewHelper.isVisible(), url);

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

            if (this.debug)
                console.log('ImagePreview: show', this.externalPreviewHelper.isVisible(), this.localPreviewHelper.isVisible(),
                this.visible, this.hasMouseMovedSince(), !!this.interval, this.sticky, url);

            // console.log('SHOW');

            if ((this.visible) && (!this.exitInterval) && (!this.hasMouseMovedSince())) {
                if (this.debug) {
                    console.log('ImagePreview: show cancel: visible & not moved');
                }
                return;
            }

            if ((this.url === url) && ((this.visible) || (this.interval))) {
                if (this.debug) {
                    console.log('ImagePreview: same url');
                }

                return;
            }

            if ((this.url) && (this.sticky) && (this.visible)) {
                if (this.debug) {
                    console.log('ImagePreview: sticky visible');
                }

                return;
            }

            if (this.debug)
                console.log('ImagePreview: show.exec', url);

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
                    if (this.debug)
                        console.log('ImagePreview: show.timeout', this.url);

                    this.localPreviewHelper.match(this.domain as string)
                        ? this.localPreviewHelper.show(this.url as string)
                        : this.localPreviewHelper.hide();

                    this.externalPreviewHelper.match(this.domain as string)
                        ? this.externalPreviewHelper.show(this.url as string)
                        : this.externalPreviewHelper.hide();

                    this.visible = true;
                    this.visibleSince = Date.now();

                    this.initialCursorPosition = screen.getCursorScreenPoint();
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

            if (this.debug) {
                const webview = this.getWebview();

                webview.openDevTools();
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
    }
</script>


<style lang="scss">
    @import "~bootstrap/scss/functions";
    @import "~bootstrap/scss/variables";
    @import "~bootstrap/scss/mixins/breakpoints";

    .image-preview-wrapper {
        z-index: 10000;
        display: none;
        position: absolute;
        left: 0;
        top: 0;
        width: 50%;
        height: 70%;
        pointer-events: none;

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
    }
</style>
