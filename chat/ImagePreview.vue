<template>
    <!-- hiding elements instead of using 'v-if' is used here as an optimization -->
    <div class="image-preview-wrapper" :style="{display: visible ? 'block' : 'none'}">
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
    import {EventBus} from './event-bus';
    import {domain} from '../bbcode/core';
    import {ImagePreviewMutator} from './image-preview-mutator';
    import {Point, screen} from 'electron';

    @Component
    export default class ImagePreview extends Vue {
        private readonly MinTimePreviewVisible = 500;

        public visible: boolean = false;

        public externalUrlVisible: boolean = false;
        public internalUrlVisible: boolean = false;

        public externalUrl: string | null = null;
        public internalUrl: string | null = null;

        public url: string | null = null;
        public domain: string | undefined;

        private jsMutator = new ImagePreviewMutator();
        private interval: any = null;

        private exitInterval: any = null;
        private exitUrl: string | null = null;

        private initialCursorPosition: Point | null = null;
        private shouldDismiss = false;
        private visibleSince = 0;


        @Hook('mounted')
        onMounted(): void {
            EventBus.$on(
                'imagepreview-dismiss',
                (eventData: any) => {
                    // console.log('Event dismiss', eventData.url);
                    this.dismiss(eventData.url);
                }
            );

            EventBus.$on(
                'imagepreview-show',
                (eventData: any) => {
                    // console.log('Event show', eventData.url);
                    this.show(eventData.url);
                }
            );

            const webview = this.$refs.imagePreviewExt as any;

            webview.addEventListener(
                'dom-ready',
                () => {
                    // webview.openDevTools();

                    const url = webview.getURL();

                    const js = this.jsMutator.getMutatorJsForSite(url);

                    if (js) {
                        webview.executeJavaScript(js);
                    }
                }
            );

            webview.getWebContents().on(
                'did-finish-load',
                ()=> {
                    webview.getWebContents().session.on(
                        'will-download',
                        (e: any) => {
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


        private hide(): void {
            this.cancelExitTimer();

            this.url = null;
            this.visible = false;

            this.internalUrlVisible = false;
            this.externalUrlVisible = false;

            this.externalUrl = 'about:blank';
            this.internalUrl = 'about:blank';

            this.exitUrl = null;
            this.exitInterval = null;

            this.shouldDismiss = false;
        }


        dismiss(url: string): void {
            if (this.url !== url)
                return; // simply ignore

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
            this.exitInterval = setTimeout(
                () => this.hide(),
                due
            );
        }


        show(url: string): void {
            // console.log('SHOW');

            if ((this.visible) && (!this.hasMouseMovedSince()))
                return;

            if ((this.url === url) && ((this.visible) || (this.interval)))
                return;

            const due = ((url === this.exitUrl) && (this.exitInterval)) ? 0 : 100;

            this.url = url;
            this.domain = domain(url);

            this.cancelExitTimer();
            this.cancelTimer();

            // This timer makes sure that just by accidentally brushing across a link won't show (blink) the preview
            // -- you actually have to pause on it
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
            );
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
            return !((this.domain === 'f-list.net') || (this.domain === 'static.f-list.net'));
        }


        isInternalUrl(): boolean {
            return !this.isExternalUrl();
        }
    }
</script>


<style lang="scss">
    @import "~bootstrap/scss/functions";
    @import "~bootstrap/scss/variables";
    @import "~bootstrap/scss/mixins/breakpoints";

    .image-preview-external {
        position: absolute;
        width: 50%;
        height: 50%;
        top: 0;
        left: 0;
        pointer-events: none;
        background-color: black;
    }

    .image-preview-local {
        position: absolute;
        width: 50%;
        height: 50%;
        top: 0;
        left: 0;
        pointer-events: none;
        background-size: contain;
        background-position: top left;
        background-repeat: no-repeat;
        // background-color: black;
    }

    .image-preview-wrapper {
        z-index: 10000;
    }
</style>
