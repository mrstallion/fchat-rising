

export const ProfileInsert =
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
    `;

export const ProfileGet =
    'SELECT * FROM profiles WHERE id = ?';

export const ProfileUpdateCount =
    'UPDATE profiles SET lastCounted = ?, guestbookCount = ?, friendCount = ?, groupCount = ? WHERE id = ?';


export const DatabaseMigration =
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
    `;

