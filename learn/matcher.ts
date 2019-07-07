import * as _ from 'lodash';
import { Character, CharacterInfotag } from '../interfaces';

/* eslint-disable no-null-keyword */

export enum TagId {
    Age = 1,
    Orientation = 2,
    Gender = 3,
    Build = 13,
    FurryPreference = 29,
    BdsmRole = 15,
    Position = 41,
    BodyType = 51,
    ApparentAge = 64,
    RelationshipStatus = 42,
    Species = 9,
    LanguagePreference = 49
}

export enum Gender {
    Male = 1,
    Female = 2,
    Transgender = 3,
    Herm = 32,
    MaleHerm = 51,
    Cuntboy = 69,
    None = 105,
    Shemale = 141
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

export enum BodyType {
    Anthro = 122,
    Feral = 121,
    Morphable = 123,
    Varies = 124,
    Other = 125,
    Androgynous = 126,
    Human = 143,
    Taur = 145
}

export enum KinkPreference {
    Favorite = 1,
    Yes = 0.5,
    Maybe = -0.5,
    No = -1
}

enum Kink {
    Females = 554,
    MaleHerms = 552,
    Males = 553,
    Transgenders = 551,
    Herms = 132,
    Shemales = 356,
    Cuntboys = 231,

    OlderCharacters = 109,
    YoungerCharacters = 197,
    Ageplay = 196,
    UnderageCharacters = 207,

    AnthroCharacters = 587,
    Humans = 609,

    Mammals = 224
}

export enum FurryPreference {
    FurriesOnly = 39,
    FursAndHumans = 40,
    HumansOnly = 41,
    HumansPreferredFurriesOk = 150,
    FurriesPreferredHumansOk = 149
}

interface GenderKinkIdMap {
    [key: number]: Kink
}

const genderKinkMapping: GenderKinkIdMap = {
    [Gender.Female]: Kink.Females,
    [Gender.Male]: Kink.Males,
    [Gender.Cuntboy]: Kink.Cuntboys,
    [Gender.Herm]: Kink.Herms,
    [Gender.MaleHerm]: Kink.MaleHerms,
    [Gender.Shemale]: Kink.Shemales,
    [Gender.Transgender]: Kink.Transgenders
};

