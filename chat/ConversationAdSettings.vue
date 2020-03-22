<template>
    <modal :action="`Ad settings for ${conversation.name}`" @submit="submit" ref="dialog" @open="load()" dialogClass="w-100"
        :buttonText="l('conversationSettings.save')">
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
    export default class ConversationAdSettings extends CustomDialog {
        @Prop({required: true})
        readonly conversation!: Conversation;
        l = l;
        setting = Conversation.Setting;
        ads!: string[];

        load(): void {
            const settings = this.conversation.settings;

            this.ads = settings.adSettings.ads.slice(0);

            if (this.ads.length === 0) {
                this.ads.push('');
            }
        }

        submit(): void {
            this.conversation.settings = {
                notify: this.conversation.settings.notify,
                highlight: this.conversation.settings.highlight,
                highlightWords: this.conversation.settings.highlightWords,
                joinMessages: this.conversation.settings.joinMessages,
                defaultHighlights: this.conversation.settings.defaultHighlights,
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

