// // import { Database, Statement } from 'better-sqlite3';
//
// type Database = any;
// type Statement = any;
//
// import { ProfileRecord, SqlStore } from './sql-store';
// import { Character as ComplexCharacter } from '../../site/character_page/interfaces';
// import * as SQL from './sql';
//
//
// export class BetterSqliteStore extends SqlStore {
//     protected static Sqlite: any;
//
//     protected stmtGetProfile: Statement;
//     protected stmtStoreProfile: Statement;
//     protected stmtUpdateCounts: Statement;
//
//     protected db: Database;
//     protected checkpointTimer: NodeJS.Timer | null = null;
//
//     constructor(name: string) {
//         super(name);
//
//         if (!BetterSqliteStore.Sqlite) {
//             throw new Error('BetterSqliteStore.setSqlite() must be called before instantiation');
//         }
//
//         this.db = new BetterSqliteStore.Sqlite(this.dbFile, {});
//
//         this.stmtGetProfile = this.db.prepare(SQL.ProfileGet);
//         this.stmtStoreProfile = this.db.prepare(SQL.ProfileInsert);
//         this.stmtUpdateCounts = this.db.prepare(SQL.ProfileUpdateCount);
//     }
//
//
//     static setSqlite(Sqlite: any) {
//         BetterSqliteStore.Sqlite = Sqlite;
//     }
//
//
//     async getProfile(name: string): Promise<ProfileRecord | undefined> {
//         const data = this.stmtGetProfile.get(this.toProfileId(name));
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
//         if (!(stmtName in this)) {
//             throw new Error(`Unknown statement: ${stmtName}`);
//         }
//
//         this[stmtName].run(data);
//     }
//
//
//     async start(): Promise<void> {
//         await this.stop();
//
//         this.db.pragma('journal_mode = WAL');
//         this.db.exec(SQL.DatabaseMigration);
//
//         this.checkpointTimer = setInterval(
//             () => this.db.checkpoint(),
//             10 * 60 * 1000
//         );
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
// }
//
