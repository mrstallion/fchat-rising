<template>
    <div class="character-kinks-block" @contextmenu="contextMenu" @touchstart="contextMenu" @touchend="contextMenu">
        <div class="compare-highlight-block d-flex justify-content-between">
            <div class="expand-custom-kinks-block form-inline">
                <button class="btn btn-primary" @click="toggleExpandedCustomKinks" :disabled="loading">Expand Custom Kinks</button>
            </div>

            <div v-if="shared.authenticated" class="quick-compare-block form-inline">
                <character-select v-model="characterToCompare"></character-select>
                <button class="btn btn-outline-secondary" @click="compareKinks" :disabled="loading || !characterToCompare">
                    {{ compareButtonText }}
                </button>
            </div>

            <div class="form-inline">
                <select v-model="highlightGroup" class="form-control">
                    <option :value="undefined">None</option>
                    <option v-for="group in kinkGroups" v-if="group" :value="group.id" :key="group.id">{{group.name}}</option>
                </select>
            </div>
        </div>
        <div class="form-row mt-3">
            <div class="col-sm-6 col-lg-3">
                <div class="card bg-light">
                    <div class="card-header">
                        <h4>Favorites</h4>
                    </div>
                    <div class="card-body">
                        <kink v-for="kink in groupedKinks['favorite']" :kink="kink" :key="kink.id" :highlights="highlighting" :expandedCustom="expandedCustoms"
                            :comparisons="comparison"></kink>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="card bg-light">
                    <div class="card-header">
                        <h4>Yes</h4>
                    </div>
                    <div class="card-body">
                        <kink v-for="kink in groupedKinks['yes']" :kink="kink" :key="kink.id" :highlights="highlighting" :expandedCustom="expandedCustoms"
                            :comparisons="comparison"></kink>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="card bg-light">
                    <div class="card-header">
                        <h4>Maybe</h4>
                    </div>
                    <div class="card-body">
                        <kink v-for="kink in groupedKinks['maybe']" :kink="kink" :key="kink.id" :highlights="highlighting" :expandedCustom="expandedCustoms"
                            :comparisons="comparison"></kink>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="card bg-light">
                    <div class="card-header">
                        <h4>No</h4>
                    </div>
                    <div class="card-body">
                        <kink v-for="kink in groupedKinks['no']" :kink="kink" :key="kink.id" :highlights="highlighting" :expandedCustom="expandedCustoms"
                            :comparisons="comparison"></kink>
                    </div>
                </div>
            </div>
        </div>
        <context-menu v-if="shared.authenticated && !oldApi" prop-name="custom" ref="context-menu"></context-menu>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Watch, Hook} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {Kink, KinkChoice} from '../../interfaces';
    import * as Utils from '../utils';
    import CopyCustomMenu from './copy_custom_menu.vue';
    import {methods, Store} from './data_store';
    import {Character, DisplayKink, KinkGroup} from './interfaces';
    import KinkView from './kink.vue';

    @Component({
        components: {'context-menu': CopyCustomMenu, kink: KinkView}
    })
    export default class CharacterKinksView extends Vue {
        @Prop({required: true})
        readonly character!: Character;
        @Prop()
        readonly oldApi?: true;
        shared = Store;
        characterToCompare = Utils.Settings.defaultCharacter;
        highlightGroup: number | undefined;

        loading = false;
        comparing = false;
        highlighting: {[key: string]: boolean} = {};
        comparison: {[key: string]: KinkChoice} = {};

        expandedCustoms = false;


        toggleExpandedCustomKinks(): void {
            this.expandedCustoms = !this.expandedCustoms;
        }

        async compareKinks(): Promise<void> {
            if(this.comparing) {
                this.comparison = {};
                this.comparing = false;
                this.loading = false;
                return;
            }

            try {
                this.loading = true;
                this.comparing = true;
                const kinks = await methods.kinksGet(this.characterToCompare);

                const toAssign: {[key: number]: KinkChoice} = {};
                for(const kink of kinks)
                    toAssign[kink.id] = kink.choice;
                this.comparison = toAssign;
            } catch(e) {
                this.comparing = false;
                this.comparison = {};
                Utils.ajaxError(e, 'Unable to get kinks for comparison.');
            }
            this.loading = false;
        }

        @Watch('highlightGroup')
        highlightKinks(group: number | null): void {
            this.highlighting = {};
            if(group === null) return;
            const toAssign: {[key: string]: boolean} = {};
            for(const kinkId in this.shared.kinks.kinks) {
                const kink = this.shared.kinks.kinks[kinkId]!;
                if(kink.kink_group === group)
                    toAssign[kinkId] = true;
            }
            this.highlighting = toAssign;
        }

        @Hook('mounted')
        async mounted(): Promise<void> {
            if ((this.character) && (this.character.is_self)) {
                return;
            }

            await this.compareKinks();
        }

        @Watch('character')
        async characterChanged(): Promise<void> {
            if ((this.character) && (this.character.is_self)) {
                return;
            }

            await this.compareKinks();
        }

        get kinkGroups(): {[key: string]: KinkGroup | undefined} {
            return this.shared.kinks.kink_groups;
        }

        get compareButtonText(): string {
            if(this.loading)
                return 'Loading...';
            return this.comparing ? 'Clear' : 'Compare';
        }

        get groupedKinks(): {[key in KinkChoice]: DisplayKink[]} {
            const kinks = this.shared.kinks.kinks;
            const characterKinks = this.character.character.kinks;
            const characterCustoms = this.character.character.customs;
            const displayCustoms: {[key: string]: DisplayKink | undefined} = {};
            const outputKinks: {[key: string]: DisplayKink[]} = {favorite: [], yes: [], maybe: [], no: []};
            const makeKink = (kink: Kink): DisplayKink => ({
                id: kink.id,
                name: kink.name,
                description: kink.description,
                group: kink.kink_group,
                isCustom: false,
                hasSubkinks: false,
                ignore: false,
                subkinks: []
            });
            const kinkSorter = (a: DisplayKink, b: DisplayKink) => {
                if(this.character.settings.customs_first && a.isCustom !== b.isCustom)
                    return a.isCustom < b.isCustom ? 1 : -1;

                if(a.name === b.name)
                    return 0;
                return a.name < b.name ? -1 : 1;
            };

            for(const id in characterCustoms) {
                const custom = characterCustoms[id]!;
                displayCustoms[id] = {
                    id: custom.id,
                    name: custom.name,
                    description: custom.description,
                    choice: custom.choice,
                    group: -1,
                    isCustom: true,
                    hasSubkinks: false,
                    ignore: false,
                    subkinks: []
                };
            }

            for(const kinkId in characterKinks) {
                const kinkChoice = characterKinks[kinkId]!;
                const kink = kinks[kinkId];
                if(kink === undefined) continue;
                const newKink = makeKink(kink);
                if(typeof kinkChoice === 'number' && typeof displayCustoms[kinkChoice] !== 'undefined') {
                    const custom = displayCustoms[kinkChoice]!;
                    newKink.ignore = true;
                    custom.hasSubkinks = true;
                    custom.subkinks.push(newKink);
                }
                if(!newKink.ignore)
                    outputKinks[kinkChoice].push(newKink);
            }

            for(const customId in displayCustoms) {
                const custom = displayCustoms[customId]!;
                if(custom.hasSubkinks)
                    custom.subkinks.sort(kinkSorter);
                outputKinks[<string>custom.choice].push(custom);
            }

            for(const choice in outputKinks)
                outputKinks[choice].sort(kinkSorter);

            return <{[key in KinkChoice]: DisplayKink[]}>outputKinks;
        }

        contextMenu(event: TouchEvent): void {
            if(this.shared.authenticated && !this.oldApi) (<CopyCustomMenu>this.$refs['context-menu']).outerClick(event);
        }
    }
</script>