 // if no species and 'no furry chareacters', === human
 // if no species and dislike 'antho characters' === human

export enum Species {
    Human = 609,
    Equine = 236,
    Feline = 212,
    Canine = 226,
    Vulpine = 213,
    Avian = 215,
    Amphibian = 223,
    Cervine = 227,
    Insect = 237,
    Lapine = 214,
    Musteline = 328,
    Dragon = 228,
    Procyon = 325,
    Rodent = 283,
    Ursine = 326,
    MarineMammal = 309,
    Primate = 613,
    Elf = 611,
    Orc = 615,
    Fish = 608,
    Reptile = 225,
    Anthro = 587,
    Minotaur = 12121212
 }

const nonAnthroSpecies = [Species.Human, Species.Elf, Species.Orc];

const mammalSpecies = [Species.Equine, Species.Feline, Species.Canine, Species.Vulpine, Species.Cervine, Species.Lapine,
    Species.Musteline, Species.Rodent, Species.Ursine, Species.MarineMammal, Species.Primate, Species.Elf, Species.Orc,
    Species.Anthro, Species.Minotaur];

interface SpeciesMap {
    [key: number]: string[];
}

interface SpeciesStrMap {
    [key: number]: string;
}

const speciesNames: SpeciesStrMap = {
    [Species.MarineMammal]: 'marine mammals',
    [Species.Elf]: 'elves',
    [Species.Fish]: 'fishes'
};

const speciesMapping: SpeciesMap = {
    [Species.Human]: ['human', 'humanoid', 'angel', 'android'],
    [Species.Equine]: ['horse', 'stallion', 'mare', 'filly', 'equine', 'shire', 'donkey', 'mule', 'zebra', 'centaur', 'pony' ],
    [Species.Feline]: ['cat', 'kitten', 'catgirl', 'neko', 'tiger', 'puma', 'lion', 'lioness',
        'tigress', 'feline', 'jaguar', 'cheetah', 'lynx', 'leopard'],
    [Species.Canine]: ['dog', 'wolf', 'dingo', 'coyote', 'jackal', 'canine', 'doberman', 'husky'],
    [Species.Vulpine]: ['fox', 'fennec', 'kitsune', 'vulpine', 'vixen'],
    [Species.Avian]: ['bird', 'gryphon', 'phoenix', 'roc', 'chimera', 'avian'],
    [Species.Amphibian]: ['salamander', 'frog', 'toad', 'newt'],
    [Species.Cervine]: ['deer', 'elk', 'moose'],
    [Species.Insect]: ['bee', 'wasp', 'spider', 'scorpion', 'ant', 'insect'],
    [Species.Lapine]: ['bunny', 'rabbit', 'hare', 'lapine'],
    [Species.Dragon]: ['dragon', 'drake', 'wyvern'],
    [Species.Musteline]: ['mink', 'ferret', 'weasel', 'stoat', 'otter', 'wolverine', 'marten'],
    [Species.Procyon]: ['raccoon', 'coatimund', 'longtail'],
    [Species.Rodent]: ['rat', 'mouse', 'chipmunk', 'squirrel', 'rodent'],
    [Species.Ursine]: ['bear', 'panda', 'black bear', 'brown bear', 'polar bear'],
    [Species.MarineMammal]: ['whale', 'killer whale', 'dolphin'],
    [Species.Primate]: ['monkey', 'ape', 'chimp', 'chimpanzee', 'gorilla'],
    [Species.Elf]: ['elf'],
    [Species.Fish]: ['fish', 'shark', 'great white'],
    [Species.Orc]: ['orc'],
    [Species.Reptile]: ['chameleon', 'anole', 'alligator', 'snake', 'crocodile', 'lizard'],
    [Species.Anthro]: ['anthro', 'anthropomorphic'],
    [Species.Minotaur]: ['minotaur']
};


interface FchatGenderMap {
    [key: string]: Gender;
}

const fchatGenderMap: FchatGenderMap = {
    None: Gender.None,
    Male: Gender.Male,
    Female: Gender.Female,
    Shemale: Gender.Shemale,
    Herm: Gender.Herm,
    'Male-Herm': Gender.MaleHerm,
    'Cunt-boy': Gender.Cuntboy,
    Transgender: Gender.Transgender
};

interface KinkPreferenceMap {
    [key: string]: KinkPreference;
}

const kinkMapping: KinkPreferenceMap = {
    favorite: KinkPreference.Favorite,
    yes: KinkPreference.Yes,
    maybe: KinkPreference.Maybe,
    no: KinkPreference.No
};

export interface MatchReport {
    you: MatchResult;
    them: MatchResult;
}

export interface MatchResultCharacterInfo {
    species: Species | null;
    gender: Gender | null;
    orientation: Orientation | null;
}

export interface MatchResultScores {
    [key: number]: Score;
    [TagId.Orientation]: Score;
    [TagId.Gender]: Score;
    [TagId.Age]: Score;
    [TagId.FurryPreference]: Score;
    [TagId.Species]: Score;
}

export interface MatchResult {
    you: Character,
    them: Character,
    scores: MatchResultScores;
    info: MatchResultCharacterInfo;
    total: number;

    yourAnalysis: CharacterAnalysis;
    theirAnalysis: CharacterAnalysis;
}

export enum Scoring {
    MATCH = 1,
    WEAK_MATCH = 0.5,
    NEUTRAL = 0,
    WEAK_MISMATCH = -0.5,
    MISMATCH = -1
}

export interface ScoreClassMap {
    [key: number]: string;
}

const scoreClasses: ScoreClassMap = {
    [Scoring.MATCH]: 'match',
    [Scoring.WEAK_MATCH]: 'weak-match',
    [Scoring.NEUTRAL]: 'neutral',
    [Scoring.WEAK_MISMATCH]: 'weak-mismatch',
    [Scoring.MISMATCH]: 'mismatch'
};

export class Score {
    readonly score: Scoring;
    readonly description: string;

