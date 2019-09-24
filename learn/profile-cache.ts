import * as _ from 'lodash';

import core from '../chat/core';
import {Character as ComplexCharacter, CharacterFriend, CharacterGroup, GuestbookState} from '../site/character_page/interfaces';
import { AsyncCache } from './async-cache';
import { Matcher, Score, Scoring } from './matcher';
import { PermanentIndexedStore } from './store/sql-store';
import {CharacterImage} from '../interfaces';


export interface MetaRecord {
    images: CharacterImage[] | null;
    groups: CharacterGroup[] | null;
    friends: CharacterFriend[] | null;
    guestbook: GuestbookState | null;
    lastFetched: Date | null;
}


export interface CountRecord {
    groupCount: number | null;
    friendCount: number | null;
    guestbookCount: number | null;
    lastCounted: number | null;
}

export interface CharacterCacheRecord {
    character: ComplexCharacter;
    lastFetched: Date;
    added: Date;
    matchScore: number;
    // counts?: CountRecord;
    meta?: MetaRecord;
}

export class ProfileCache extends AsyncCache<CharacterCacheRecord> {
    protected store?: PermanentIndexedStore;


    setStore(store: PermanentIndexedStore): void {
        this.store = store;
    }


    getSync(name: string): CharacterCacheRecord | null {
        const key = AsyncCache.nameKey(name);

        if (key in this.cache) {
            return this.cache[key];
        }

        return null;
    }


    async get(name: string, skipStore: boolean = false): Promise<CharacterCacheRecord | null> {
        const key = AsyncCache.nameKey(name);

        if (key in this.cache) {
            return this.cache[key];
        } else {
            if ((!this.store) || (skipStore)) {
                return null;
            }
        }

        const pd = await this.store.getProfile(name);

        if (!pd) {
            return null;
        }

        const cacheRecord = await this.register(pd.profileData, true);

        cacheRecord.lastFetched = new Date(pd.lastFetched * 1000);
        cacheRecord.added = new Date(pd.firstSeen * 1000);

        cacheRecord.meta = {
            lastFetched: pd.lastMetaFetched ? new Date(pd.lastMetaFetched) : null,
            groups: pd.groups,
            friends: pd.friends,
            images: pd.images,
            guestbook: pd.guestbook
        };

        /* cacheRecord.counts = {
            lastCounted: pd.lastCounted,
            groupCount: pd.groupCount,
            friendCount: pd.friendCount,
            guestbookCount: pd.guestbookCount
        }; */

        return cacheRecord;
    }


    // async registerCount(name: string, counts: CountRecord): Promise<void> {
    //     const record = await this.get(name);
    //
    //     if (!record) {
    //         // coward's way out
    //         return;
    //     }
    //
    //     record.counts = counts;
    //
    //     if (this.store) {
    //         await this.store.updateProfileCounts(name, counts.guestbookCount, counts.friendCount, counts.groupCount);
    //     }
    // }


    async registerMeta(name: string, meta: MetaRecord): Promise<void> {
        const record = await this.get(name);

        if (!record) {
            // coward's way out
            return;
        }

        record.meta = meta;

        if (this.store) {
            await this.store.updateProfileMeta(name, meta.images, meta.guestbook, meta.friends, meta.groups);
        }
    }


    async register(c: ComplexCharacter, skipStore: boolean = false): Promise<CharacterCacheRecord> {
        const k = AsyncCache.nameKey(c.character.name);
        const score = ProfileCache.score(c);

        if ((this.store) && (!skipStore)) {
            await this.store.storeProfile(c);
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


    static score(c: ComplexCharacter): number {
        const you = core.characters.ownProfile;

        if (!you) {
            return 0;
        }

        const m = Matcher.generateReport(you.character, c.character);

        // let mul = Math.sign(Math.min(m.you.total, m.them.total));

        // if (mul === 0)
        //    mul = 0.5;

        // const score =  Math.min(m.them.total, m.you.total); // mul * (Math.abs(m.you.total) + Math.abs(m.them.total));

        const yourScores = _.values(m.you.scores);
        const theirScores = _.values(m.them.scores);

        const finalScore = _.reduce(
            _.concat(yourScores, theirScores),
            (accum: Scoring | null, score: Score) => {
                if (accum === null) {
                    return (score.score !== Scoring.NEUTRAL) ? score.score : null;
                }

                return (score.score === Scoring.NEUTRAL) ? accum : Math.min(accum, score.score);
            },
            null
        );


        if ((finalScore !== null) && (finalScore > 0)) {
            // Manage edge cases where high score may not be ideal

            // Nothing to score
            if ((yourScores.length === 0) || (theirScores.length === 0)) {
                // can't know
                return Scoring.NEUTRAL;
            }

            // Only neutral scores given
            if (
                (_.every(yourScores, (n: Scoring) => n === Scoring.NEUTRAL)) ||
                (_.every(theirScores, (n: Scoring) => n === Scoring.NEUTRAL))
            ) {
                return Scoring.NEUTRAL;
            }
        }

        // console.log('Profile score', c.character.name, score, m.you.total, m.them.total,
        //    m.you.total + m.them.total, m.you.total * m.them.total);

        return (finalScore === null) ? Scoring.NEUTRAL : finalScore;
    }
}
