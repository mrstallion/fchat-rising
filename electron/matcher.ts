
/*

export enum TagId {
    Age = 1,
    Orientation = 2,
    Gender = 3,
    Build = 13,
    FurryPreference = 49,
    BdsmRole = 15,
    Position = 41,
    BodyType = 51,
    ApparentAge = 64,
    RelationshipStatus = 42,
    Species = 9,
    LanguagePreference = 49
}



export enum Orientation {
    Straight = 4,
    Gay = 5,
    Bisexual = 6,
    Asexual = 7,
    Unsure = 8,
    BiMalePreference = 89,
    BiFemalePreference = 90,
    Pansexual = 127,
    BiCurious = 128
}





orientationCompatibilityMap[Orientation.Straight] = [
    [Orientation.Straight, 1],
    [Orientation.Gay, -1],
    [Orientation.Bisexual, 1],
    [Orientation.Asexual, 0],
    [Orientation.Unsure, 0],
    [Orientation.BiMalePreference, (c: CharacterInfo) => (isMale(c) ? 1 : 0.5)],
    [Orientation.BiFemalePreference, (c: CharacterInfo) => (isFemale(c) ? 1 : 0.5)],
    [Orientation.Pansexual, 1],
    [Orientation.BiCurious, 0]
];

orientationCompatibilityMap[Orientation.Gay] = [
    [Orientation.Straight, -1],
    [Orientation.Gay, 1],
    [Orientation.Bisexual, 1],
    [Orientation.Asexual, 0],
    [Orientation.Unsure, 0],
    [Orientation.BiMalePreference, (c: CharacterInfo) => (isMale(c) ? 1 : 0.5)],
    [Orientation.BiFemalePreference, (c: CharacterInfo) => (isFemale(c) ? 1 : 0.5)],
    [Orientation.Pansexual, 1],
    [Orientation.BiCurious, (c: CharacterInfo, t) => isSameGender(c, t) ? 0.5 : 1]
];

orientationCompatibilityMap[Orientation.Bisexual] = [
    [Orientation.Straight, 1],
    [Orientation.Gay, 1],
    [Orientation.Bisexual, 1],
    [Orientation.Asexual, 0],
    [Orientation.Unsure, 0],
    [Orientation.BiMalePreference, (c: CharacterInfo) => (isMale(c) ? 1 : 0.5)],
    [Orientation.BiFemalePreference, (c: CharacterInfo) => (isFemale(c) ? 1 : 0.5)],
    [Orientation.Pansexual, 1],
    [Orientation.BiCurious, 0]
];

orientationCompatibilityMap[Orientation.Asexual] = [];
orientationCompatibilityMap[Orientation.Unsure] = [];

orientationCompatibilityMap[Orientation.BiMalePreference] = [
    [Orientation.Straight, -1],
    [Orientation.Gay, 1],
    [Orientation.Bisexual, 1],
    [Orientation.Asexual, 0],
    [Orientation.Unsure, 0],
    [Orientation.BiMalePreference, (c: CharacterInfo) => (isMale(c) ? 1 : 0.5)],
    [Orientation.BiFemalePreference, (c: CharacterInfo) => (isFemale(c) ? 1 : 0.5)],
    [Orientation.Pansexual, 1],
    [Orientation.BiCurious, 0]
];



*/



export class Matcher {

    static readonly TAGID_AGE = 1;

    static readonly TAGID_ORIENTATION = 2;

    static readonly TAGID_GENDER = 3;

    static readonly TAGID_FURRY_PREFERENCE = 49;

    static readonly TAGID_BUILD = 13;

    static readonly TAGID_BDSM_ROLE = 15;
    static readonly TAGID_POSITION = 41;

    static readonly TAGID_BODY_TYPE = 51;
    static readonly TAGID_APPARENT_AGE = 64;

    static readonly TAGID_RELATIONSHIP = 42;

    static readonly TAGID_SPECIES = 9;
    static readonly TAGID_LANGUAGE_PREFERENCE = 49;




}