    constructor(score: Scoring, description: string = '') {
        if ((score !== Scoring.NEUTRAL) && (description === ''))
            throw new Error('Description must be provided if score is not neutral');

        this.score = score;
        this.description = description;
    }

    getRecommendedClass(): string {
        return Score.getClasses(this.score);
    }

    static getClasses(score: Scoring): string {
        return scoreClasses[score];
    }
}


export class CharacterAnalysis {
    readonly character: Character;

    readonly gender: Gender | null;
    readonly orientation: Orientation | null;
    readonly species: Species | null;
    readonly furryPreference: FurryPreference | null;
    readonly age: number | null;

    readonly isAnthro: boolean | null;
    readonly isHuman: boolean | null;
    readonly isMammal: boolean | null;

    constructor(c: Character) {
        this.character = c;

        this.gender = Matcher.getTagValueList(TagId.Gender, c);
        this.orientation = Matcher.getTagValueList(TagId.Orientation, c);
        this.species = Matcher.species(c);
        this.furryPreference = Matcher.getTagValueList(TagId.FurryPreference, c);

        const ageTag = Matcher.getTagValue(TagId.Age, c);

        this.age = ((ageTag) && (ageTag.string)) ? parseInt(ageTag.string, 10) : null;

        this.isAnthro = Matcher.isAnthro(c);
        this.isHuman = Matcher.isHuman(c);
        this.isMammal = Matcher.isMammal(c);
    }
}


/**
 * Answers the question: What YOU think about THEM
 * Never what THEY think about YOU
 *
 * So, when comparing two characters, you have to run it twice (you, them / them, you)
 * to get the full picture
 */
export class Matcher {
    readonly you: Character;
    readonly them: Character;

    readonly yourAnalysis: CharacterAnalysis;
    readonly theirAnalysis: CharacterAnalysis;


    constructor(you: Character, them: Character, yourAnalysis?: CharacterAnalysis, theirAnalysis?: CharacterAnalysis) {
        this.you = you;
        this.them = them;

        this.yourAnalysis = yourAnalysis || new CharacterAnalysis(you);
        this.theirAnalysis = theirAnalysis || new CharacterAnalysis(them);
    }

    static generateReport(you: Character, them: Character): MatchReport {
        const yourAnalysis = new CharacterAnalysis(you);
        const theirAnalysis = new CharacterAnalysis(them);

        const youThem = new Matcher(you, them, yourAnalysis, theirAnalysis);
        const themYou = new Matcher(them, you, theirAnalysis, yourAnalysis);

        return {
            you: youThem.match(),
            them: themYou.match()
        };
    }

    match(): MatchResult {
        const data: MatchResult = {
            you: this.you,
            them: this.them,

            yourAnalysis: this.yourAnalysis,
            theirAnalysis: this.theirAnalysis,

            total: 0,

            scores: {
                [TagId.Orientation]: this.resolveOrientationScore(),
                [TagId.Gender]: this.resolveGenderScore(),
                [TagId.Age]: this.resolveAgeScore(),
                [TagId.FurryPreference]: this.resolveFurryPairingsScore(),
                [TagId.Species]: this.resolveSpeciesScore()
            },

            info: {
                species: Matcher.species(this.you),
                gender: Matcher.getTagValueList(TagId.Gender, this.you),
                orientation: Matcher.getTagValueList(TagId.Orientation, this.you)
            }
        };

        data.total = _.reduce(
            data.scores,
            (accum: number, s: Score) => (accum + s.score),
            0
        );

        return data;
    }

    private resolveOrientationScore(): Score {
        // Question: If someone identifies themselves as 'straight cuntboy', how should they be matched? like a straight female?

        return Matcher.scoreOrientationByGender(this.yourAnalysis.gender, this.yourAnalysis.orientation, this.theirAnalysis.gender);
    }


