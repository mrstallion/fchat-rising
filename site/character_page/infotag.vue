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
    import { Character, DisplayInfotag } from './interfaces';
    // import { Character as CharacterInfo } from '../../interfaces';
    import {Store} from './data_store';


    @Component
    export default class InfotagView extends Vue {
        @Prop({required: true})
        private readonly infotag!: DisplayInfotag;

        @Prop({required: true})
        private readonly selfCharacter!: Character;



        get tagClasses() {
            const styles = {
                infotag: true,
            };

            //console.log('TAG', this.label, this.value, this.infotag);

            return this.getCharacterCompatibilityStyles(styles, this.selfCharacter);
        }


        getCharacterCompatibilityStyles(styles: any, a: Character) {
            if (a.character.name) {
                styles.infotag = true;
            }

            // const c: CharacterInfo = this.selfCharacter.character;
            // const t = this.infotag;

           /* console.log(this.label, this.value, this.infotag.id, this.infotag, c.infotags);

            switch (t.id) {
                case InfotagView.TAGID_ORIENTATION:
                    break;

                default:
                    // do nothing;
                    break;
            }*/

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