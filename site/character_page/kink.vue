<template>
    <div class="character-kink" :class="kinkClasses" :id="kinkId" @click="toggleSubkinks" :data-custom="customId"
        @mouseover.stop="showTooltip = true" @mouseout.stop="showTooltip = false">
        <i v-show="kink.hasSubkinks" class="fa" :class="{'fa-minus': !listClosed, 'fa-plus': listClosed}"></i>
        <i v-show="!kink.hasSubkinks && kink.isCustom" class="far custom-kink-icon"></i>
        <span class="kink-name">{{ kink.name }}</span>
        <span class="kink-custom-desc" v-if="(kink.isCustom)">{{kink.description}}</span>
        <template v-if="kink.hasSubkinks">
            <div class="subkink-list" :class="{closed: this.listClosed}">
                <kink v-for="subkink in kink.subkinks" :kink="subkink" :key="subkink.id" :comparisons="comparisons"
                    :highlights="highlights"></kink>
            </div>
        </template>
        <div class="popover popover-top" v-if="((showTooltip) && (!kink.isCustom))" style="display:block;bottom:100%;top:initial;margin-bottom:5px">
            <div class="arrow" style="left:10%"></div>
            <h5 class="popover-header">{{kink.name}}</h5>
            <div class="popover-body"><p>{{kink.description}}</p></div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {DisplayKink} from './interfaces';

    @Component({
        name: 'kink'
    })
    export default class KinkView extends Vue {
        @Prop({required: true})
        readonly kink!: DisplayKink;
        @Prop({required: true})
        readonly highlights!: {[key: number]: boolean};
        @Prop({required: true})
        readonly comparisons!: {[key: number]: string | undefined};
        listClosed = true;
        showTooltip = false;

        toggleSubkinks(): void {
            if(!this.kink.hasSubkinks)
                return;
            this.listClosed = !this.listClosed;
        }

        get kinkId(): number {
            return this.kink.isCustom ? -this.kink.id : this.kink.id;
        }

        get kinkClasses(): {[key: string]: boolean} {
            const classes: {[key: string]: boolean} = {
                'stock-kink': !this.kink.isCustom,
                'custom-kink': this.kink.isCustom,
                highlighted: !this.kink.isCustom && this.highlights[this.kink.id],
                subkink: this.kink.hasSubkinks
            };
            classes[`kink-id-${this.kinkId}`] = true;
            classes[`kink-group-${this.kink.group}`] = true;
            if(!this.kink.isCustom && typeof this.comparisons[this.kink.id] !== 'undefined')
                classes[`comparison-${this.comparisons[this.kink.id]}`] = true;
            return classes;
        }

        get customId(): number | undefined {
            return this.kink.isCustom ? this.kink.id : undefined;
        }
    }
</script>