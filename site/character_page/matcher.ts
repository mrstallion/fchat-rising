import * as _ from 'lodash';
import { Character } from '../../interfaces';

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
    Maybe = 0,
    No = -1
}

type ScoringCallback = (you: Character, them: Character) => number;

interface CompatibilityCollection {
    [key: number]: ScoringCallback;
}

const orientationCompatibility: CompatibilityCollection = {
    [Orientation.Straight]: (you: Character, them: Character) => Matcher.isCis(you, them) ? (Matcher.isSameSexCis(you, them) ? -1 : 1) : 0,
    [Orientation.Gay]: (you: Character, them: Character) => Matcher.isCis(you, them) ? (Matcher.isSameSexCis(you, them) ? 1 : -1) : 0,
    [Orientation.Bisexual]: (you: Character) => Matcher.isGenderedCis(you) ? 1 : 0,
    [Orientation.Asexual]: () => 0,
    [Orientation.Unsure]: () => 0,
    [Orientation.BiMalePreference]: (you: Character, them: Character) => Matcher.isCis(you, them) ? (Matcher.isMaleCis(you) ? 1 : 0.5) : 0,
    [Orientation.BiFemalePreference]: (you: Character, them: Character) => Matcher.isCis(you, them) ? (Matcher.isFemaleCis(you) ? 1 : 0.5) : 0,
    [Orientation.Pansexual]: () => 1,
    [Orientation.BiCurious]: (you: Character, them: Character) => Matcher.isCis(you, them) ? (Matcher.isSameSexCis(you, them) ? 0.5 : Matcher.isGenderedCis(you) ? 1 : 0) : 0
};

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
    Humans = 609
}


enum FurryPreference {
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

 enum Species {
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
    MarineMammal,
    Primate = 613,
    Elf = 611,
    Orc = 615,
    Fish = 608,
    Reptile = 225,
    Anthro = 587,
    Minotaur = 121212
 }

const nonAnthroSpecies = [Species.Human, Species.Elf, Species.Orc];

// const mammalSpecies = [Species.Human, Species.Equine, Species.Feline, Species.Canine, Species.Vulpine, Species.Cervine, Species.Lapine, Species.Musteline, Species.Rodent, Species.Ursine, Species.MarineMammal, Species.Primate, Species.Elf, Species.Orc, Species.Anthro, Species.Minotaur];

interface SpeciesMap {
    [key: number]: string[]
}

const speciesMapping: SpeciesMap = {
    [Species.Human]: ['human', 'humanoid', 'angel', 'android'],
    [Species.Equine]: ['horse', 'stallion', 'mare', 'filly', 'equine', 'shire', 'donkey', 'mule', 'zebra', 'centaur', 'pony' ],
    [Species.Feline]: ['cat', 'kitten', 'catgirl', 'neko', 'tiger', 'puma', 'lion', 'lioness', 'tigress', 'feline', 'jaguar', 'cheetah', 'lynx', 'leopard'],
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
}

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
    [key: number]: number;
}

export class Matcher {
    you: Character;
    them: Character;

    constructor(you: Character, them: Character) {
        this.you = you;
        this.them = them;
    }

    match(): MatchReport {
        return {
            [TagId.Orientation]: this.resolveScore(TagId.Orientation, orientationCompatibility),
            [TagId.Gender]: this.resolveGenderScore(),
            [TagId.Age]: this.resolveAgeScore(),
            [TagId.FurryPreference]: this.resolveFurryScore(),
            [TagId.Species]: this.resolveSpeciesScore()
       };
    }

    private resolveScore(tagId: number, compatibilityMap: any, you: Character = this.you, them: Character = this.them): number {
        const v = Matcher.getTagValueList(tagId, this.them);

        if ((!v) || (!(v in compatibilityMap)))
            return 0;

        return compatibilityMap[v](you, them);
    }


