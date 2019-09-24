<template>
    <modal :action="l('characterSearch.action')" @submit.prevent="submit()" dialogClass="w-100"
        :buttonText="results ? l('characterSearch.again') : undefined" class="character-search">
        <div v-if="options && !results">
            <div v-show="error" class="alert alert-danger">{{error}}</div>
            <filterable-select v-model="data.kinks" :multiple="true" :placeholder="l('filter')"
                :title="l('characterSearch.kinks')" :filterFunc="filterKink" :options="options.kinks">
                <template slot-scope="s">{{s.option.name}}</template>
            </filterable-select>
            <filterable-select v-for="item in listItems" :multiple="true"
                v-model="data[item]" :placeholder="l('filter')" :title="l('characterSearch.' + item)" :options="options[item]" :key="item">
            </filterable-select>

            <div v-if="searchString" class="search-string">
                Searching for <span>{{searchString}}</span>
            </div>

            <button class="btn btn-outline-secondary" @click.prevent="reset()">Reset</button>
        </div>
        <div v-else-if="results" class="results">
            <h4>{{l('characterSearch.results')}}</h4>
            <div v-for="character in results" :key="character.name" :class="'status-' + character.status">
                <template v-if="character.status === 'looking'" v-once>
                    <img :src="characterImage(character.name)" v-if="showAvatars"/>
                    <user :character="character" :showStatus="true" :match="true"></user>
                    <bbcode :text="character.statusText"></bbcode>
                </template>
                <user v-else :character="character" :showStatus="true" :match="true" v-once></user>
            </div>
        </div>
    </modal>
</template>

