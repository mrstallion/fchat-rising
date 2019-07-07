import * as _ from 'lodash';

import core from '../chat/core';
import { Character } from '../site/character_page/interfaces';
import { Matcher, Score, Scoring } from './matcher';
import { Cache } from './cache';
import { SqliteStore } from './sqlite-store';

export interface CharacterCacheRecord {
    character: Character;
    lastFetched: Date;
    added: Date;
    matchScore: number;
}

export class ProfileCache extends Cache<CharacterCacheRecord> {
    protected store?: SqliteStore;


    setStore(store: SqliteStore): void {
        this.store = store;
    }


    get(name: string, skipStore: boolean = false): CharacterCacheRecord | null {
        const v = super.get(name);

        if ((v !== null) || (!this.store) || (skipStore)) {
            return v;
        }

        const pd = this.store.getProfile(name);

        if (!pd) {
            return null;
        }

        return this.register(pd.profileData, true);
    }


    register(c: Character, skipStore: boolean = false): CharacterCacheRecord {
        const k = Cache.nameKey(c.character.name);
        const score = ProfileCache.score(c);

        if ((this.store) && (!skipStore)) {
            this.store.storeProfile(c);
        }

        if (k in this.cache) {
            const rExisting = this.cache[k];

            rExisting.character = c;
            rExisting.lastFetched = new Date();
            rExisting.matchScore = score;

            return rExisting;
        }

        const rNew = {
            character: c,
            lastFetched: new Date(),
            added: new Date(),
            matchScore: score
        };

        this.cache[k] = rNew;

        return rNew;
    }


    static score(c: Character): number {
        const you = core.characters.ownProfile;
        const m = Matcher.generateReport(you.character, c.character);

        // let mul = Math.sign(Math.min(m.you.total, m.them.total));

        // if (mul === 0)
        //    mul = 0.5;

        // const score =  Math.min(m.them.total, m.you.total); // mul * (Math.abs(m.you.total) + Math.abs(m.them.total));

        const finalScore = _.reduce(
            _.concat(_.values(m.them.scores), _.values(m.you.scores)),
            (accum: Scoring | null, score: Score) => {
                if (accum === null) {
                    return (score.score !== Scoring.NEUTRAL) ? score.score : null;
                }

                return (score.score === Scoring.NEUTRAL) ? accum : Math.min(accum, score.score);
            },
            null
        );

        // console.log('Profile score', c.character.name, score, m.you.total, m.them.total,
        //    m.you.total + m.them.total, m.you.total * m.them.total);

        return (finalScore === null) ? Scoring.NEUTRAL : finalScore;
    }
}
