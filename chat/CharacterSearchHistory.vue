<template>
    <modal ref="dialog" action="Search history" buttonText="Select" @open="onMounted()" @submit="selectStatus" dialogClass="w-100 modal-lg">
        <form class="search-history" v-if="history.length > 0">
            <div class="form-row" v-for="(search, index) in history" :class="{ 'selected-row': (index === selectedSearch)}">
                <div class="form-col radio-col">
                    <input type="radio" :id="'search_history_' + index" :name="'search_history_' + index" v-model="selectedSearch" v-bind:value="index" />
                </div>
                <div class="form-col content-col">
                    <label class="custom-control-label" :for="'search_history_' + index" @dblclick="submit">
                        {{describeSearch(search)}}
                    </label>
                </div>
            </div>
        </form>
        <div v-else>
            <i>This character has no search history.</i>
        </div>
    </modal>
</template>

<script lang="ts">
    import { Component, Hook, Prop } from '@f-list/vue-ts';
    import Modal from '../components/Modal.vue';
    import Dropdown from '../components/Dropdown.vue';
    import CustomDialog from '../components/custom_dialog';
    import core from './core';
    import { BBCodeView } from '../bbcode/view';
    import * as _ from 'lodash';
    import { SearchData } from './interfaces';

    @Component({
        components: {modal: Modal, dropdown: Dropdown, bbcode: BBCodeView(core.bbCodeParser)}
    })
    export default class CharacterSearchHistory extends CustomDialog {
        @Prop({required: true})
        readonly callback!: (searchData: SearchData) => void;

        @Prop({required: true})
        readonly curSearch!: SearchData | undefined;

        history: SearchData[] = [];

        selectedSearch: number | null = null;

        @Hook('mounted')
        async onMounted(): Promise<void> {
            this.history = (await core.settingsStore.get('searchHistory')) || [];
            this.selectedSearch = null;

            if (this.curSearch) {
                const cleanedSearch = JSON.stringify(this.curSearch, null, 0);

                const index = _.findIndex(
                    this.history,
                  (c) => (JSON.stringify(c, null, 0) === cleanedSearch)
                );

                if (index >= 0) {
                    this.selectedSearch = index;
                }
            }
        }


        selectStatus(): void {
            if (this.selectedSearch !== null) {
                this.callback(this.history[this.selectedSearch]);
            }
        }


        submit(e: Event): void {
          (<Modal>this.$refs.dialog).submit(e);
        }


        describeSearch(searchData: SearchData): string {
            return _.join(
                _.map(
                    // tslint:disable-next-line no-unsafe-any no-any
                    _.flatten(_.map(searchData as any)),
                    // tslint:disable-next-line no-unsafe-any no-any
                    (v) => _.get(v, 'name', v)
                ),
                ', '
            );
        }
    }
</script>

<style lang="scss">
    .search-history {
        .radio-col {
            display: none;
        }

        label::before {
            display:none !important;
        }

        .content-col {
            min-width: 100%;

            label {
                min-width: 100%;
            }
        }

        .form-row {
            margin-bottom: 10px;
            padding: 3px;

            border: 1px solid rgba(0,0,0,0);
            border-radius: 2px;
        }

        .form-row:hover {
            background-color: #20203e;
            border: 1px solid #2d2d6b;
            border-radius: 2px;
        }

        .selected-row,
        .form-row.selected-row:hover {
            background-color: #343461;
            border: 1px solid #6565b2;
            border-radius: 2px;
        }
    }
</style>
