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
    import {formatContactLink, formatContactValue} from './contact_utils';
    import { DisplayInfotag } from './interfaces';
    // import { Character as CharacterInfo } from '../../interfaces';
    import {Store} from './data_store';
    import { MatchReport, TagId } from './matcher';


    @Component
    export default class InfotagView extends Vue {
        @Prop({required: true})
        private readonly infotag!: DisplayInfotag;

        @Prop({required: true})
        private readonly characterMatch!: MatchReport;



        get tagClasses() {
            const styles: any = {
                infotag: true,
            };

            console.log(`Infotag ${this.infotag.id}: ${this.label}`);

            if ((this.characterMatch) && (this.infotag.id in this.characterMatch)) {
                const n = this.characterMatch[this.infotag.id];

                console.log(`Found match [${this.infotag.id} === ${TagId[this.infotag.id]}]: ${n}`);

                if (n >= 1)
                    styles.match = true;
                else if(n >= 0.5)
                    styles.weakMatch = true;
                else if(n === 0)
                    styles.neutral = true;
                else if(n <= -1)
                    styles.mismatch = true;
                else if(n <= -0.5)
                    styles.weakMismatch = true;
            }

            return styles;
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