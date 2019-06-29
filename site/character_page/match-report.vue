<template>
    <div id="match-report" :class="{'match-report': true, minimized: minimized}" v-if="(haveScores(characterMatch.you) || haveScores(characterMatch.them))">
        <a @click="toggleMinimize()"><i :class="{fa: true, 'fa-plus': minimized, 'fa-minus': !minimized}"></i></a>

        <div v-if="haveScores(characterMatch.you)" class="scores you">
            <h3>{{characterMatch.you.you.name}}</h3>

            <ul>
                <li v-for="score in getScores(characterMatch.you)" v-if="shouldShowScore(score)" :class="getScoreClass(score)" v-html="score.description"></li>
            </ul>
        </div>

        <div class="vs">
            vs.
        </div>

        <div v-if="haveScores(characterMatch.them)" class="scores them">
            <h3>{{characterMatch.them.you.name}}</h3>

            <ul>
                <li v-for="score in getScores(characterMatch.them)" v-if="shouldShowScore(score)" :class="getScoreClass(score)" v-html="score.description"></li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop } from '@f-list/vue-ts';
    import Vue from 'vue';
    import { MatchReport, MatchResult, Score, Scoring } from './matcher';
    import * as _ from 'lodash';


    @Component
    export default class MatchReportView extends Vue {
        @Prop({required: true})
        readonly characterMatch!: MatchReport;

        minimized = false;

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
            this.minimized = !this.minimized;
        }
    }

</script>
