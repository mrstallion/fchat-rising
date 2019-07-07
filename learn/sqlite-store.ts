// import * as Sqlite from 'better-sqlite3';
// tslint:disable-next-line:no-duplicate-imports
import * as path from 'path';

import { Database, Statement } from 'better-sqlite3';
import core from '../chat/core';

// tslint:disable-next-line: no-require-imports
// const Sqlite = require('better-sqlite3');
import { nativeRequire } from '../electron/common';

// tslint:disable-next-line: no-any
const Sqlite = nativeRequire<any>('better-sqlite3');


import { Orientation, Gender, FurryPreference, Species, CharacterAnalysis } from './matcher';
import { Character as ComplexCharacter } from '../site/character_page/interfaces';

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
    lastCounted: number | null;
    guestbookCount: number | null;
    friendCount: number | null;
    groupCount: number | null;
}

// export type Statement = any;
// export type Database = any;


export class SqliteStore {

    protected stmtGetProfile: Statement;
    protected stmtStoreProfile: Statement;
    protected stmtUpdateCounts: Statement;

    protected db: Database;
    protected checkpointTimer: NodeJS.Timer | null = null;

    constructor() {
        const dbFile = path.join(core.state.generalSettings!.logDirectory, 'fchat-ascending.sqlite');

        // tslint:disable-next-line: no-unsafe-any
        this.db = new Sqlite(dbFile, {});

        this.init();
        this.migrateDatabase();

        this.stmtGetProfile = this.db.prepare('SELECT * FROM profiles WHERE id = ?');

        this.stmtStoreProfile = this.db.prepare(
            `INSERT INTO profiles
            (id, name, profileData, firstSeen, lastFetched, gender, orientation, furryPreference,
            species, age, domSubRole, position)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                profileData=excluded.profileData,
                lastFetched=excluded.lastFetched,
                gender=excluded.gender,
                orientation=excluded.orientation,
                furryPreference=excluded.furryPreference,
                species=excluded.species,
                age=excluded.age,
                domSubRole=excluded.domSubRole,
                position=excluded.position
            `);

        this.stmtUpdateCounts = this.db.prepare(
            'UPDATE profiles SET lastCounted = ?, guestbookCount = ?, friendCount = ?, groupCount = ? WHERE id = ? LIMIT 1'
        );
    }


    // tslint:disable-next-line: prefer-function-over-method
    protected toProfileId(name: string): string {
        return name.toLowerCase();
    }


    getProfile(name: string): ProfileRecord | undefined {
        const data = this.stmtGetProfile.get(this.toProfileId(name));

        if (!data) {
            return;
        }

        // tslint:disable-next-line: no-unsafe-any
        data.profileData = JSON.parse(data.profileData) as ComplexCharacter;

        return data as ProfileRecord;
    }


    storeProfile(c: ComplexCharacter): void {
        const ca = new CharacterAnalysis(c.character);

        const data = [
            this.toProfileId(c.character.name),
            c.character.name,
            JSON.stringify(c),
            Math.round(Date.now() / 1000),
            Math.round(Date.now() / 1000),
            ca.gender,
            ca.orientation,
            ca.furryPreference,
            ca.species,
            ca.age,
            null, // domSubRole
            null // position
        ];

        this.stmtStoreProfile.run(data);
    }


    updateProfileCounts(name: string, guestbookCount: number | null, friendCount: number | null, groupCount: number | null): void {
        this.stmtUpdateCounts.run(Math.round(Date.now() / 1000), guestbookCount, friendCount, groupCount, this.toProfileId(name));
    }


    protected init(): void {
        this.db.pragma('journal_mode = WAL');
    }


    protected migrateDatabase(): void {
        this.db.exec(
    `CREATE TABLE IF NOT EXISTS "migration" (
              "version" INTEGER NOT NULL
              , UNIQUE("version")
            );

            CREATE TABLE IF NOT EXISTS "profiles" (
               "id" TEXT NOT NULL PRIMARY KEY
             , "name" TEXT NOT NULL
             , "profileData" TEXT NOT NULL
             , "firstSeen" INTEGER NOT NULL
             , "lastFetched" INTEGER NOT NULL
             , "lastCounted" INTEGER
             , "gender" INTEGER
             , "orientation" INTEGER
             , "furryPreference" INTEGER
             , "species" INTEGER
             , "age" INTEGER
             , "domSubRole" INTEGER
             , "position" INTEGER
             , "guestbookCount" INTEGER
             , "friendCount" INTEGER
             , "groupCount" INTEGER
             , UNIQUE("id")
            );

            INSERT OR IGNORE INTO migration(version) VALUES(1);
        `);
    }


    start(): void {
        this.stop();

        this.checkpointTimer = setInterval(
            () => this.db.checkpoint(),
            10 * 60 * 1000
        );
    }


    stop(): void {
        if (this.checkpointTimer) {
            clearInterval(this.checkpointTimer);

            this.checkpointTimer = null;
        }
    }
}