    static scoreOrientationByGender(yourGender: Gender | null, yourOrientation: Orientation | null, theirGender: Gender | null): Score {
        if ((yourGender === null) || (theirGender === null) || (yourOrientation === null))
            return new Score(Scoring.NEUTRAL);

        // CIS
        // tslint:disable-next-line curly
        if (Matcher.isCisGender(yourGender)) {
            if (yourGender === theirGender) {
                // same sex CIS
                if (yourOrientation === Orientation.Straight)
                    return new Score(Scoring.MISMATCH, 'No <span>same sex</span>');

                if (
                    (yourOrientation === Orientation.Gay)
                    || (yourOrientation === Orientation.Bisexual)
                    || (yourOrientation === Orientation.Pansexual)
                    || ((yourOrientation === Orientation.BiFemalePreference) && (theirGender === Gender.Female))
                    || ((yourOrientation === Orientation.BiMalePreference) && (theirGender === Gender.Male))
                )
                    return new Score(Scoring.MATCH, 'Loves <span>same sex</span>');

                if (
                    (yourOrientation === Orientation.BiCurious)
                    || ((yourOrientation === Orientation.BiFemalePreference) && (theirGender === Gender.Male))
                    || ((yourOrientation === Orientation.BiMalePreference) && (theirGender === Gender.Female))
                )
                    return new Score(Scoring.WEAK_MATCH, 'Likes <span>same sex</span>');
            } else if (Matcher.isCisGender(theirGender)) {
                // straight CIS
                if (yourOrientation === Orientation.Gay)
                    return new Score(Scoring.MISMATCH, 'No <span>opposite sex</span>');

                if (
                    (yourOrientation === Orientation.Straight)
                    || (yourOrientation === Orientation.Bisexual)
                    || (yourOrientation === Orientation.BiCurious)
                    || (yourOrientation === Orientation.Pansexual)
                    || ((yourOrientation === Orientation.BiFemalePreference) && (theirGender === Gender.Female))
                    || ((yourOrientation === Orientation.BiMalePreference) && (theirGender === Gender.Male))
                )
                    return new Score(Scoring.MATCH, 'Loves <span>opposite sex</span>');

                if (
                    ((yourOrientation === Orientation.BiFemalePreference) && (theirGender === Gender.Male))
                    || ((yourOrientation === Orientation.BiMalePreference) && (theirGender === Gender.Female))
                )
                    return new Score(Scoring.WEAK_MATCH, 'Likes <span>opposite sex</span>');
            }
        }

        return new Score(Scoring.NEUTRAL);
    }


    static formatKinkScore(score: KinkPreference, description: string): Score {
        if (score === KinkPreference.No)
            return new Score(Scoring.MISMATCH, `No <span>${description}</span>`);

        if (score === KinkPreference.Maybe)
            return new Score(Scoring.WEAK_MISMATCH, `Hesitant on <span>${description}</span>`);

        if (score === KinkPreference.Yes)
            return new Score(Scoring.WEAK_MATCH, `Likes <span>${description}</span>`);

        if (score === KinkPreference.Favorite)
            return new Score(Scoring.MATCH, `Loves <span>${description}</span>`);

        return new Score(Scoring.NEUTRAL);
    }

    private resolveSpeciesScore(): Score {
        const you = this.you;
        const theirAnalysis = this.theirAnalysis;
        const theirSpecies = theirAnalysis.species;

        if (theirSpecies === null)
            return new Score(Scoring.NEUTRAL);

        const speciesScore = Matcher.getKinkSpeciesPreference(you, theirSpecies);

        if (speciesScore !== null) {
            const speciesName = speciesNames[theirSpecies] || `${Species[theirSpecies].toLowerCase()}s`;

            return Matcher.formatKinkScore(speciesScore, speciesName);
        }

        if (theirAnalysis.isAnthro) {
            const anthroScore = Matcher.getKinkPreference(you, Kink.AnthroCharacters);

            if (anthroScore !== null)
                return Matcher.formatKinkScore(anthroScore, 'anthros');
        }

        if (theirAnalysis.isMammal) {
            const mammalScore = Matcher.getKinkPreference(you, Kink.Mammals);

            if (mammalScore !== null)
                return Matcher.formatKinkScore(mammalScore, 'mammals');
        }

        return new Score(Scoring.NEUTRAL);
    }


