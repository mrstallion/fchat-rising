<template>
    <span>
        <i class="fa fa-link"></i>
        <!-- No prevent for @click on purpose -->
        <a
            :href="url"
            rel="nofollow noreferrer noopener"
            target="_blank"
            class="user-link"
            @click="handleClick()"
            @mouseover.prevent="show()"
            @mouseenter.prevent="show()"
            @mouseleave.prevent="dismiss()"
            @mouseout.prevent="dismiss()"
            @click.middle.prevent="toggleStickyness()"
        >{{text}}</a>
        <span
            class="link-domain bbcode-pseudo"
        > [{{domain}}]</span>
    </span>
</template>

<script lang="ts">
    import {Component, Hook, Prop} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {EventBus} from '../chat/preview/event-bus';
    // import core from './core';

    @Component
    export default class UrlTagView extends Vue {
        @Prop({required: true})
        readonly url!: string;

        @Prop({required: true})
        readonly text!: string;

        @Prop({required: true})
        readonly domain!: string;

        @Hook('beforeDestroy')
        beforeDestroy(): void {
            this.dismiss();
        }

        @Hook('deactivated')
        deactivate(): void {
            this.dismiss();
        }

        dismiss(force: boolean = false): void {
            EventBus.$emit('imagepreview-dismiss', {url: this.url, force});
        }

        show(): void {
            EventBus.$emit('imagepreview-show', {url: this.url});
        }

        toggleStickyness(): void {
            EventBus.$emit('imagepreview-toggle-stickyness', {url: this.url});
        }

        handleClick(): void {
            this.dismiss(true);
        }
    }
</script>
