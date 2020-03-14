// tslint:disable-next-line:no-duplicate-imports
// import * as path from 'path';
// import core from '../../chat/core';

import { Orientation, Gender, FurryPreference, Species } from '../matcher';
import {Character as ComplexCharacter, CharacterGroup, Guestbook} from '../../site/character_page/interfaces';
import { CharacterImage, SimpleCharacter } from '../../interfaces';

// This design should be refactored; it's bad
export interface ProfileRecord {
    id: string;
    name: string;
    profileData: ComplexCharacter;
    firstSeen: number;
    lastFetched: number;
    gender: Gender | null;
    orientation: Orientation | null;
    furryPreference: FurryPreference | null;
    species: Species | null;
    age: number | null;
    domSubRole: number | null;
    position: number | null;

    // lastCounted: number | null;
    // guestbookCount: number | null;
    // friendCount: number | null;
    // groupCount: number | null;

    lastMetaFetched: number | null;
    guestbook: Guestbook | null;
    images: CharacterImage[] | null;
    friends: SimpleCharacter[] | null;
    groups: CharacterGroup[] | null;
}

// export type Statement = any;
// export type Database = any;

export interface PermanentIndexedStore {
    getProfile(name: string): Promise<ProfileRecord | undefined>;
    storeProfile(c: ComplexCharacter): Promise<void>;

    updateProfileMeta(
        name: string,
        images: CharacterImage[] | null,
        guestbook: Guestbook | null,
        friends: SimpleCharacter[] | null,
        groups: CharacterGroup[] | null
    ): Promise<void>;

    start(): Promise<void>;
    stop(): Promise<void>;
}


// export abstract class SqlStore implements PermanentIndexedStore {
//     protected dbFile: string;
//     protected checkpointTimer: NodeJS.Timer | null = null;
//
//     constructor(dbName: string = 'fchat-ascending.sqlite') {
//         this.dbFile = path.join(core.state.generalSettings!.logDirectory, dbName);
//     }
//
//     // tslint:disable-next-line: prefer-function-over-method
//     protected toProfileId(name: string): string {
//         return name.toLowerCase();
//     }
//
//     abstract getProfile(name: string): Promise<ProfileRecord | undefined>;
//
//     abstract start(): Promise<void>;
//     abstract stop(): Promise<void>;
//
//     // tslint:disable-next-line no-any
//     protected abstract run(statementName: 'stmtStoreProfile' | 'stmtUpdateCounts', data: any[]): Promise<void>;
//
//
//     async storeProfile(c: ComplexCharacter): Promise<void> {
//         const ca = new CharacterAnalysis(c.character);
//
//         const data = [
//             this.toProfileId(c.character.name),
//             c.character.name,
//             JSON.stringify(c),
//             Math.round(Date.now() / 1000),
//             Math.round(Date.now() / 1000),
//             ca.gender,
//             ca.orientation,
//             ca.furryPreference,
//             ca.species,
//             ca.age,
//             null, // domSubRole
//             null // position
//         ];
//
//         await this.run('stmtStoreProfile', data);
//     }
//
//     async updateProfileMeta(
//         name: string,
//         images: CharacterImage[] | null,
//         guestbook: GuestbookState | null,
//         friends: CharacterFriend[] | null,
//         groups: CharacterGroup[] | null
//     ): Promise<void> {
//         throw new Error('Not implemented');
//     }
//
//     // async updateProfileCounts(
//     //     name: string,
//     //     guestbookCount: number | null,
//     //     friendCount: number | null,
//     //     groupCount: number | null
//     // ): Promise<void> {
//     //     await this.run(
//     //         'stmtUpdateCounts',
//     //         [Math.round(Date.now() / 1000), guestbookCount, friendCount, groupCount, this.toProfileId(name)]
//     //     );
//     // }
// }
//
