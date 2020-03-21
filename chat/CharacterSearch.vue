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

            <div class="btn-group">
                <button class="btn btn-outline-secondary" @click.prevent="showHistory()">History</button>
                <button class="btn btn-outline-secondary" @click.prevent="reset()">Reset</button>
            </div>

            <search-history ref="searchHistory" :callback="updateSearch" :curSearch="data"></search-history>
        </div>
        <div v-else-if="results" class="results">
            <h4>
                {{l('characterSearch.results')}}
                <i class="fa fa-spinner search-spinner" v-if="!resultsComplete"></i>
            </h4>

            <div v-for="character in results" :key="character.name" class="search-result" :class="'status-' + character.status">
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
    import {BBCodeView} from '../bbcode/view';
    import CustomDialog from '../components/custom_dialog';
    import FilterableSelect from '../components/FilterableSelect.vue';
    import Modal from '../components/Modal.vue';
    import {characterImage} from './common';
    import core from './core';
    import { Character, Connection, SearchData, SearchKink } from './interfaces';
    import l from './localize';
    import UserView from './UserView.vue';
    import * as _ from 'lodash';
    import {EventBus} from './preview/event-bus';
    import CharacterSearchHistory from './CharacterSearchHistory.vue';

    type Options = {
        kinks: SearchKink[],
        listitems: {id: string, name: string, value: string}[]
    };

    let options: Options | undefined;

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


    @Component({
        components: {modal: Modal, user: UserView, 'filterable-select': FilterableSelect, bbcode: BBCodeView(core.bbCodeParser), 'search-history': CharacterSearchHistory}
    })
    export default class CharacterSearch extends CustomDialog {
        l = l;
        kinksFilter = '';
        error = '';
        results: Character[] | undefined;
        resultsComplete = false;
        characterImage = characterImage;
        options!: SearchData;
        data: SearchData = {kinks: [], genders: [], orientations: [], languages: [], furryprefs: [], roles: [], positions: []};
        listItems: ReadonlyArray<keyof SearchData> = ['genders', 'orientations', 'languages', 'furryprefs', 'roles', 'positions'];

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

                this.resultsComplete = this.checkResultCompletion();
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
                    this.resultsComplete = this.checkResultCompletion();
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


        checkResultCompletion(): boolean {
            return _.every(
                this.results,
                (c: Character) => (!!core.cache.profileCache.getSync(c.name))
            );
        }


        filterKink(filter: RegExp, kink: SearchKink): boolean {
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


        updateSearch(data?: SearchData): void {
          if (data) {
            this.data = data;
          }
        }


        submit(): void {
            if(this.results !== undefined) {
                this.results = undefined;
                return;
            }
            this.error = '';
            const data: Connection.ClientCommands['FKS'] & {[key: string]: (string | number)[]} = {kinks: []};
            for(const key in this.data) {
                const item = this.data[<keyof SearchData>key];
                if(item.length > 0)
                    data[key] = key === 'kinks' ? (<SearchKink[]>item).map((x) => x.id) : (<string[]>item);
            }
            core.connection.send('FKS', data);

            // tslint:disable-next-line
            this.updateSearchHistory(this.data);
        }


        showHistory(): void {
          (<CharacterSearchHistory>this.$refs.searchHistory).show();
        }


        async updateSearchHistory(data: SearchData): Promise<void> {
            const history = (await core.settingsStore.get('searchHistory')) || [];
            const dataStr = JSON.stringify(data, null, 0);
            const filteredHistory = _.reject(history, (h: SearchData) => (JSON.stringify(h, null, 0) === dataStr));
            const newHistory: SearchData[] = _.take(_.concat([data], filteredHistory), 15);

            await core.settingsStore.set('searchHistory', newHistory);
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
            & > .search-result {
                clear: both;
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

        .search-spinner {
            float: right;
            animation: search-spin 0.75s linear infinite;
        }
    }


    @keyframes search-spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }

    }

</style>
