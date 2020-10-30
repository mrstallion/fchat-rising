<template>
  <div class="character-preview">
    <div v-if="match && character" class="row">
      <div class="col-2">
        <img :src="avatarUrl(character.character.name)" class="character-avatar">
      </div>

      <div class="col-10">
        <h1><span class="character-name" :class="(statusClasses || {}).userClass">{{ character.character.name }}</span></h1>
        <h3>{{ getOnlineStatus() }}</h3>

        <div class="summary">
          <span class="uc">
            <span v-if="age" :class="byScore(TagId.Age)">{{age}}-years-old </span>
            <span v-if="sexualOrientation" :class="byScore(TagId.Orientation)">{{sexualOrientation}} </span>
            <span v-if="gender" :class="byScore(TagId.Gender)">{{gender}} </span>
            <span v-if="species" :class="byScore(TagId.Species)">{{species}} </span>
          </span>

          <span v-if="furryPref" :class="byScore(TagId.FurryPreference)"><br /><span class="uc">{{furryPref}}</span></span>
          <span v-if="subDomRole" :class="byScore(TagId.SubDomRole)"><br /><span class="uc">{{subDomRole}}</span></span>
        </div>

        <match-tags v-if="match" :match="match"></match-tags>

        <div class="status-message" v-if="statusMessage">
          <h4>Status <span v-if="latestAd && (statusMessage === latestAd.message)">&amp; Latest Ad</span></h4>
          <bbcode :text="statusMessage"></bbcode>
        </div>

        <div class="latest-ad-message" v-if="latestAd && (latestAd.message !== statusMessage)">
          <h4>Latest Ad <span class="message-time">{{formatTime(latestAd.datePosted)}}</span></h4>
          <bbcode :text="latestAd.message"></bbcode>
        </div>
      </div>
    </div>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from '@f-list/vue-ts';
import Vue from 'vue';
import core from '../core';
import { methods } from '../../site/character_page/data_store';
import {Character as ComplexCharacter} from '../../site/character_page/interfaces';
import { Matcher, MatchReport } from '../../learn/matcher';
import { Character as CharacterStatus } from '../../fchat';
import { getStatusClasses, StatusClasses } from '../UserView.vue';
import * as _ from 'lodash';
import { AdCachedPosting } from '../../learn/ad-cache';
import {formatTime} from '../common';
import * as Utils from '../../site/utils';
import MatchTags from './MatchTags.vue';
import {
  furryPreferenceMapping,
  Gender,
  Orientation,
  Species,
  SubDomRole,
  TagId
} from '../../learn/matcher-types';
import { BBCodeView } from '../../bbcode/view';


@Component({
    components: {
      'match-tags': MatchTags,
      bbcode: BBCodeView(core.bbCodeParser)
    }
})
export default class CharacterPreview extends Vue {
  @Prop
  readonly id?: number;

  characterName?: string;
  character?: ComplexCharacter;
  match?: MatchReport;
  ownCharacter?: ComplexCharacter;
  onlineCharacter?: CharacterStatus;
  statusClasses?: StatusClasses;
  latestAd?: AdCachedPosting;
  statusMessage?: string;

  age?: string;
  sexualOrientation?: string;
  species?: string;
  gender?: string;
  furryPref?: string;
  subDomRole?: string;

  formatTime = formatTime;
  readonly avatarUrl = Utils.avatarURL;
  TagId = TagId;

  async load(characterName: string): Promise<void> {
    if (
      (this.characterName === characterName)
      && (this.match)
      && (this.character)
      && (this.ownCharacter)
      && (this.ownCharacter.character.name === core.characters.ownProfile.character.name)
    ) {
      this.updateOnlineStatus();
      this.updateAdStatus();
      return;
    }

    this.characterName = characterName;

    this.match = undefined;
    this.character = undefined;
    this.ownCharacter = core.characters.ownProfile;

    this.updateOnlineStatus();
    this.updateAdStatus();

    this.character = await this.getCharacterData(characterName);
    this.match = Matcher.identifyBestMatchReport(this.ownCharacter.character, this.character.character);

    this.updateDetails();
  }


  updateOnlineStatus(): void {
    this.onlineCharacter = core.characters.get(this.characterName!);

    if (!this.onlineCharacter) {
      this.statusClasses = undefined;
      return;
    }

    this.statusMessage = this.onlineCharacter.statusText;
    this.statusClasses = getStatusClasses(this.onlineCharacter, undefined, true, true, false);
  }


