<template>
    <div class="infotags row">
        <div class="infotag-group col-sm-3" v-for="group in groupedInfotags" :key="group.id" style="margin-top:5px">
            <div class="infotag-title">{{group.name}}</div>
            <hr>
            <infotag :infotag="infotag" v-for="infotag in group.infotags" :key="infotag.id" :characterMatch="characterMatch"></infotag>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from '@f-list/vue-ts';
    import Vue from 'vue';
    import * as Utils from '../utils';
    import {Store} from './data_store';
    import {Character, CONTACT_GROUP_ID, DisplayInfotag} from './interfaces';

    import InfotagView from './infotag.vue';
    import { MatchReport } from './matcher';

    interface DisplayInfotagGroup {
        id: number
        name: string
        sortOrder: number
        infotags: DisplayInfotag[]
    }

    @Component({
        components: {infotag: InfotagView}
    })
    export default class InfotagsView extends Vue {
        @Prop({required: true})
        private readonly character!: Character;
        @Prop({required: true})
        readonly characterMatch!: MatchReport;

        get groupedInfotags(): DisplayInfotagGroup[] {
            const groups = Store.kinks.infotag_groups;
            const infotags = Store.kinks.infotags;
            const characterTags = this.character.character.infotags;
            const outputGroups: DisplayInfotagGroup[] = [];
            const groupedTags = Utils.groupObjectBy(infotags, 'infotag_group');
            for(const groupId in groups) {
                const group = groups[groupId]!;
                const groupedInfotags = groupedTags[groupId];
                if(groupedInfotags === undefined) continue;
                const collectedTags: DisplayInfotag[] = [];
                for(const infotag of groupedInfotags) {
                    const characterInfotag = characterTags[infotag.id];
                    if(typeof characterInfotag === 'undefined')
                        continue;
                    const newInfotag: DisplayInfotag = {
                        id: infotag.id,
                        isContact: infotag.infotag_group === CONTACT_GROUP_ID,
                        string: characterInfotag.string,
                        number: characterInfotag.number,
                        list: characterInfotag.list
                    };
                    collectedTags.push(newInfotag);
                }
                collectedTags.sort((a, b): number => {
                    const infotagA = infotags[a.id]!;
                    const infotagB = infotags[b.id]!;
                    return infotagA.name < infotagB.name ? -1 : 1;
                });
                outputGroups.push({
                    id: group.id,
                    name: group.name,
                    sortOrder: group.sort_order,
                    infotags: collectedTags
                });
            }

            outputGroups.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);

            return outputGroups.filter((a) => a.infotags.length > 0);
        }
    }
</script>