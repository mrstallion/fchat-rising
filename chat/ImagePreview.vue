<template>
    <!-- hiding elements instead of using 'v-if' is used here as an optimization -->
    <div class="image-preview-wrapper" :class="{visible: visible, interactive: sticky}">
        <div class="image-preview-toolbar" v-if="sticky || debug">
            <a @click="toggleDevMode()" :class="{toggled: debug}" title="Debug Mode"><i class="fa fa-terminal"></i></a>
            <a @click="toggleJsMode()" :class="{toggled: runJs}" title="Expand Images"><i class="fa fa-magic"></i></a>
            <a @click="reloadUrl()" title="Reload Image"><i class="fa fa-redo-alt"></i></a>
            <a @click="toggleStickyMode()" :class="{toggled: sticky}" title="Toggle Stickyness"><i class="fa fa-thumbtack"></i></a>
        </div>

        <webview webpreferences="allowRunningInsecureContent, autoplayPolicy=no-user-gesture-required" id="image-preview-ext" ref="imagePreviewExt" class="image-preview-external" :src="externalUrl" :style="{display: externalUrlVisible ? 'flex' : 'none'}"></webview>
        <div
            class="image-preview-local"
            :style="{backgroundImage: `url(${internalUrl})`, display: internalUrlVisible ? 'block' : 'none'}"
        >
        </div>
    </div>
</template>

<script lang="ts">
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


    @Component
    export default class ImagePreview extends Vue {
        private readonly MinTimePreviewVisible = 500;

        visible = false;

        externalUrlVisible = false;
        internalUrlVisible = false;

        externalUrl: string | null = null;
        internalUrl: string | null = null;

        url: string | null = null;
        domain: string | undefined;

        sticky = false;
        runJs = true;
        debug = false;

        private jsMutator = new ImagePreviewMutator(this.debug);
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

                    this.dismiss(eventData.url as string);
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
                    if ((this.url === (eventData.url as string)) && (this.visible))
                        this.sticky = !this.sticky;
                }
            );

            const webview = this.$refs.imagePreviewExt as WebviewTag;

            webview.addEventListener(
                'dom-ready',
                (event: EventBusEvent) => {
                    const url = webview.getURL();
                    const js = this.jsMutator.getMutatorJsForSite(url);

                    if (this.debug)
                        console.log('ImagePreview dom-ready', event, js);

                    if ((js) && (this.runJs))
                        webview.executeJavaScript(js);
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


            setInterval(
                () => {
                    if (((this.visible) && (!this.exitInterval) && (!this.shouldDismiss)) || (this.interval))
                        this.initialCursorPosition = screen.getCursorScreenPoint();

                    if ((this.visible) && (this.shouldDismiss) && (this.hasMouseMovedSince()) && (!this.exitInterval) && (!this.interval))
                        this.hide();
                },
                10
            );
        }

        hide(): void {
            this.cancelExitTimer();

            this.url = null;
            this.visible = false;

            if (this.externalUrlVisible) {
                const webview = this.$refs.imagePreviewExt as WebviewTag;

                webview.executeJavaScript(this.jsMutator.getHideMutator());
            }

            this.internalUrlVisible = false;
            this.externalUrlVisible = false;

            // this.externalUrl = null; // 'about:blank';
            this.internalUrl = null; // 'about:blank';

            this.exitUrl = null;
            this.exitInterval = null;

            this.shouldDismiss = false;

            this.sticky = false;
        }

        dismiss(url: string): void {
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

            if (!this.hasMouseMovedSince())
                return;

            // This timeout makes the preview window disappear with a slight delay, which helps UX
            // when dealing with situations such as quickly scrolling text that moves the cursor away
            // from the link
            // tslint:disable-next-line no-unnecessary-type-assertion
            this.exitInterval = setTimeout(
                () => this.hide(),
                due
            ) as Timer;
        }

        show(url: string): void {
            // console.log('SHOW');

            if ((this.visible) && (!this.hasMouseMovedSince()))
                return;

            if ((this.url === url) && ((this.visible) || (this.interval)))
                return;

            if ((this.url) && (this.sticky) && (this.visible))
                return;

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
                    const isInternal = this.isInternalUrl();

                    this.internalUrlVisible = isInternal;
                    this.externalUrlVisible = !isInternal;

                    if (isInternal)
                        this.internalUrl = this.url;
                    else
                        this.externalUrl = this.url;

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
                console.error(err);
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

        isExternalUrl(): boolean {
            // 'f-list.net' is tested here on purpose, because keeps the character URLs from being previewed
            return !((this.domain === 'f-list.net') || (this.domain === 'static.f-list.net'));
        }

        isInternalUrl(): boolean {
            return !this.isExternalUrl();
        }

        toggleDevMode(): void {
            this.debug = !this.debug;

            this.jsMutator.setDebug(this.debug);

            if (this.debug) {
                const webview = this.$refs.imagePreviewExt as WebviewTag;

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
            if (this.externalUrlVisible) {
                const webview = this.$refs.imagePreviewExt as WebviewTag;

                webview.reload();
            }
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
