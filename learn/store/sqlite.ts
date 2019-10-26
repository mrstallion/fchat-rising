/**
 * Do not use
 */

// import * as Sqlite from 'sqlite';
// import { Character as ComplexCharacter } from '../../site/character_page/interfaces';
//
// import * as SQL from './sql';
// import { ProfileRecord, SqlStore } from './sql-store';
//
// export class SqliteStore extends SqlStore {
//     protected stmtGetProfile: Promise<Sqlite.Statement>;
//     protected stmtStoreProfile: Promise<Sqlite.Statement>;
//     protected stmtUpdateCounts: Promise<Sqlite.Statement>;
//
//     protected db: Promise<Sqlite.Database>;
//
//     constructor(dbName: string = 'fchat-ascending.sqlite') {
//         super(dbName);
//
//         this.db = Sqlite.open(this.dbFile);
//
//         this.stmtGetProfile = this.db.then((db) => db.prepare(SQL.ProfileGet));
//         this.stmtStoreProfile = this.db.then((db) => db.prepare(SQL.ProfileInsert));
//         this.stmtUpdateCounts = this.db.then((db) => db.prepare(SQL.ProfileUpdateCount));
//     }
//
//
//     async getProfile(name: string): Promise<ProfileRecord | undefined> {
//         const data = await (await this.stmtGetProfile).get(this.toProfileId(name));
//
//         if (!data) {
//             return;
//         }
//
//         // tslint:disable-next-line: no-unsafe-any
//         data.profileData = JSON.parse(data.profileData) as ComplexCharacter;
//
//         return data as ProfileRecord;
//     }
//
//
//     protected async run(stmtName: 'stmtStoreProfile' | 'stmtUpdateCounts', data: any[]): Promise<void> {
//         await (await this[stmtName]).run(...data);
//     }
//
//
//     async start(): Promise<void> {
//         await this.stop();
//
//         await (await this.db).run(SQL.DatabaseMigration);
//     }
//
//
//     async stop(): Promise<void> {
//         if (this.checkpointTimer) {
//             clearInterval(this.checkpointTimer);
//
//             this.checkpointTimer = null;
//         }
//     }
//
// }
