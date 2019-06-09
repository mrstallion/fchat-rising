<template>
    <div class="row character-page" id="pageBody">
        <div class="col-12" style="min-height:0">
            <div class="alert alert-info" v-show="loading">Loading character information.</div>
            <div class="alert alert-danger" v-show="error">{{error}}</div>
        </div>
        <div class="col-md-4 col-lg-3 col-xl-2" v-if="!loading && character">
            <sidebar :character="character" @memo="memo" @bookmarked="bookmarked" :oldApi="oldApi"></sidebar>
        </div>
        <div class="col-md-8 col-lg-9 col-xl-10 profile-body" v-if="!loading && character">
            <div id="characterView">
                <div>
                    <div v-if="character.ban_reason" id="headerBanReason" class="alert alert-warning">
                        This character has been banned and is not visible to the public. Reason:
                        <br/> {{ character.ban_reason }}
                        <template v-if="character.timeout"><br/>Timeout expires:
                            <date :time="character.timeout"></date>
                        </template>
                    </div>
                    <div v-if="character.block_reason" id="headerBlocked" class="alert alert-warning">
                        This character has been blocked and is not visible to the public. Reason:
                        <br/> {{ character.block_reason }}
                    </div>
                    <div v-if="character.memo" id="headerCharacterMemo" class="alert alert-info">Memo: {{ character.memo.memo }}</div>
                    <div class="card bg-light">
                        <div class="card-header">
                            <tabs class="card-header-tabs" v-model="tab">
                                <span>Overview</span>
                                <span>Info</span>
                                <span v-if="!oldApi">Groups</span>
                                <span>Images ({{ character.character.image_count }})</span>
                                <span v-if="character.settings.guestbook">Guestbook</span>
                                <span v-if="character.is_self || character.settings.show_friends">Friends</span>
                            </tabs>
                        </div>
                        <div class="card-body">
                            <div class="tab-content">
                                <div role="tabpanel" class="tab-pane" :class="{active: tab === '0'}" id="overview">
                                    <div v-bbcode="character.character.description" style="margin-bottom: 10px"></div>
                                    <character-kinks :character="character" :oldApi="oldApi" ref="tab0"></character-kinks>
                                </div>
                                <div role="tabpanel" class="tab-pane" :class="{active: tab === '1'}" id="infotags">
                                    <character-infotags :character="character" ref="tab1"></character-infotags>
                                </div>
                                <div role="tabpanel" class="tab-pane" id="groups" :class="{active: tab === '2'}" v-if="!oldApi">
                                    <character-groups :character="character" ref="tab2"></character-groups>
                                </div>
                                <div role="tabpanel" class="tab-pane" id="images" :class="{active: tab === '3'}">
                                    <character-images :character="character" ref="tab3" :use-preview="imagePreview"></character-images>
                                </div>
                                <div v-if="character.settings.guestbook" role="tabpanel" class="tab-pane" :class="{active: tab === '4'}"
                                    id="guestbook">
                                    <character-guestbook :character="character" :oldApi="oldApi" ref="tab4"></character-guestbook>
                                </div>
                                <div v-if="character.is_self || character.settings.show_friends" role="tabpanel" class="tab-pane"
                                    :class="{active: tab === '5'}" id="friends">
                                    <character-friends :character="character" ref="tab5"></character-friends>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Hook, Prop, Watch} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {standardParser} from '../../bbcode/standard';
    import * as Utils from '../utils';
    import {methods, Store} from './data_store';
    import {Character, SharedStore} from './interfaces';

    import DateDisplay from '../../components/date_display.vue';
    import Tabs from '../../components/tabs';
    import FriendsView from './friends.vue';
    import GroupsView from './groups.vue';
    import GuestbookView from './guestbook.vue';
    import ImagesView from './images.vue';
    import InfotagsView from './infotags.vue';
    import CharacterKinksView from './kinks.vue';
    import Sidebar from './sidebar.vue';

    interface ShowableVueTab extends Vue {
        show?(): void
    }

    @Component({
        components: {
            sidebar: Sidebar,
            date: DateDisplay, tabs: Tabs,
            'character-friends': FriendsView,
            'character-guestbook': GuestbookView,
            'character-groups': GroupsView,
            'character-infotags': InfotagsView,
            'character-images': ImagesView,
            'character-kinks': CharacterKinksView
        }
    })
    export default class CharacterPage extends Vue {
        @Prop()
        readonly name?: string;
        @Prop()
        readonly characterid?: number;
        @Prop({required: true})
        readonly authenticated!: boolean;
        @Prop()
        readonly oldApi?: true;
        @Prop()
        readonly imagePreview?: true;
        shared: SharedStore = Store;
        character: Character | undefined;
        loading = true;
        error = '';
        tab = '0';

        @Hook('beforeMount')
        beforeMount(): void {
            this.shared.authenticated = this.authenticated;
        }

        @Hook('mounted')
        async mounted(): Promise<void> {
            if(this.character === undefined) await this._getCharacter();
        }

        @Watch('tab')
        switchTabHook(): void {
            const target = <ShowableVueTab>this.$refs[`tab${this.tab}`];
            //tslint:disable-next-line:no-unbound-method
            if(typeof target.show === 'function') target.show();
        }

        @Watch('name')
        async onCharacterSet(): Promise<void> {
            this.tab = '0';
            return this._getCharacter();
        }

        memo(memo: {id: number, memo: string}): void {
            Vue.set(this.character!, 'memo', memo);
        }

        bookmarked(state: boolean): void {
            Vue.set(this.character!, 'bookmarked', state);
        }

        private async _getCharacter(): Promise<void> {
            this.error = '';
            this.character = undefined;
            if(this.name === undefined || this.name.length === 0)
                return;
            try {
                this.loading = true;
                await methods.fieldsGet();
                this.character = await methods.characterData(this.name, this.characterid);
                standardParser.allowInlines = true;
                standardParser.inlines = this.character.character.inlines;

            } catch(e) {
                this.error = Utils.isJSONError(e) ? <string>e.response.data.error : (<Error>e).message;
                Utils.ajaxError(e, 'Failed to load character information.');
            }
            this.loading = false;
        }
    }
</script>


<style lang="scss">

    .custom-kink {
        &:first-child {
            margin-top: 0;
        }

        &:last-child {
            margin-bottom: 0;
        }

        font-weight: bold;
        margin-top: 14px;
        margin-bottom: 14px;
        margin-left: -6px;
        margin-right: -6px;
        color: #f2cd00;
        border: 1px rgba(255, 255, 255, 0.1) solid;
        border-radius: 2px;
        /* border-collapse: collapse; */
        padding: 5px;
    }


    .kink-custom-desc {
        display: block;
        font-weight: normal;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 125%;
    }


    .infotag-label {
        display: block;
        /* margin-bottom: 1rem; */
        font-weight: normal !important;
        line-height: 120%;
        font-size: 85%;
        color: rgba(255, 255, 255, 0.7);
    }


    .infotag-value {
        display: block;
        margin-bottom: 1rem;
        font-weight: bold;
        line-height: 120%;
    }

    .quick-info-value {
        display: block;
        font-weight: bold;
    }

    .quick-info-label {
        display: block;
        /* margin-bottom: 1rem; */
        font-weight: normal !important;
        line-height: 120%;
        font-size: 85%;
        color: rgba(255, 255, 255, 0.7);
    }

    .quick-info {
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
    }

    img.character-image {
        max-width: 33% !important;
        width: 33% !important;
        height: auto !important;
        object-fit: contain;
        object-position: top center;
        vertical-align: top !important;
    }

</style>