    formatScoring(score: Scoring, description: string): Score {
        let type = '';

        switch (score) {
            case Scoring.MISMATCH:
                type = 'No';
                break;

            case Scoring.WEAK_MISMATCH:
                type = 'Hesitant on';
                break;

            case Scoring.WEAK_MATCH:
                type = 'Likes';
                break;

            case Scoring.MATCH:
                type = 'Loves';
                break;
        }

        return new Score(score, `${type} <span>${description}</span>`);
    }

    private resolveFurryPairingsScore(): Score {
        const you = this.you;
        const theyAreAnthro = this.theirAnalysis.isAnthro;
        const theyAreHuman = this.theirAnalysis.isHuman;

        const score = theyAreAnthro
            ? Matcher.furryLikeabilityScore(you)
            : (theyAreHuman ? Matcher.humanLikeabilityScore(you) : Scoring.NEUTRAL);

        if (score === Scoring.WEAK_MATCH)
            return new Score(
                score,
                theyAreAnthro
                    ? 'Would prefer <span>humans</span>, ok with anthros'
                    : 'Would prefer <span>anthros</span>, ok with humans'
            );

        return this.formatScoring(score, theyAreAnthro ? 'furry pairings' : theyAreHuman ? 'human pairings' : '');
    }

    static furryLikeabilityScore(c: Character): Scoring {
        const furryPreference = Matcher.getTagValueList(TagId.FurryPreference, c);

        if (
            (furryPreference === FurryPreference.FursAndHumans) ||
            (furryPreference === FurryPreference.FurriesPreferredHumansOk) ||
            (furryPreference === FurryPreference.FurriesOnly)
        )
            return Scoring.MATCH;

        if (furryPreference === FurryPreference.HumansPreferredFurriesOk)
            return Scoring.WEAK_MATCH;

        if (furryPreference === FurryPreference.HumansOnly)
            return Scoring.MISMATCH;

        return Scoring.NEUTRAL;
    }

    static humanLikeabilityScore(c: Character): Scoring {
        const humanPreference = Matcher.getTagValueList(TagId.FurryPreference, c);

        if (
            (humanPreference === FurryPreference.FursAndHumans)
            || (humanPreference === FurryPreference.HumansPreferredFurriesOk)
            || (humanPreference === FurryPreference.HumansOnly)
        )
            return Scoring.MATCH;

        if (humanPreference === FurryPreference.FurriesPreferredHumansOk)
            return Scoring.WEAK_MATCH;

        if (humanPreference === FurryPreference.FurriesOnly)
            return Scoring.MISMATCH;

        return Scoring.NEUTRAL;
    }

    private resolveAgeScore(): Score {
        const you = this.you;
        const theirAge = this.theirAnalysis.age;

        if (theirAge === null)
            return new Score(Scoring.NEUTRAL);

        const ageplayScore = Matcher.getKinkPreference(you, Kink.Ageplay);
        const underageScore = Matcher.getKinkPreference(you, Kink.UnderageCharacters);

        if ((theirAge < 16) && (ageplayScore !== null))
            return Matcher.formatKinkScore(ageplayScore, `ages of ${theirAge}`);

        if ((theirAge < 16) && (ageplayScore === null))
            return Matcher.formatKinkScore(KinkPreference.No, `ages of ${theirAge}`);

        if ((theirAge < 18) && (underageScore !== null))
            return Matcher.formatKinkScore(underageScore, `ages of ${theirAge}`);

        const yourAge = this.yourAnalysis.age;

        if (yourAge !== null) {
            const olderCharactersScore = Matcher.getKinkPreference(you, Kink.OlderCharacters);
            const youngerCharactersScore = Matcher.getKinkPreference(you, Kink.YoungerCharacters);

            if ((yourAge < theirAge) && (olderCharactersScore !== null))
                return Matcher.formatKinkScore(olderCharactersScore, 'older characters');

            if ((yourAge > theirAge) && (youngerCharactersScore !== null))
                return Matcher.formatKinkScore(youngerCharactersScore, 'younger characters');
        }

        return new Score(Scoring.NEUTRAL);
    }

