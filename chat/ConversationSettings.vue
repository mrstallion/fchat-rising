<template>
    <modal :action="l('conversationSettings.action', conversation.name)" @submit="submit" ref="dialog" @open="load()" dialogClass="w-100"
        :buttonText="l('conversationSettings.save')">
        <div class="form-group">
            <label class="control-label" :for="'notify' + conversation.key">{{l('conversationSettings.notify')}}</label>
            <select class="form-control" :id="'notify' + conversation.key" v-model="notify">
                <option :value="setting.Default">{{l('conversationSettings.default')}}</option>
                <option :value="setting.True">{{l('conversationSettings.true')}}</option>
                <option :value="setting.False">{{l('conversationSettings.false')}}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="control-label" :for="'highlight' + conversation.key">{{l('settings.highlight')}}</label>
            <select class="form-control" :id="'highlight' + conversation.key" v-model="highlight">
                <option :value="setting.Default">{{l('conversationSettings.default')}}</option>
                <option :value="setting.True">{{l('conversationSettings.true')}}</option>
                <option :value="setting.False">{{l('conversationSettings.false')}}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="control-label" for="defaultHighlights">
                <input type="checkbox" id="defaultHighlights" v-model="defaultHighlights"/>
                {{l('settings.defaultHighlights')}}
            </label>
        </div>
        <div class="form-group">
            <label class="control-label" :for="'highlightWords' + conversation.key">{{l('settings.highlightWords')}}</label>
            <input :id="'highlightWords' + conversation.key" class="form-control" v-model="highlightWords"/>
        </div>
        <div class="form-group">
            <label class="control-label" :for="'joinMessages' + conversation.key">{{l('settings.joinMessages')}}</label>
            <select class="form-control" :id="'joinMessages' + conversation.key" v-model="joinMessages">
                <option :value="setting.Default">{{l('conversationSettings.default')}}</option>
                <option :value="setting.True">{{l('conversationSettings.true')}}</option>
                <option :value="setting.False">{{l('conversationSettings.false')}}</option>
            </select>
        </div>

        <h5>Auto-Posting Channel Ads</h5>

        <div class="form-group ad-list" v-for="(ad, index) in ads">
            <label :for="'ad' + conversation.key + '-' + index" class="control-label">Ad #{{(index + 1)}}
                <a v-if="(index > 0)" @click="moveAdUp(index)" title="Move Up"><i class="fa fa-arrow-up"></i></a>
                <a v-if="(index < ads.length - 1)" @click="moveAdDown(index)" title="Move Down"><i class="fa fa-arrow-down"></i></a>
                <a @click="removeAd(index)" title="Remove Ad"><i class="fa fa-minus-circle"></i></a>
            </label>
            <textarea :id="'ad' + conversation.key + '-' + index" class="form-control" v-model="ads[index]"></textarea>
        </div>
        <button class="btn btn-outline-secondary" @click="addAd()">Add Another</button>

    </modal>
</template>

<script lang="ts">
    import {Component, Prop} from '@f-list/vue-ts';
    import CustomDialog from '../components/custom_dialog';
    import Modal from '../components/Modal.vue';
    import {Conversation} from './interfaces';
    import l from './localize';

    @Component({
        components: {modal: Modal}
    })
    export default class ConversationSettings extends CustomDialog {
        @Prop({required: true})
        readonly conversation!: Conversation;
        l = l;
        setting = Conversation.Setting;
        notify!: Conversation.Setting;
        highlight!: Conversation.Setting;
        highlightWords!: string;
        joinMessages!: Conversation.Setting;
        defaultHighlights!: boolean;
        ads!: string[];

        load(): void {
            const settings = this.conversation.settings;
            this.notify = settings.notify;
            this.highlight = settings.highlight;
            this.highlightWords = settings.highlightWords.join(',');
            this.joinMessages = settings.joinMessages;
            this.defaultHighlights = settings.defaultHighlights;
            this.ads = settings.adSettings.ads.slice(0);

            if (this.ads.length === 0) {
                this.ads.push('');
            }
        }

        submit(): void {
            this.conversation.settings = {
                notify: this.notify,
                highlight: this.highlight,
                highlightWords: this.highlightWords.split(',').map((x) => x.trim()).filter((x) => (x.length > 0)),
                joinMessages: this.joinMessages,
                defaultHighlights: this.defaultHighlights,
                adSettings: {
                    ads: this.ads.map((ad: string) => ad.trim()).filter((ad: string) => (ad.length > 0))
                }
            };
        }


        addAd(): void {
            this.ads.push('');
        }


        removeAd(index: number): void {
            if (confirm('Are you sure you wish to remove this ad?')) {
                this.ads.splice(index, 1);
            }
        }


        moveAdUp(index: number): void {
            const ad = this.ads.splice(index, 1);

            this.ads.splice(index - 1, 0, ad[0]);
        }


        moveAdDown(index: number): void {
            const ad = this.ads.splice(index, 1);

            this.ads.splice(index + 1, 0, ad[0]);
        }

    }
</script>

<style lang="scss">
    .form-group.ad-list label a {
        padding-right: 0.3rem;
        opacity:0.3
    }

    .form-group.ad-list label a:hover {
        opacity:0.6
    }
</style>

