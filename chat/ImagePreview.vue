<template>
    <div class="image-preview-wrapper" v-if="isVisible()">
        <webview class="image-preview-external" :src="isExternalUrl() ? url : null" :style="{display: isExternalUrl() ? 'flex' : 'none'}"></webview>
        <div
            class="image-preview-local"
            :style="{backgroundImage: `url(${url})`, display: isInternalUrl() ? 'block' : 'none'}"
        >
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Hook} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {EventBus} from './event-bus';
    import {domain } from '../bbcode/core';

    @Component
    export default class ImagePreview extends Vue {
        public visible: boolean = false;
        public url: string|null = null;
        public domain: string|undefined;

        private interval: any = null;


        @Hook('mounted')
        onMounted() {
            EventBus.$on(
                'imagepreview-dismiss',
                (eventData: any) => {
                    console.log('DIMSMISS');
                    this.dismiss(eventData.url);
                }
            );

            EventBus.$on(
                'imagepreview-show',
                (eventData: any) => {
                    console.log('SHOW');
                    this.show(eventData.url);
                }
            );
        }


        dismiss(url: string) {
            if (this.url !== url) {
                // simply ignore
                return;
            }

            this.url = null;
            this.visible = false;

            this.cancelTimer();
        }


        show(url: string) {
            this.url = url;
            this.domain = domain(url);

            this.cancelTimer();

            this.interval = setTimeout(
                () => {
                    this.visible = true;
                },
                100
            );
        }


        cancelTimer() {
            if (this.interval) {
                clearTimeout(this.interval);
            }

            this.interval = null;
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
    }
</style>