    private resolveGenderScore(): Score {
        const you = this.you;

        const theirGender = this.theirAnalysis.gender;

        if (theirGender === null)
            return new Score(Scoring.NEUTRAL);

        const genderName = `${Gender[theirGender].toLowerCase()}s`;
        const genderKinkScore = Matcher.getKinkGenderPreference(you, theirGender);

        if (genderKinkScore !== null)
            return Matcher.formatKinkScore(genderKinkScore, genderName);

        return new Score(Scoring.NEUTRAL);
    }

    static getTagValue(tagId: number, c: Character): CharacterInfotag | undefined {
        return c.infotags[tagId];
    }

    static getTagValueList(tagId: number, c: Character): number | null {
        const t = this.getTagValue(tagId, c);

        if ((!t) || (!t.list))
            return null;

        return t.list;
    }

    static isCisGender(...genders: Gender[] | null[]): boolean {
        return _.every(genders, (g: Gender) => ((g === Gender.Female) || (g === Gender.Male)));
    }

    static getKinkPreference(c: Character, kinkId: number): KinkPreference | null {
        if (!(kinkId in c.kinks))
            return null;

        return kinkMapping[c.kinks[kinkId] as string];
    }

    static getKinkGenderPreference(c: Character, gender: Gender): KinkPreference | null {
        if (!(gender in genderKinkMapping))
            return null;

        return this.getKinkPreference(c, genderKinkMapping[gender]);
    }

    static getKinkSpeciesPreference(c: Character, species: Species): KinkPreference | null {
        return this.getKinkPreference(c, species);
    }

    static has(c: Character, kinkId: Kink): boolean {
        const r = Matcher.getKinkPreference(c, kinkId);

        return (r !== null);
    }

    static isMammal(c: Character): boolean | null {
        const species = Matcher.species(c);

        if (species === null)
            return null;

        return (mammalSpecies.indexOf(species) >= 0);
    }

    static isAnthro(c: Character): boolean | null {
        const bodyTypeId = this.getTagValueList(TagId.BodyType, c);

        if (bodyTypeId === BodyType.Anthro)
            return true;

        const speciesId = this.species(c);

        if (!speciesId)
            return null;

        return (nonAnthroSpecies.indexOf(speciesId) < 0);
    }

    static isHuman(c: Character): boolean | null {
        const bodyTypeId = this.getTagValueList(TagId.BodyType, c);

        if (bodyTypeId === BodyType.Human)
            return true;

        const speciesId = this.species(c);

        return (speciesId === Species.Human);
    }

    static species(c: Character): Species | null {
        let foundSpeciesId: Species | null = null;
        let match = '';

        const mySpecies = this.getTagValue(TagId.Species, c);

        if ((!mySpecies) || (!mySpecies.string))
            return Species.Human; // best guess

        const finalSpecies = mySpecies.string.toLowerCase();

        _.each(
            speciesMapping,
            (keywords: string[], speciesId: string) => {
                _.each(
                    keywords,
                    (k: string) => {
                        if ((k.length > match.length) && (finalSpecies.indexOf(k) >= 0)) {
                            match = k;
                            foundSpeciesId = parseInt(speciesId, 10);
                        }
                    }
                );
            }
        );

        // tslint:disable-next-line: strict-type-predicates
        return (foundSpeciesId === null) ? null : parseInt(foundSpeciesId, 10);
    }


    static strToGender(fchatGenderStr: string | undefined): Gender | null {
        if (fchatGenderStr === undefined) {
            return null;
        }

        if (fchatGenderStr in fchatGenderMap) {
            return fchatGenderMap[fchatGenderStr];
        }

        return null;
    }
}