  updateAdStatus(): void {
    const cache = core.cache.adCache.get(this.characterName!);

    if ((!cache) || (cache.posts.length === 0)) {
      this.latestAd = undefined;
      return;
    }

    this.latestAd = cache.posts[cache.posts.length - 1];
  }


  updateDetails(): void {
    if (!this.match) {
      this.age = undefined;
      this.species = undefined;
      this.gender = undefined;
      this.furryPref = undefined;
      this.subDomRole = undefined;
      this.sexualOrientation = undefined;
      return;
    }

    const a = this.match.them.yourAnalysis;
    const c = this.match.them.you;

    const rawSpecies = Matcher.getTagValue(TagId.Species, c);
    const rawAge = Matcher.getTagValue(TagId.Age, c);

    // if ((a.species) && (!Species[a.species])) {
      // console.log('SPECIES', a.species, rawSpecies);
    // }

    if ((a.orientation) && (!Orientation[a.orientation])) {
      console.error('Missing Orientation', a.orientation, c.name);
    }

    this.age = a.age ? this.readable(`${a.age}`) : (rawAge && /[0-9]/.test(rawAge.string || '') && rawAge.string) || undefined;
    this.species = a.species ? this.readable(Species[a.species]) : (rawSpecies && rawSpecies.string) || undefined;
    this.gender = a.gender ? this.readable(Gender[a.gender]) : undefined;
    this.furryPref = a.furryPreference ? this.readable(furryPreferenceMapping[a.furryPreference]) : undefined;
    this.subDomRole = a.subDomRole ? this.readable(SubDomRole[a.subDomRole]) : undefined;
    this.sexualOrientation = a.orientation ? this.readable(Orientation[a.orientation]) : undefined;
  }

  readable(s: string): string {
    return s.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
      .replace(/(always|usually) (submissive|dominant)/, '$2')
      .replace(/bi (fe)?male preference/, 'bisexual');
  }

  byScore(_tagId: any): string {
    return '';

    // too much
    // if (!this.match) {
    //   return '';
    // }
    //
    // const score = this.match.merged[tagId];
    //
    // if (!score) {
    //   return '';
    // }
    //
    // return score.getRecommendedClass();
  }


  getOnlineStatus(): string {
    if (!this.onlineCharacter) {
      return 'Offline';
    }

    const s = this.onlineCharacter.status as string;

    return `${s.substr(0, 1).toUpperCase()}${s.substr(1)}`;
  }


  async getCharacterData(characterName: string): Promise<ComplexCharacter> {
      const cache = await core.cache.profileCache.get(characterName);

      if (cache) {
        return cache.character;
      }

      return methods.characterData(characterName, this.id, false);
  }
}
</script>

<style lang="scss">
  .character-preview {
    padding: 10px;
    padding-right: 15px;
    background-color: var(--input-bg);
    max-height: 100%;
    overflow: hidden;
    opacity: 0.95;
    border-radius: 0 5px 5px 5px;
    border: 1px solid var(--secondary);

    .summary {
      font-size: 125%;

      .uc {
        display: inline-block;

        &::first-letter {
          text-transform: capitalize;
        }
      }

      .match {
        background-color: var(--scoreMatchBg);
        border: solid 1px var(--scoreMatchFg);
      }

      .weak-match {
        background-color: var(--scoreWeakMatchBg);
        border: 1px solid var(--scoreWeakMatchFg);
      }

      .weak-mismatch {
        background-color: var(--scoreWeakMismatchBg);
        border: 1px solid var(--scoreWeakMismatchFg);
      }

      .mismatch {
        background-color: var(--scoreMismatchBg);
        border: 1px solid var(--scoreMismatchFg);
      }
    }

    .matched-tags {
      margin-top: 1rem;
    }

    h1 {
      line-height: 100%;
      margin-bottom: 0;
      font-size: 2em;
    }

    h3 {
      font-size: 1.1rem;
      color: var(--dark);
    }

    h4 {
      font-size: 1.25rem;
      margin-bottom: 0;

      .message-time {
        font-size: 80%;
        font-weight: normal;
        color: var(--messageTimeFgColor);
        margin-left: 2px;
      }
    }

    .status-message,
    .latest-ad-message {
      display: block;
      background-color: rgba(0,0,0,0.2);
      padding: 10px;
      border-radius: 5px;
      margin-top: 1.3rem;
    }

    .character-avatar {
      width: 100%;
      height: auto;
    }
  }
</style>
