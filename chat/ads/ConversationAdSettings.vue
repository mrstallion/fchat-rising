<template>
    <modal :action="`Ads for ${conversation.name}`" @submit="submit" ref="dialog" @open="load()" dialogClass="w-100"
        :buttonText="l('conversationSettings.save')">
        <div class="form-group ad-list" v-for="(ad, index) in ads">
            <label :for="'ad' + conversation.key + '-' + index" class="control-label">Ad #{{(index + 1)}}
                <a v-if="(index > 0)" @click="moveAdUp(index)" title="Move Up"><i class="fa fa-arrow-up"></i></a>
                <a v-if="(index < ads.length - 1)" @click="moveAdDown(index)" title="Move Down"><i class="fa fa-arrow-down"></i></a>
                <a @click="removeAd(index)" title="Remove Ad"><i class="fas fa-times-circle"></i></a>
            </label>

            <bbcode-editor :id="'ad' + conversation.key + '-' + index" v-model="ads[index]" :hasToolbar="true" class="form-control">
            </bbcode-editor>
        </div>
        <button class="btn btn-outline-secondary" @click="addAd()">Add Another</button>

    </modal>
</template>

<script lang="ts">
    import {Component, Prop} from '@f-list/vue-ts';
    import CustomDialog from '../../components/custom_dialog';
    import Modal from '../../components/Modal.vue';
    import {Conversation} from '../interfaces';
    import l from '../localize';

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
  .w-100 {
    min-width: 70%;
  }

  .form-group.ad-list {
    label {
      font-size: 140%;

      a {
        padding-right: 0.3rem;
        opacity:0.3;
        font-size: 70%;

        &:hover {
          opacity:0.6
        }
      }
    }

    .bbcode-preview {
      margin-top: 0;
      border: 1px solid;
      padding: 5px;
      border-radius: 0 5px 5px 5px;
      background: var(--input-bg);
      border-color: var(--secondary);
    }

    .bbcode-editor {
      border: none;
      background: none;
      height: auto;

      textarea {
        width: 100%;
        color: var(--input-color);
        background-color: var(--input-bg);
        border-radius: 0 5px 5px 5px;
      }
    }
  }
</style>