<script lang="ts">
    import { Component, Hook, Watch } from '@f-list/vue-ts';
    import Axios from 'axios';
    import CustomDialog from '../components/custom_dialog';
    import FilterableSelect from '../components/FilterableSelect.vue';
    import Modal from '../components/Modal.vue';
    import {BBCodeView} from './bbcode';
    import {characterImage} from './common';
    import core from './core';
    import {Character, Connection} from './interfaces';
    import l from './localize';
    import UserView from './UserView.vue';
    import * as _ from 'lodash';
    import {EventBus} from './event-bus';

    type Options = {
        kinks: Kink[],
        listitems: {id: string, name: string, value: string}[]
    };

    let options: Options | undefined;

    type Kink = {id: number, name: string, description: string};

    function sort(x: Character, y: Character): number {
        if(x.status === 'looking' && y.status !== 'looking') return -1;
        if(x.status !== 'looking' && y.status === 'looking') return 1;

        const xc = core.cache.profileCache.getSync(x.name);
        const yc = core.cache.profileCache.getSync(y.name);

        if (xc && !yc) {
            return -1;
        }

        if (!xc && yc) {
            return 1;
        }

        if (xc && yc) {
            if (xc.matchScore > yc.matchScore)
                return -1;

            if (xc.matchScore < yc.matchScore)
                return 1;
        }

        if(x.name < y.name) return -1;
        if(x.name > y.name) return 1;
        return 0;
    }

    interface Data {
        kinks: Kink[]
        genders: string[]
        orientations: string[]
        languages: string[]
        furryprefs: string[]
        roles: string[]
        positions: string[]
    }

    @Component({
        components: {modal: Modal, user: UserView, 'filterable-select': FilterableSelect, bbcode: BBCodeView}
    })
    export default class CharacterSearch extends CustomDialog {
        l = l;
        kinksFilter = '';
        error = '';
        results: Character[] | undefined;
        characterImage = characterImage;
        options!: Data;
        data: Data = {kinks: [], genders: [], orientations: [], languages: [], furryprefs: [], roles: [], positions: []};
        listItems: ReadonlyArray<keyof Data> = ['genders', 'orientations', 'languages', 'furryprefs', 'roles', 'positions'];

        searchString = '';

        // tslint:disable-next-line no-any
        scoreWatcher: ((event: any) => void) | null = null;


        @Hook('created')
        async created(): Promise<void> {
            if(options === undefined)
                options = <Options | undefined>(await Axios.get('https://www.f-list.net/json/api/mapping-list.php')).data;
            if(options === undefined) return;
            this.options = Object.freeze({
                kinks: options.kinks.sort((x, y) => (x.name < y.name ? -1 : (x.name > y.name ? 1 : 0))),
                genders: options.listitems.filter((x) => x.name === 'gender').map((x) => x.value),
                orientations: options.listitems.filter((x) => x.name === 'orientation').map((x) => x.value),
                languages: options.listitems.filter((x) => x.name === 'languagepreference').map((x) => x.value),
                furryprefs: options.listitems.filter((x) => x.name === 'furrypref').map((x) => x.value),
                roles: options.listitems.filter((x) => x.name === 'subdom').map((x) => x.value),
                positions: options.listitems.filter((x) => x.name === 'position').map((x) => x.value)
            });
        }

        @Hook('mounted')
        mounted(): void {
            core.connection.onMessage('ERR', (data) => {
                switch(data.number) {
                    case 18:
                        this.error = l('characterSearch.error.noResults');
                        break;
                    case 50:
                        this.error = l('characterSearch.error.throttle');
                        break;
                    case 72:
                        this.error = l('characterSearch.error.tooManyResults');
                }
            });
            core.connection.onMessage('FKS', (data) => {
                this.results = data.characters.map((x) => core.characters.get(x))
                    .filter((x) => core.state.hiddenUsers.indexOf(x.name) === -1 && !x.isIgnored).sort(sort);
            });

            if (this.scoreWatcher) {
                EventBus.$off('character-score', this.scoreWatcher);
            }

            // tslint:disable-next-line no-unsafe-any no-any
            this.scoreWatcher = (event: any): void => {
                // console.log('scoreWatcher', event);

                if (
                    (this.results)
                    // tslint:disable-next-line no-unsafe-any no-any
                    && (event.character)
                    // tslint:disable-next-line no-unsafe-any no-any
                    && (_.find(this.results, (c: Character) => c.name === event.character.character.name))
                ) {
                    this.results = this.results.sort(sort);
                }
            };

            EventBus.$on(
                'character-score',
                this.scoreWatcher
            );
        }


        @Hook('beforeDestroy')
        beforeDestroy(): void {
            if (this.scoreWatcher) {
                EventBus.$off(
                    'character-score',
                    this.scoreWatcher
                );

                delete this.scoreWatcher;
            }
        }


        @Watch('data', { deep: true })
        onDataChange(): void {
            this.searchString = _.join(
                _.map(
                    // tslint:disable-next-line no-unsafe-any no-any
                    _.flatten(_.map(this.data as any)),
                    // tslint:disable-next-line no-unsafe-any no-any
                    (v) => _.get(v, 'name', v)
                ),
                ', '
            );
        }


        filterKink(filter: RegExp, kink: Kink): boolean {
            if(this.data.kinks.length >= 5)
                return this.data.kinks.indexOf(kink) !== -1;
            return filter.test(kink.name);
        }

        get showAvatars(): boolean {
            return core.state.settings.showAvatars;
        }


        reset(): void {
            this.data = {kinks: [], genders: [], orientations: [], languages: [], furryprefs: [], roles: [], positions: []};
        }


        submit(): void {
            if(this.results !== undefined) {
                this.results = undefined;
                return;
            }
            this.error = '';
            const data: Connection.ClientCommands['FKS'] & {[key: string]: (string | number)[]} = {kinks: []};
            for(const key in this.data) {
                const item = this.data[<keyof Data>key];
                if(item.length > 0)
                    data[key] = key === 'kinks' ? (<Kink[]>item).map((x) => x.id) : (<string[]>item);
            }
            core.connection.send('FKS', data);
        }
    }
</script>

<style lang="scss">
    .character-search {
        .dropdown {
            margin-bottom: 10px;
        }

        .results {
            .user-view {
                display: block;
            }
            & > .status-looking {
                margin-bottom: 5px;
                min-height: 50px;
            }
            img {
                float: left;
                margin-right: 5px;
                width: 50px;
            }
        }

        .search-string {
            margin-bottom: 1rem;
            margin-top: 1rem;
            margin-left: 0.5rem;
            font-size: 80%;
        }

        .search-string span {
            font-weight: bold;
        }
    }
</style>