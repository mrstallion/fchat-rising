import * as _ from 'lodash';

import core from '../chat/core';
import { Character } from '../site/character_page/interfaces';
import { Matcher, Score, Scoring } from '../site/character_page/matcher';
import { Cache } from './cache';

export interface CharacterCacheRecord {
    character: Character;
    lastFetched: Date;
    added: Date;
    matchScore: number;
}

export class ProfileCache extends Cache<CharacterCacheRecord> {
    register(c: Character): CharacterCacheRecord {
        const k = Cache.nameKey(c.character.name);
        const score = ProfileCache.score(c);

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