    private resolveSpeciesScore() {
        const you = this.you;
        const them = this.them;

        const yourSpecies = Matcher.species(you);
        const theirSpecies = Matcher.species(them);

        if (
            ((yourSpecies !== null) && (Matcher.hatesSpecies(them, yourSpecies))) ||
            ((theirSpecies !== null) && (Matcher.hatesSpecies(you, theirSpecies)))
        ) {
            return -1;
        }

        if (
            ((yourSpecies !== null) && (Matcher.maybeSpecies(them, yourSpecies))) ||
            ((theirSpecies !== null) && (Matcher.maybeSpecies(you, theirSpecies)))
        ) {
            return -0.5;
        }

        if (
            ((yourSpecies !== null) && (Matcher.likesSpecies(them, yourSpecies))) ||
            ((theirSpecies !== null) && (Matcher.likesSpecies(you, theirSpecies)))
        ) {
            return 1;
        }

        return 0;
    }


    private resolveFurryScore() {
        const you = this.you;
        const them = this.them;

        const youAreAnthro = Matcher.isAnthro(you);
        const theyAreAnthro = Matcher.isAnthro(them);

        const youAreHuman = Matcher.isHuman(you);
        const theyAreHuman = Matcher.isHuman(them);

        const yourScore = theyAreAnthro ? Matcher.furryLikeabilityScore(you) : theyAreHuman ? Matcher.humanLikeabilityScore(you) : 0;
        const theirScore = youAreAnthro ? Matcher.furryLikeabilityScore(them) : youAreHuman ? Matcher.humanLikeabilityScore(them) : 0;

        return Math.min(yourScore || 0, theirScore || 0);
    }


    static furryLikeabilityScore(c: Character): number | null {
        const anthroKink = Matcher.getKinkPreference(c, Kink.AnthroCharacters);

        if ((anthroKink === KinkPreference.Yes) || (anthroKink === KinkPreference.Favorite)) {
            return 1;
        }

        if (anthroKink === KinkPreference.Maybe) {
            return -0.5;
        }

        if (anthroKink === KinkPreference.No) {
            return -1;
        }

        const furryPreference = Matcher.getTagValueList(TagId.FurryPreference, c);

        if (
            (furryPreference === FurryPreference.FursAndHumans) ||
            (furryPreference === FurryPreference.FurriesPreferredHumansOk) ||
            (furryPreference === FurryPreference.FurriesOnly)
        ) {
            return 1;
        }

        if (furryPreference === FurryPreference.HumansPreferredFurriesOk) {
            return 0.5;
        }

        if (furryPreference === FurryPreference.HumansOnly) {
            return -1;
        }

        return 0;
    }


    static humanLikeabilityScore(c: Character): number | null {
        const humanKink = Matcher.getKinkPreference(c, Kink.Humans);

        if ((humanKink === KinkPreference.Yes) || (humanKink === KinkPreference.Favorite)) {
            return 1;
        }

        if (humanKink === KinkPreference.Maybe) {
            return -0.5;
        }

        if (humanKink === KinkPreference.No) {
            return -1;
        }

        const humanPreference = Matcher.getTagValueList(TagId.FurryPreference, c);

        if (
            (humanPreference === FurryPreference.FursAndHumans) ||
            (humanPreference === FurryPreference.HumansPreferredFurriesOk) ||
            (humanPreference === FurryPreference.HumansOnly)
        ) {
            return 1;
        }

        if (humanPreference === FurryPreference.FurriesPreferredHumansOk) {
            return 0.5;
        }

        if (humanPreference === FurryPreference.FurriesOnly) {
            return -1;
        }

        return 0;
    }


    static likesFurs(c: Character) {
        const score = this.furryLikeabilityScore(c);

        return (score !== null) ? (score > 0) : false;
    }

    static hatesFurs(c: Character) {
        const score = this.furryLikeabilityScore(c);

        return (score !== null) ? (score < 0) : false;
    }


    static likesHumans(c: Character) {
        const score = this.humanLikeabilityScore(c);

        return (score !== null) ? (score > 0) : false;
    }


    static hatesHumans(c: Character) {
        const score = this.humanLikeabilityScore(c);

        return (score !== null) ? (score < 0) : false;
    }


