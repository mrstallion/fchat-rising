<template>
   <modal :buttons="false" ref="dialog" @open="onOpen" @close="onClose" style="width:98%" dialogClass="ads-dialog">
        <template slot="title">
            Channel Ads for <user :character="character">{{character.name}}</user>
        </template>

       <div class="row ad-viewer" ref="pageBody">
            <template v-for="message in messages">
                <h3>#{{message.channelName}} <span class="message-time">{{formatTime(message.datePosted)}}</span></h3>
                <div v-bbcode="message.message" class="border-bottom"></div>
            </template>
        </div>

   </modal>
</template>


<script lang="ts">

import * as _ from 'lodash';
import { Component, Hook, Prop, Watch } from '@f-list/vue-ts';
import CustomDialog from '../components/custom_dialog';
import Modal from '../components/Modal.vue';
import { Character } from '../fchat/interfaces';
import { AdCachedPosting } from '../learn/ad-cache';
import core from './core';
import {formatTime} from './common';
import UserView from './UserView.vue';

@Component({
    components: {modal: Modal, user: UserView}
})
export default class AdView extends CustomDialog {
    @Prop({required: true})
    readonly character!: Character;

    messages: AdCachedPosting[] = [];
    formatTime = formatTime;

    @Watch('character')
    onNameUpdate(): void {
        this.update();
    }


    @Hook('mounted')
    onMounted(): void {
        this.update();
    }


    update(): void {
        if (!this.character) {
            this.messages = [];
            return;
        }

        const cache = core.cache.adCache.get(this.character.name);

        this.messages = ((cache) ? _.takeRight(cache.posts, 10).reverse() : []) as AdCachedPosting[];
    }


    async onOpen(): Promise<void> {
        // empty
    }


    async onClose(): Promise<void> {
        // empty
    }
}
</script>
