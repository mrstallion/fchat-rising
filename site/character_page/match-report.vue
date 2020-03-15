<template>
    <div id="match-report" :class="{'match-report': true, minimized: isMinimized}" v-if="(haveScores(characterMatch.you) || haveScores(characterMatch.them))">
        <a class="minimize-btn" @click.prevent="toggleMinimize()"><i :class="{fa: true, 'fa-plus': isMinimized, 'fa-minus': !isMinimized}"></i></a>

        <div class="scores you">
            <h3>
                <img :src="avatarUrl(characterMatch.you.you.name)" class="thumbnail"/>
                {{characterMatch.you.you.name}}
            </h3>

            <ul>
                <li v-for="score in getScores(characterMatch.you)" v-if="shouldShowScore(score)" :class="getScoreClass(score)" v-html="score.description"></li>
            </ul>
        </div>

        <div class="vs">
            vs.
        </div>

        <div class="scores them">
            <h3>
                <img :src="avatarUrl(characterMatch.them.you.name)" class="thumbnail" />
                {{characterMatch.them.you.name}}
            </h3>

            <ul>
                <li v-for="score in getScores(characterMatch.them)" v-if="shouldShowScore(score)" :class="getScoreClass(score)" v-html="score.description"></li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Watch } from '@f-list/vue-ts';
    import * as _ from 'lodash';
    import Vue from 'vue';
    import * as Utils from '../utils';
    import { MatchReport, MatchResult, Score, Scoring } from '../../learn/matcher';

    export interface CssClassMap {
        [key: string]: boolean;
    }


    @Component
    export default class MatchReportView extends Vue {
        @Prop({required: true})
        readonly characterMatch!: MatchReport;

        @Prop({required: true})
        readonly minimized = false;

        readonly avatarUrl = Utils.avatarURL;

        isMinimized = false;

        @Watch('minimized')
        onMinimizedChange(): void {
            this.isMinimized = this.minimized;
        }

        getScoreClass(score: Score): CssClassMap {
            const classes: CssClassMap = {};

            classes[score.getRecommendedClass()] = true;
            classes['match-score'] = true;

            return classes;
        }

        haveScores(result: MatchResult): boolean {
            return !_.every(
                result.scores,
                (s: Score) => (s.score === Scoring.NEUTRAL)
            );
        }

        shouldShowScore(score: Score): boolean {
            return (score.score !== Scoring.NEUTRAL);
        }

        getScores(result: MatchResult): Score[] {
            return _.map(result.scores, (s: Score) => (s));
        }

        toggleMinimize(): void {
            this.isMinimized = !this.isMinimized;
        }
    }
</script>