    private resolveAgeScore(): number {
        const you = this.you;
        const them = this.them;

        const yourAgeTag = Matcher.getTagValue(TagId.Age, you);
        const theirAgeTag = Matcher.getTagValue(TagId.Age, them);

        if ((!yourAgeTag) || (!theirAgeTag)) {
            return 0;
        }

        if ((!yourAgeTag.string) || (!theirAgeTag.string)) {
            return 0;
        }

        const yourAge = parseInt(yourAgeTag.string, 10);
        const theirAge = parseInt(theirAgeTag.string, 10);

        if (
            ((theirAge < 16) && (Matcher.hates(you, Kink.Ageplay))) ||
            ((yourAge < 16) && (Matcher.hates(them, Kink.Ageplay))) ||
            ((theirAge < 16) && (Matcher.has(you, Kink.Ageplay) === false)) ||
            ((yourAge < 16) && (Matcher.has(them, Kink.Ageplay) === false)) ||
            ((yourAge < theirAge) && (Matcher.hates(you, Kink.OlderCharacters))) ||
            ((yourAge > theirAge) && (Matcher.hates(them, Kink.OlderCharacters))) ||
            ((yourAge > theirAge) && (Matcher.hates(you, Kink.YoungerCharacters))) ||
            ((yourAge < theirAge) && (Matcher.hates(them, Kink.YoungerCharacters))) ||
            ((theirAge < 18) && (Matcher.hates(you, Kink.UnderageCharacters))) ||
            ((yourAge < 18) && (Matcher.hates(them, Kink.UnderageCharacters)))
        )
            return -1;

        if (
            ((theirAge < 18) && (Matcher.likes(you, Kink.UnderageCharacters))) ||
            ((yourAge < 18) && (Matcher.likes(them, Kink.UnderageCharacters))) ||
            ((yourAge > theirAge) && (Matcher.likes(you, Kink.YoungerCharacters))) ||
            ((yourAge < theirAge) && (Matcher.likes(them, Kink.YoungerCharacters))) ||
            ((yourAge < theirAge) && (Matcher.likes(you, Kink.OlderCharacters))) ||
            ((yourAge > theirAge) && (Matcher.likes(them, Kink.OlderCharacters))) ||
            ((theirAge < 16) && (Matcher.likes(you, Kink.Ageplay))) ||
            ((yourAge < 16) && (Matcher.likes(them, Kink.Ageplay)))
        )
            return 1;

        return 0;
    }

    private resolveGenderScore() {
        const you = this.you;
        const them = this.them;

        const yourGender = Matcher.getTagValueList(TagId.Gender, you);
        const theirGender = Matcher.getTagValueList(TagId.Gender, them);

        const yourGenderScore = Matcher.genderLikeabilityScore(them, yourGender);
        const theirGenderScore = Matcher.genderLikeabilityScore(you, theirGender);

        const yourFinalScore = (yourGenderScore !== null) ? yourGenderScore : this.resolveScore(TagId.Orientation, orientationCompatibility, you, them);
        const theirFinalScore = (theirGenderScore !== null) ? theirGenderScore : this.resolveScore(TagId.Orientation, orientationCompatibility, them, you);

        return Math.min(yourFinalScore, theirFinalScore);
    }

    static getTagValue(tagId: number, c: Character) {
        return c.infotags[tagId];
    }

    static getTagValueList(tagId: number, c: Character): number | undefined {
        const t = this.getTagValue(tagId, c);

        if ((!t) || (!t.list)) {
            return;
        }

        return t.list;
    }

    // Considers males and females only
    static isSameSexCis(a: Character, b: Character): boolean {
        const aGender = this.getTagValueList(TagId.Gender, a);
        const bGender = this.getTagValueList(TagId.Gender, b);

        if ((aGender !== Gender.Male) && (aGender !== Gender.Female)) {
            return false;
        }

        return ((aGender !== undefined) && (aGender === bGender));
    }

    // Considers
    static isGenderedCis(c: Character): boolean {
        const gender = this.getTagValueList(TagId.Gender, c);

        return ((!!gender) && (gender !== Gender.None));
    }

    static isMaleCis(c: Character): boolean {
        const gender = this.getTagValueList(TagId.Gender, c);

        return (gender === Gender.Male);
    }

    static isFemaleCis(c: Character): boolean {
        const gender = this.getTagValueList(TagId.Gender, c);

        return (gender === Gender.Female);
    }

    static isCis(...characters: Character[]): boolean {
        return _.every(characters, (c: Character) => ((Matcher.isMaleCis(c)) || (Matcher.isFemaleCis(c))));
    }


