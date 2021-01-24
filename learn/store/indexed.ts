import log from 'electron-log'; //tslint:disable-line:match-default-export-name
import * as _ from 'lodash';

import {Character as ComplexCharacter, CharacterGroup, Guestbook} from '../../site/character_page/interfaces';
import { CharacterAnalysis } from '../matcher';
import { PermanentIndexedStore, ProfileRecord } from './types';
import { CharacterImage, SimpleCharacter } from '../../interfaces';

import Bluebird from 'bluebird';


async function promisifyRequest<T>(req: IDBRequest): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        req.onsuccess = () => resolve(<T>req.result);
        req.onerror = () => reject(req.error);
    });
}


export class IndexedStore implements PermanentIndexedStore {
    protected dbName: string;
    protected db: IDBDatabase;

    protected static readonly STORE_NAME = 'profiles';
    protected static readonly LAST_FETCHED_INDEX_NAME = 'idxLastFetched';

    constructor(db: IDBDatabase, dbName: string) {
        this.dbName = dbName;
        this.db = db;
    }

    static async open(dbName: string = 'flist-ascending-profiles'): Promise<IndexedStore> {
        const request = indexedDB.open(dbName, 2);

        request.onupgradeneeded = (event) => {
            const db = request.result;

            if (event.oldVersion < 1) {
                db.createObjectStore(IndexedStore.STORE_NAME, { keyPath: 'id' });
            }

            if (event.oldVersion < 2) {
                const store = request.transaction!.objectStore(IndexedStore.STORE_NAME);

                store.createIndex(
                    IndexedStore.LAST_FETCHED_INDEX_NAME,
                    'lastFetched',
                  {
                      unique: false,
                      multiEntry: false
                  }
                );
            }
        };

        return new IndexedStore(await promisifyRequest<IDBDatabase>(request), dbName);
    }


    // tslint:disable-next-line prefer-function-over-method
    protected toProfileId(name: string): string {
        return name.toLowerCase();
    }


    async getProfile(name: string): Promise<ProfileRecord | undefined> {
        const tx = this.db.transaction(IndexedStore.STORE_NAME, 'readonly');
        const store = tx.objectStore(IndexedStore.STORE_NAME);
        const getRequest = store.get(this.toProfileId(name));

        // tslint:disable-next-line no-any
        const data = await promisifyRequest<any>(getRequest);

        if (!data) {
            // console.info('IDX empty profile', name);
            return;
        }

        // tslint:disable-next-line: no-unsafe-any
        data.profileData = data.profileData as ComplexCharacter;

        // console.log('IDX profile', name, data);

        return data as ProfileRecord;
    }


    private async prepareProfileData(c: ComplexCharacter): Promise<ProfileRecord> {
        const existing = await this.getProfile(c.character.name);
        const ca = new CharacterAnalysis(c.character);

        const data: ProfileRecord = {
            id: this.toProfileId(c.character.name),
            name: c.character.name,
            profileData: c,
            firstSeen: Math.round(Date.now() / 1000),
            lastFetched: Math.round(Date.now() / 1000),
            gender: ca.gender,
            orientation: ca.orientation,
            furryPreference: ca.furryPreference,
            species: ca.species,
            age: ca.age,
            domSubRole: ca.subDomRole, // domSubRole
            position: null, // position

            lastMetaFetched: null,
            guestbook: null,
            images: null,
            friends: null,
            groups: null

            // lastCounted: null,
            // guestbookCount: null,
            // friendCount: null,
            // groupCount: null
        };

        return (existing)
            ? _.merge(existing, data, _.pick(existing, ['firstSeen', 'lastMetaFetched', 'guestbook', 'images', 'friends', 'groups']))
            : data;
    }


    async storeProfile(character: ComplexCharacter): Promise<void> {
        const data = await this.prepareProfileData(character);

        const tx = this.db.transaction(IndexedStore.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IndexedStore.STORE_NAME);
        const putRequest = store.put(data);

        // tslint:disable-next-line no-any
        await promisifyRequest<any>(putRequest);

        // console.log('IDX store profile', c.character.name, data);
    }


    // async updateProfileCounts(
    //     name: string,
    //     guestbookCount: number | null,
    //     friendCount: number | null,
    //     groupCount: number | null
    // ): Promise<void> {
    //     const existing = await this.getProfile(name);
    //
    //     if (!existing) {
    //         return;
    //     }
    //
    //     const data = _.merge(
    //         existing,
    //         {
    //             lastCounted: Math.round(Date.now() / 1000),
    //             guestbookCount,
    //             friendCount,
    //             groupCount
    //         }
    //     );
    //
    //     const tx = this.db.transaction(IndexedStore.STORE_NAME, 'readwrite');
    //     const store = tx.objectStore(IndexedStore.STORE_NAME);
    //     const putRequest = store.put(data);
    //
    //     // tslint:disable-next-line no-any
    //     await promisifyRequest<any>(putRequest);
    //
    //     // console.log('IDX update counts', name, data);
    // }


    async updateProfileMeta(
        name: string,
        images: CharacterImage[] | null,
        guestbook: Guestbook | null,
        friends: SimpleCharacter[] | null,
        groups: CharacterGroup[] | null
    ): Promise<void> {
        const existing = await this.getProfile(name);

        if (!existing) {
            return;
        }

        const data = _.merge(
            existing,
            {
                lastMetaFetched: Math.round(Date.now() / 1000),
                guestbook,
                friends,
                groups,
                images
            }
        );

        const tx = this.db.transaction(IndexedStore.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IndexedStore.STORE_NAME);
        const putRequest = store.put(data);

        // tslint:disable-next-line no-any
        await promisifyRequest<any>(putRequest);

        // console.log('IDX update counts', name, data);
    }

    async start(): Promise<void> {
        // empty
    }

    async stop(): Promise<void> {
        // empty
    }


    async flushProfiles(daysToExpire: number): Promise<void> {
        const tx = this.db.transaction(IndexedStore.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IndexedStore.STORE_NAME);
        const idx = store.index(IndexedStore.LAST_FETCHED_INDEX_NAME);

        const totalRecords = await promisifyRequest<number>(store.count());

        const expirationTime = Math.round(Date.now() / 1000) - (daysToExpire * 24 * 60 * 60);
        const getAllKeysRequest = idx.getAllKeys(IDBKeyRange.upperBound(expirationTime));
        const result = await promisifyRequest<IDBValidKey[]>(getAllKeysRequest);

        log.info('character.cache.expire', {daysToExpire, totalRecords, removableRecords: result.length});

        await Bluebird.mapSeries(
            result,
            async(pk: IDBValidKey) => {
                log.silly('character.cache.expire.name', { name: pk });
                await promisifyRequest(store.delete(pk));
            }
        );
    }
}

