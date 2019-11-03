<template>
    <div :class="tagClasses">
        <span class="infotag-label">{{label}}</span>
        <span v-if="!contactLink" class="infotag-value">{{value}}</span>
        <span v-if="contactLink" class="infotag-value"><a :href="contactLink">{{value}}</a></span>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from '@f-list/vue-ts';
    import Vue from 'vue';
    import core from '../../chat/core';
    import {formatContactLink, formatContactValue} from './contact_utils';
    import { DisplayInfotag } from './interfaces';
    // import { Character as CharacterInfo } from '../../interfaces';
    import {Store} from './data_store';
    import { MatchReport, TagId } from '../../learn/matcher';
    import { CssClassMap } from './match-report.vue';


    @Component
    export default class InfotagView extends Vue {
        @Prop({required: true})
        private readonly infotag!: DisplayInfotag;

        @Prop({required: true})
        private readonly characterMatch!: MatchReport;

        get tagClasses(): CssClassMap {
            const styles: CssClassMap = {
                infotag: true
            };

            // console.log(`Infotag ${this.infotag.id}: ${this.label}`);
            const id = this.infotag.id;

            if ((core.state.settings.risingAdScore) && (this.characterMatch)) {
                const scores = this.theirInterestIsRelevant(id)
                    ? this.characterMatch.them.scores
                    : (this.yourInterestIsRelevant(id) ? this.characterMatch.you.scores : null);

                if (scores) {
                    const score = scores[id];

                    styles[score.getRecommendedClass()] = true;
                    styles['match-score'] = true;
                }
            }

            return styles;
        }


        theirInterestIsRelevant(id: number): boolean {
            return ((id === TagId.FurryPreference) || (id === TagId.Orientation) || (id === TagId.SubDomRole));
        }


        yourInterestIsRelevant(id: number): boolean {
            return ((id === TagId.Gender) || (id === TagId.Age) || (id === TagId.Species));
        }


        get label(): string {
            const infotag = Store.kinks.infotags[this.infotag.id];
            if(typeof infotag === 'undefined')
                return 'Unknown Infotag';
            return infotag.name;
        }

        get contactLink(): string | undefined {
            if(this.infotag.isContact)
                return formatContactLink(this.infotag.id, this.infotag.string!);
        }

        get value(): string {
            const infotag = Store.kinks.infotags[this.infotag.id];
            if(typeof infotag === 'undefined')
                return '';
            if(this.infotag.isContact)
                return formatContactValue(this.infotag.id, this.infotag.string!);
            switch(infotag.type) {
                case 'text':
                    return this.infotag.string!;
                case 'number':
                    if(infotag.allow_legacy && this.infotag.number === null)
                        return this.infotag.string !== undefined ? this.infotag.string : '';
                    return this.infotag.number!.toPrecision();
            }
            const listitem = Store.kinks.listitems[this.infotag.list!];
            if(typeof listitem === 'undefined')
                return '';
            return listitem.value;
        }
    }
</script>