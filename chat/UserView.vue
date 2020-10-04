<!-- Linebreaks inside this template will break BBCode views -->
<template><span :class="userClass" v-bind:bbcodeTag.prop="'user'" v-bind:character.prop="character" v-bind:channel.prop="channel"><span v-if="!!statusClass" :class="statusClass"></span><span v-if="!!rankIcon" :class="rankIcon"></span>{{character.name}}<span v-if="!!matchClass" :class="matchClass">{{getMatchScoreTitle(matchScore)}}</span></span></template>


<script lang="ts">
import { Component, Hook, Prop } from '@f-list/vue-ts';
import Vue from 'vue';
import {Channel, Character} from '../fchat';
import { Score, Scoring } from '../learn/matcher';
import core from './core';
import { EventBus } from './preview/event-bus';


export function getStatusIcon(status: Character.Status): string {
    switch(status) {
        case 'online':
            return 'far fa-user';
        case 'looking':
            return 'fa fa-eye';
        case 'dnd':
            return 'fa fa-minus-circle';
        case 'offline':
            return 'fa fa-ban';
        case 'away':
            return 'far fa-circle';
        case 'busy':
            return 'fa fa-cog';
        case 'idle':
            return 'far fa-clock';
        case 'crown':
            return 'fa fa-birthday-cake';
    }
}


@Component({
    components: {

    }
})
export default class UserView extends Vue {
    @Prop({required: true})
    readonly character!: Character;

    @Prop()
    readonly channel?: Channel;

    @Prop()
    readonly showStatus?: boolean = true;

    @Prop()
    readonly bookmark?: boolean = false;

    @Prop()
    readonly match?: boolean = false;

    userClass = '';

    rankIcon: string | null = null;
    statusClass: string | null = null;
    matchClass: string | null = null;
    matchScore: number | null = null;

    // tslint:disable-next-line no-any
    scoreWatcher: ((event: any) => void) | null = null;

    @Hook('mounted')
    onMounted(): void {
        this.update();

        if ((this.match) && (!this.matchClass)) {
            if (this.scoreWatcher) {
                EventBus.$off('character-score', this.scoreWatcher);
            }

            // tslint:disable-next-line no-unsafe-any no-any
            this.scoreWatcher = (event: any): void => {
                // console.log('scoreWatcher', event);

                // tslint:disable-next-line no-unsafe-any no-any
                if ((event.character) && (event.character.character.name === this.character.name)) {
                    this.update();

                    if (this.scoreWatcher) {
                        EventBus.$off('character-score', this.scoreWatcher);

                        this.scoreWatcher = null;
                    }
                }
            };

            EventBus.$on(
                'character-score',
                this.scoreWatcher
            );
        }
    }

    @Hook('beforeDestroy')
    onBeforeDestroy(): void {
        if (this.scoreWatcher)
            EventBus.$off('character-score', this.scoreWatcher);
    }


    @Hook('beforeUpdate')
    onBeforeUpdate(): void {
        this.update();
    }


    update(): void {
        this.rankIcon = null;
        this.statusClass = null;
        this.matchClass = null;
        this.matchScore = null;

        // if (this.match) console.log('Update', this.character.name);

        if(this.character.isChatOp) {
            this.rankIcon = 'far fa-gem';
        } else if(this.channel !== undefined) {
            this.rankIcon = (this.channel.owner === this.character.name)
                ? 'fa fa-key'
                : this.channel.opList.indexOf(this.character.name) !== -1
                    ? (this.channel.id.substr(0, 4) === 'adh-' ? 'fa fa-shield-alt' : 'fa fa-star')
                    : null;
        }

        if ((this.showStatus) || (this.character.status === 'crown'))
            this.statusClass = `fa-fw ${getStatusIcon(this.character.status)}`;

        // if (this.match) console.log('Update prematch', this.character.name);

        if ((core.state.settings.risingAdScore) && (this.match)) {
            const cache = core.cache.profileCache.getSync(this.character.name);

            if (cache) {
                this.matchClass = `match-found ${Score.getClasses(cache.matchScore)}`;
                this.matchScore = cache.matchScore;

                // console.log('Found match data', this.character.name, cache.matchScore);
            } else {
                // console.log('Need match data', this.character.name);

                /* tslint:disable-next-line no-floating-promises */
                core.cache.addProfile(this.character.name);
            }
        }

        // if (this.match) console.log('Update post match', this.character.name);

        const gender = this.character.gender !== undefined ? this.character.gender.toLowerCase() : 'none';

        const isBookmark = (this.bookmark) && (core.connection.isOpen) && (core.state.settings.colorBookmarks) &&
            ((this.character.isFriend) || (this.character.isBookmarked));


        this.userClass = `user-view gender-${gender}${isBookmark ? ' user-bookmark' : ''}`;

        // if (this.match) console.log('Update done');
    }


    getMatchScoreTitle(score: number | null): string {
        switch (score) {
            case Scoring.MATCH:
                return 'Great';

            case Scoring.WEAK_MATCH:
                return 'Good';

            case Scoring.WEAK_MISMATCH:
                return 'Maybe';

            case Scoring.MISMATCH:
                return 'No';
        }

        return '';
    }
}

//tslint:disable-next-line:variable-name
/* const UserView = Vue.extend({
    functional: true,
    render(this: void | Vue, createElement: CreateElement, context?: RenderContext): VNode {
        const props = <{character: Character, channel?: Channel, showStatus?: true, bookmark?: false, match?: false}>(
            context !== undefined ? context.props : (<Vue>this).$options.propsData);

        const character = props.character;

        let matchClasses: string | undefined;

        if (props.match) {
            const cache = core.cache.profileCache.getSync(character.name);

            if (cache) {
                matchClasses = Score.getClasses(cache.matchScore);
            }
        }

        let rankIcon;
        if(character.isChatOp) rankIcon = 'far fa-gem';
        else if(props.channel !== undefined)
            rankIcon = props.channel.owner === character.name ? 'fa fa-key' : props.channel.opList.indexOf(character.name) !== -1 ?
                (props.channel.id.substr(0, 4) === 'adh-' ? 'fa fa-shield-alt' : 'fa fa-star') : '';
        else rankIcon = '';
        const children: (VNode | string)[] = [character.name];
        if(rankIcon !== '') children.unshift(createElement('span', {staticClass: rankIcon}));
        if(props.showStatus !== undefined || character.status === 'crown')
            children.unshift(createElement('span', {staticClass: `fa-fw ${getStatusIcon(character.status)}`}));
        const gender = character.gender !== undefined ? character.gender.toLowerCase() : 'none';
        const isBookmark = props.bookmark !== false && core.connection.isOpen && core.state.settings.colorBookmarks &&
            (character.isFriend || character.isBookmarked);
        return createElement('span', {
            attrs: {class: `user-view gender-${gender}${isBookmark ? ' user-bookmark' : ''} ${matchClasses}`},
            domProps: {character, channel: props.channel, bbcodeTag: 'user'}
        }, children);
    }
});

export default UserView;
*/
</script>
