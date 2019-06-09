<template>
    <span>
        <i class="fa fa-link"></i>
        <a
            :href="url"
            rel="nofollow noreferrer noopener"
            target="_blank"
            class="user-link"
            @mouseover="show()"
            @mouseenter="show()"
            @mouseleave="dismiss()"
            @mouseout="dismiss()"
        >{{text}}</a>
        <span
            class="link-domain bbcode-pseudo"
        > [{{domain}}]</span>
    </span>
</template>

<script lang="ts">
    import {Component, Hook, Prop} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {EventBus} from './event-bus';
    // import core from './core';

    @Component
    export default class UrlTagView extends Vue {
        @Prop({required: true})
        readonly url!: string;

        @Prop({required: true})
        readonly text!: string;

        @Prop({required: true})
        readonly domain!: string;

        @Hook("beforeDestroy")
        beforeDestroy(): void {
            this.dismiss();
        }

        @Hook("deactivated")
        deactivate(): void {
            this.dismiss();
        }

        dismiss(): void {
            EventBus.$emit('imagepreview-dismiss', {url: this.url});
        }

        show(): void {
            EventBus.$emit('imagepreview-show', {url: this.url});
        }
    }
</script>
