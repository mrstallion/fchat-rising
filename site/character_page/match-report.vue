<template>
    <div id="match-report" :class="{'match-report': true, minimized: isMinimized}" v-if="(haveScores(characterMatch.you) || haveScores(characterMatch.them))">
        <a class="minimize-btn" @click="toggleMinimize()"><i :class="{fa: true, 'fa-plus': isMinimized, 'fa-minus': !isMinimized}"></i></a>

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
    import Vue from 'vue';
    import { MatchReport, MatchResult, Score, Scoring } from './matcher';
    import * as _ from 'lodash';
    import * as Utils from '../utils';

    @Component
    export default class MatchReportView extends Vue {
        @Prop({required: true})
        readonly characterMatch!: MatchReport;

        @Prop({required: true})
        minimized = false;

        readonly avatarUrl = Utils.avatarURL;

        isMinimized = false;



        @Watch('isMinimized')
        onMinimizedChange(): void {
            this.isMinimized = this.minimized;
        }


        getScoreClass(score: Score) {
            const classes: any = {};

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


        shouldShowScore(score: Score) {
            return (score.score !== Scoring.NEUTRAL);
        }


        getScores(result: MatchResult): Score[] {
            return _.map(result.scores, (s: Score) => (s));
        }


        toggleMinimize() {
            this.isMinimized = !this.isMinimized;
        }
    }

</script>