    static genderLikeabilityScore(c: Character, gender?: Gender): number | null {
        if (gender === undefined) {
            return null;
        }

        const byKink = Matcher.getKinkGenderPreference(c, gender);

        if (byKink !== null) {
            if ((byKink === KinkPreference.Yes) || (byKink === KinkPreference.Favorite)) {
                return 1;
            }

            if (byKink === KinkPreference.Maybe) {
                return -0.5;
            }

            if (byKink === KinkPreference.No) {
                return -1;
            }
        }

        if (this.isCis(c)) {
            if ((gender !== Gender.Female) && (gender !== Gender.Male)) {
                return -1;
            }
        }

        return null;
    }

    static likesGender(c: Character, gender: Gender): boolean | null {
        const byKink = Matcher.getKinkGenderPreference(c, gender);

        if (byKink !== null)
            return ((byKink === KinkPreference.Yes) || (byKink === KinkPreference.Favorite));

        if ((Matcher.isCis(c)) && ((gender === Gender.Male) || (gender === Gender.Female)))
            return gender !== this.getTagValueList(TagId.Gender, c);

        return null;
    }

    static dislikesGender(c: Character, gender: Gender): boolean | null {
        const byKink = Matcher.getKinkGenderPreference(c, gender);

        if (byKink !== null)
            return (byKink === KinkPreference.No);

        if ((Matcher.isCis(c)) && ((gender === Gender.Male) || (gender === Gender.Female)))
            return gender === this.getTagValueList(TagId.Gender, c);

        return null;
    }

    static maybeGender(c: Character, gender: Gender): boolean | null {
        const byKink = Matcher.getKinkGenderPreference(c, gender);

        if (byKink !== null)
            return (byKink === KinkPreference.Maybe);

        return null;
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

    static likesSpecies(c: Character, species: Species): boolean | null {
        const byKink = Matcher.getKinkSpeciesPreference(c, species);

        if (byKink !== null)
            return ((byKink === KinkPreference.Yes) || (byKink === KinkPreference.Favorite));

        return null;
    }

    static maybeSpecies(c: Character, species: Species): boolean | null {
        const byKink = Matcher.getKinkSpeciesPreference(c, species);

        if (byKink !== null)
            return (byKink === KinkPreference.Maybe);

        return null;
    }

    static hatesSpecies(c: Character, species: Species): boolean | null {
        const byKink = Matcher.getKinkSpeciesPreference(c, species);

        if (byKink !== null)
            return (byKink === KinkPreference.No);

        return null;
    }

    static likes(c: Character, kinkId: Kink): boolean {
        const r = Matcher.getKinkPreference(c, kinkId);

        return ((r === KinkPreference.Favorite) || (r === KinkPreference.Yes));

    }

    static hates(c: Character, kinkId: Kink): boolean {
        const r = Matcher.getKinkPreference(c, kinkId);

        return (r === KinkPreference.No);

    }

    static has(c: Character, kinkId: Kink): boolean {
        const r = Matcher.getKinkPreference(c, kinkId);

        return (r !== null);
    }

    static isAnthro(c: Character): boolean | null {
        const bodyTypeId = this.getTagValueList(TagId.BodyType, c);

        if (bodyTypeId === BodyType.Anthro) {
            return true;
        }

        const speciesId = this.species(c);

        if (!speciesId)
            return null;

        return (nonAnthroSpecies.indexOf(parseInt(`${speciesId}`, 10)) < 0);
    }

    static isHuman(c: Character): boolean | null {
        const bodyTypeId = this.getTagValueList(TagId.BodyType, c);

        if (bodyTypeId === BodyType.Human) {
            return true;
        }

        const speciesId = this.species(c);

        return (speciesId === Species.Human);
    }

    static species(c: Character): Species | null {
        let foundSpeciesId: Species | null = null;
        let match = '';

        const mySpecies = this.getTagValue(TagId.Species, c);

        if ((!mySpecies) || (!mySpecies.string)) {
            return Species.Human; // best guess
        }

        const finalSpecies = mySpecies.string.toLowerCase();

        _.each(
            speciesMapping as any,
            (keywords: string[], speciesId: Species) => {
                _.each(
                    keywords,
                    (k: string) => {
                        if ((k.length > match.length) && (finalSpecies.indexOf(k) >= 0)) {
                            match = k;
                            foundSpeciesId = speciesId;
                        }
                    }
                );
            }
        );

        return foundSpeciesId;
    }
}
