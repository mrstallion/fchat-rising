<template>
    <!-- hiding elements instead of using 'v-if' is used here as an optimization -->
    <div class="image-preview-wrapper" :style="{display: visible ? 'block' : 'none'}">
        <webview webpreferences="allowRunningInsecureContent" id="image-preview-ext" ref="imagePreviewExt" class="image-preview-external" :src="externalUrl" :style="{display: externalUrlVisible ? 'flex' : 'none'}"></webview>
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

    @Component
    export default class ImagePreview extends Vue {
        public visible: boolean = false;

        public externalUrlVisible: boolean = false;
        public internalUrlVisible: boolean = false;

        public externalUrl: string|null = null;
        public internalUrl: string|null = null;

        public url: string|null = null;
        public domain: string|undefined;

        private jsMutator = new ImagePreviewMutator();
        private interval: any = null;

        private exitInterval: any = null;
        private exitUrl: string|null = null;

        @Hook('mounted')
        onMounted() {
            EventBus.$on(
                'imagepreview-dismiss',
                (eventData: any) => {
                    this.dismiss(eventData.url);
                }
            );

            EventBus.$on(
                'imagepreview-show',
                (eventData: any) => {
                    this.show(eventData.url);
                }
            );

            const webview = this.$refs.imagePreviewExt as any;

            webview.addEventListener(
                'dom-ready',
                () => {
                    const url = webview.getURL();

                    const js = this.jsMutator.getMutatorJsForSite(url);

                    if (js) {
                        webview.executeJavaScript(js);
                    }

                    // webview.openDevTools();

                    /* webview.executeJavaScript(
                        "(() => {"
                            + "$('#topbar').hide();"
                            + "$('.post-header').hide();"
                            + "$('#inside').css({padding: 0, margin: 0, width: '100%'});"
                            + "$('#right-content').hide();"
                            + "$('.post-container').css({width: '100%'});"
                            + "$('.post-image img').css({width: '100%', 'min-height': 'unset'});"
                            + "$('#recommendations').hide();"
                            + "$('.left').css({float: 'none'});"
                        + "})()"
                    );*/
                }
            );
        }


        dismiss(url: string) {
            if (this.url !== url) {
                // simply ignore
                return;
            }

            let due = this.visible ? 1000 : 0;

            this.cancelTimer();

            if (this.exitInterval) {
                return;
            }

            this.exitUrl = this.url;

            this.exitInterval = setTimeout(
                () => {
                    this.url = null;
                    this.visible = false;

                    this.internalUrlVisible = false;
                    this.externalUrlVisible = false;

                    this.externalUrl = 'about:blank';
                    this.internalUrl = 'about:blank';

                    this.exitUrl = null;
                    this.exitInterval = null;
                },
                due
            );
        }


        show(url: string) {
            // url = 'https://imgur.com/a/2uzWx';
            // url = 'http://lodash.com';
            // url = 'https://rule34.xxx/index.php?page=post&s=view&id=3254983';

            let due = ((url === this.exitUrl) && (this.exitInterval)) ? 0 : 100;

            this.url = url;
            this.domain = domain(url);

            this.cancelExitTimer();
            this.cancelTimer();

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
                },
                due
            );
        }


        cancelTimer() {
            if (this.interval) {
                clearTimeout(this.interval);
            }

            this.interval = null;
        }


        cancelExitTimer() {
            if (this.exitInterval) {
                clearTimeout(this.exitInterval);
            }

            this.exitInterval = null;
        }


        isVisible() {
            return this.visible;
        }


        getUrl() {
            return this.url;
        }


        isExternalUrl() {
            return !((this.domain === 'f-list.net') || (this.domain === 'static.f-list.net'));
        }


        isInternalUrl() {
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
</style>
