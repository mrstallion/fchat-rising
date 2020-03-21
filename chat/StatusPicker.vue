<template>
    <modal action="Status message history" buttonText="Select" @open="onMounted()" @submit="selectStatus" dialogClass="w-100 modal-lg">
        <form class="status-picker" v-if="history.length > 0">
            <div class="form-row" v-for="(historicStatus, index) in history" :class="{ 'selected-row': (index === selectedStatus)}">
                <div class="form-col radio-col">
                    <input type="radio" :id="'history_status_' + index" :name="'history_status_' + index" v-model="selectedStatus" v-bind:value="index" />
                </div>
                <div class="form-col content-col">
                    <label class="custom-control-label" :for="'history_status_' + index">
                        <bbcode :text="historicStatus"></bbcode>
                    </label>
                </div>
            </div>
        </form>
        <div v-else>
            <i>This character has no status message history.</i>
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

    @Component({
        components: {modal: Modal, dropdown: Dropdown, bbcode: BBCodeView(core.bbCodeParser)}
    })
    export default class StatusPicker extends CustomDialog {
        @Prop({required: true})
        readonly callback!: (statusMessage: string) => void;

        @Prop({required: true})
        readonly curStatus!: string | undefined;

        history: string[] = [];

        selectedStatus: number | null = null;

        @Hook('mounted')
        async onMounted(): Promise<void> {
            this.history = (await core.settingsStore.get('statusHistory')) || [];
            this.selectedStatus = null;

            if ((this.curStatus) && (this.curStatus.trim() !== '')) {
                const cleanedStatus = this.curStatus.toLowerCase().trim();

                const index = _.findIndex(
                    this.history,
                  (c: string) => (c.toString().toLowerCase().trim() === cleanedStatus)
                );

                if (index >= 0) {
                    this.selectedStatus = index;
                }
            }
        }


        selectStatus(): void {
            if (this.selectedStatus !== null) {
                this.callback(this.history[this.selectedStatus]);
            }
        }
    }
</script>

<style lang="scss">
    .status-picker {
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
