import {Character as ComplexCharacter, CharacterGroup, Guestbook} from '../../site/character_page/interfaces';
import { PermanentIndexedStore, ProfileRecord } from './types';
import { CharacterImage, SimpleCharacter } from '../../interfaces';

import { WorkerClient } from './worker/client';


export class WorkerStore implements PermanentIndexedStore {
    protected readonly workerClient: WorkerClient;

    constructor(jsEndpointFile: string) {
      this.workerClient = new WorkerClient(jsEndpointFile);
    }


    static async open(jsEndpointFile: string, dbName?: string): Promise<WorkerStore> {
      const store = new WorkerStore(jsEndpointFile);

      await store.workerClient.request('init', { dbName });

      return store;
    }


    async getProfile(name: string): Promise<ProfileRecord | undefined> {
        return this.workerClient.request('get', { name });
    }


    async storeProfile(character: ComplexCharacter): Promise<void> {
        return this.workerClient.request('store', { character });
    }


    async updateProfileMeta(
        name: string,
        images: CharacterImage[] | null,
        guestbook: Guestbook | null,
        friends: SimpleCharacter[] | null,
        groups: CharacterGroup[] | null
    ): Promise<void> {
      return this.workerClient.request('update-meta', { name, images, guestbook, friends, groups });
    }

    async start(): Promise<void> {
        return this.workerClient.request('start');
    }

    async stop(): Promise<void> {
        return this.workerClient.request('stop');
    }


    async flushProfiles(daysToExpire: number): Promise<void> {
        return this.workerClient.request('flush', { daysToExpire });
    }
}
