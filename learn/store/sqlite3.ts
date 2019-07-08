// type Sqlite3Statement = any;
// type Sqlite3Database = any;
//
// import { Character as ComplexCharacter } from '../../site/character_page/interfaces';
//
// import * as SQL from './sql';
// import { ProfileRecord, SqlStore } from './sql-store';
//
// export class Sqlite3Store extends SqlStore {
//     protected static Sqlite: any;
//
//     protected stmtGetProfile: Promise<Sqlite3Statement>;
//     protected stmtStoreProfile: Promise<Sqlite3Statement>;
//     protected stmtUpdateCounts: Promise<Sqlite3Statement>;
//
//     protected db: Promise<Sqlite3Database>;
//
//     constructor(dbName: string = 'fchat-ascending.sqlite') {
//         super(dbName);
//
//         if (!Sqlite3Store.Sqlite) {
//             throw new Error('Sqlite3Store.setSqlite() must be called before instantiation');
//         }
//
//         this.db = this.prepareDatabase(this.dbFile);
//
//         this.stmtGetProfile = this.prepareStatement(SQL.ProfileGet);
//         this.stmtStoreProfile = this.prepareStatement(SQL.ProfileInsert);
//         this.stmtUpdateCounts = this.prepareStatement(SQL.ProfileUpdateCount);
//     }
//
//     static setSqlite(Sqlite: any) {
//         Sqlite3Store.Sqlite = Sqlite;
//     }
//
//     prepareDatabase(fileName: string): Promise<Sqlite3Database> {
//         return new Promise(
//             (resolve, reject) => {
//                 // Sqlite3Store.Sqlite.verbose();
//                 const db = new Sqlite3Store.Sqlite.Database(
//                     fileName,
//                     (err: any) => {
//                         if (err) {
//                             reject(err);
//                             return;
//                         }
//
//                         resolve(db);
//                     }
//                 );
//             }
//         );
//     }
//
//     prepareStatement(sql: string): Promise<Sqlite3Statement> {
//         return new Promise(
//             async(resolve, reject) => {
//                 const s = (await this.db).prepare(
//                     sql,
//                     (err: any) => {
//                         if (err) {
//                             reject(err);
//                             return;
//                         }
//
//                         resolve(s);
//                     }
//                 );
//             }
//         );
//     }
//
//
//     getProfile(name: string): Promise<ProfileRecord | undefined> {
//         return new Promise(
//             async(resolve, reject) => {
//                 (await this.stmtGetProfile).get(
//                     this.toProfileId(name),
//                     (err: any, data: any) => {
//                         if (err) {
//                             reject(err);
//                             return;
//                         }
//
//                         if (!data) {
//                             resolve();
//                             return;
//                         }
//
//                         // tslint:disable-next-line: no-unsafe-any
//                         data.profileData = JSON.parse(data.profileData) as ComplexCharacter;
//
//                         resolve(data as ProfileRecord);
//                     }
//                 );
//             }
//         );
//     }
//
//
//     protected run(stmtName: 'stmtStoreProfile' | 'stmtUpdateCounts', data: any[]): Promise<void> {
//         return new Promise(
//             async(resolve, reject) => {
//                 if (!(stmtName in this)) {
//                     throw new Error(`Unknown statement: ${stmtName}`);
//                 }
//
//                 (await this[stmtName]).run(
//                     ...data,
//                     (err: any) => {
//                         if (err) {
//                             reject(err);
//                             return;
//                         }
//
//                         resolve();
//                     }
//                 );
//             }
//         );
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

