/* eslint-disable no-null-keyword, max-file-line-count */

import * as _ from 'lodash';
import { Character, CharacterInfotag } from '../interfaces';
import log from 'electron-log'; //tslint:disable-line:match-default-export-name

import {
    BodyType, fchatGenderMap,
    FurryPreference,
    Gender, genderKinkMapping,
    Kink,
    kinkMapping,
    KinkPreference, likelyHuman, mammalSpecies, nonAnthroSpecies,
    Orientation,
    Species, SpeciesMap, speciesMapping, SpeciesMappingCache,
    speciesNames,
    SubDomRole,
    TagId
} from './matcher-types';


export interface MatchReport {
    you: MatchResult;
    them: MatchResult;
    youMultiSpecies: boolean;
    themMultiSpecies: boolean;
    score: Scoring | null;
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

export interface CharacterAnalysisVariation {
    readonly character: Character;
    readonly analysis: CharacterAnalysis;
}

export class CharacterAnalysis {
    readonly character: Character;

    readonly gender: Gender | null;
    readonly orientation: Orientation | null;
    readonly species: Species | null;
    readonly furryPreference: FurryPreference | null;
    readonly age: number | null;
    readonly subDomRole: SubDomRole | null;

    readonly isAnthro: boolean | null;
    readonly isHuman: boolean | null;
    readonly isMammal: boolean | null;

    constructor(c: Character) {
        this.character = c;

        this.gender = Matcher.getTagValueList(TagId.Gender, c);
        this.orientation = Matcher.getTagValueList(TagId.Orientation, c);
        this.species = Matcher.species(c);
        this.furryPreference = Matcher.getTagValueList(TagId.FurryPreference, c);
        this.subDomRole = Matcher.getTagValueList(TagId.SubDomRole, c);

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

        const report: MatchReport = {
            you: youThem.match(),
            them: themYou.match(),
            youMultiSpecies: false,
            themMultiSpecies: false,
            score: null
        };

        report.score = Matcher.calculateReportScore(report);

        return report;
    }

    static identifyBestMatchReport(you: Character, them: Character): MatchReport {
        const reportStartTime = Date.now();

        const yourCharacterAnalyses = Matcher.generateAnalysisVariations(you);
        const theirCharacterAnalyses = Matcher.generateAnalysisVariations(them);

        let bestScore = null;
        let bestScoreLevelCount = -10000;
        let bestReport: MatchReport;

        for(const yourAnalysis of yourCharacterAnalyses) {
            for (const theirAnalysis of theirCharacterAnalyses) {
                const youThem = new Matcher(yourAnalysis.character, theirAnalysis.character, yourAnalysis.analysis, theirAnalysis.analysis);
                const themYou = new Matcher(theirAnalysis.character, yourAnalysis.character, theirAnalysis.analysis, yourAnalysis.analysis);

                const report: MatchReport = {
                    you: youThem.match(),
                    them: themYou.match(),
                    youMultiSpecies: (yourCharacterAnalyses.length > 1),
                    themMultiSpecies: (theirCharacterAnalyses.length > 1),
                    score: null
                };

                report.score = Matcher.calculateReportScore(report);

                const scoreLevelCount = Matcher.countScoresAtLevel(report, report.score);

                if (
                    (bestScore === null)
                    || (
                        (report.score !== null)
                        && (report.score >= bestScore)
                        && (scoreLevelCount !== null)
                        && (report.score * scoreLevelCount > bestScoreLevelCount)
                    )
                ) {
                    bestScore = report.score;
                    bestScoreLevelCount = ((scoreLevelCount !== null) && (report.score !== null)) ? report.score * scoreLevelCount : -1000;
                    bestReport = report;
                }
            }
        }

        log.debug('report.identify.best', {buildTime: Date.now() - reportStartTime});

        return bestReport!;
    }

    static generateAnalysisVariations(c: Character): CharacterAnalysisVariation[] {
        const speciesOptions = Matcher.getAllSpeciesAsStr(c);

        if (speciesOptions.length === 0) {
            speciesOptions.push('');
        }

        return _.map(
            speciesOptions,
            (species) => {
                const nc = _.cloneDeep(c);

                nc.infotags[TagId.Species] = { string: species };

                return { character: nc, analysis: new CharacterAnalysis(nc) };
            }
        );
    }

    static countScoresAtLevel(m: MatchReport, scoreLevel: Scoring | null): number | null {
        if (scoreLevel === null) {
            return null;
        }

        const yourScores = _.values(m.you.scores);
        const theirScores = _.values(m.them.scores);

        return _.reduce(
            _.concat(yourScores, theirScores),
            (accum: number, score: Score) => accum + (score.score === scoreLevel ? 1 : 0),
            0
        );
    }

    static calculateReportScore(m: MatchReport): Scoring | null {
        const yourScores = _.values(m.you.scores);
        const theirScores = _.values(m.them.scores);

        const finalScore = _.reduce(
            _.concat(yourScores, theirScores),
            (accum: Scoring | null, score: Score) => {
                if (accum === null) {
                    return (score.score !== Scoring.NEUTRAL) ? score.score : null;
                }

                return (score.score === Scoring.NEUTRAL) ? accum : Math.min(accum, score.score);
            },
            null
        );

        if ((finalScore !== null) && (finalScore > 0)) {
            // Manage edge cases where high score may not be ideal

            // Nothing to score
            if ((yourScores.length === 0) || (theirScores.length === 0)) {
                // can't know
                return Scoring.NEUTRAL;
            }

            // Only neutral scores given
            if (
                (_.every(yourScores, (n: Scoring) => n === Scoring.NEUTRAL)) ||
                (_.every(theirScores, (n: Scoring) => n === Scoring.NEUTRAL))
            ) {
                return Scoring.NEUTRAL;
            }
        }

        // console.log('Profile score', c.character.name, score, m.you.total, m.them.total,
        //    m.you.total + m.them.total, m.you.total * m.them.total);

        return (finalScore === null) ? Scoring.NEUTRAL : finalScore;
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
                [TagId.Species]: this.resolveSpeciesScore(),
                [TagId.SubDomRole]: this.resolveSubDomScore()
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
            return new Score(Scoring.WEAK_MISMATCH, `Hesitant about <span>${description}</span>`);

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
            // console.log(this.them.name, speciesScore, theirSpecies);
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
                type = 'Hesitant about';
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
                    ? 'Prefers <span>humans</span>, ok with anthros'
                    : 'Prefers <span>anthros</span>, ok with humans'
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

        if ((theirAge < 18) && (theirAge >= 16) && (underageScore !== null))
            return Matcher.formatKinkScore(underageScore, `ages of ${theirAge}`);

        const yourAge = this.yourAnalysis.age;

        if ((yourAge !== null) && (yourAge > 0) && (theirAge > 0) && (yourAge <= 80) && (theirAge <= 80)) {
            const olderCharactersScore = Matcher.getKinkPreference(you, Kink.OlderCharacters);
            const youngerCharactersScore = Matcher.getKinkPreference(you, Kink.YoungerCharacters);
            const ageDifference = Math.abs(yourAge - theirAge);

            if ((yourAge < theirAge) && (olderCharactersScore !== null) && (ageDifference >= 8))
                return Matcher.formatKinkScore(olderCharactersScore, 'older characters');

            if ((yourAge > theirAge) && (youngerCharactersScore !== null) && (ageDifference >= 8))
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


    private resolveSubDomScore(): Score {
        const you = this.you;
        const yourSubDomRole = this.yourAnalysis.subDomRole;
        const theirSubDomRole = this.theirAnalysis.subDomRole;
        const yourRoleReversalPreference = Matcher.getKinkPreference(you, Kink.RoleReversal);

        if ((!yourSubDomRole) || (!theirSubDomRole))
            return new Score(Scoring.NEUTRAL);

        if ((yourSubDomRole === SubDomRole.AlwaysDominant) || (yourSubDomRole === SubDomRole.UsuallyDominant)) {
            if (theirSubDomRole === SubDomRole.Switch)
                return new Score(Scoring.WEAK_MATCH, `Likes <span>switches</span>`);

            if ((theirSubDomRole === SubDomRole.AlwaysSubmissive) || (theirSubDomRole === SubDomRole.UsuallySubmissive))
                return new Score(Scoring.MATCH, `Loves <span>submissives</span>`);

            if (yourRoleReversalPreference === KinkPreference.Favorite)
                return new Score(Scoring.MATCH, `Loves <span>role reversal</span>`);

            if (yourRoleReversalPreference === KinkPreference.Yes)
                return new Score(Scoring.MATCH, `Likes <span>role reversal</span>`);

            if ((yourSubDomRole === SubDomRole.AlwaysDominant) && (theirSubDomRole === SubDomRole.AlwaysDominant))
                return new Score(Scoring.MISMATCH, 'No <span>dominants</span>');

            return new Score(Scoring.WEAK_MISMATCH, 'Hesitant about <span>dominants</span>');
        }

        if ((yourSubDomRole === SubDomRole.AlwaysSubmissive) || (yourSubDomRole === SubDomRole.UsuallySubmissive)) {
            if (theirSubDomRole === SubDomRole.Switch)
                return new Score(Scoring.WEAK_MATCH, `Likes <span>switches</span>`);

            if ((theirSubDomRole === SubDomRole.AlwaysDominant) || (theirSubDomRole === SubDomRole.UsuallyDominant))
                return new Score(Scoring.MATCH, `Loves <span>dominants</span>`);

            if (yourRoleReversalPreference === KinkPreference.Favorite)
                return new Score(Scoring.MATCH, `Loves <span>role reversal</span>`);

            if (yourRoleReversalPreference === KinkPreference.Yes)
                return new Score(Scoring.MATCH, `Likes <span>role reversal</span>`);

            if ((yourSubDomRole === SubDomRole.AlwaysSubmissive) && (theirSubDomRole === SubDomRole.AlwaysSubmissive))
                return new Score(Scoring.MISMATCH, 'No <span>submissives</span>');

            return new Score(Scoring.WEAK_MISMATCH, 'Hesitant about <span>submissives</span>');
        }

        // You must be a switch
        if (theirSubDomRole === SubDomRole.Switch)
            return new Score(Scoring.MATCH, `Loves <span>switches</span>`);

        // if (yourRoleReversalPreference === KinkPreference.Favorite)
        //     return new Score(Scoring.MATCH, `Loves <span>role reversal</span>`);
        //
        // if (yourRoleReversalPreference === KinkPreference.Yes)
        //     return new Score(Scoring.MATCH, `Likes <span>role reversal</span>`);

        if ((theirSubDomRole === SubDomRole.AlwaysDominant) || (theirSubDomRole === SubDomRole.UsuallyDominant))
            return new Score(Scoring.MATCH, `Loves <span>dominants</span>`);

        if ((theirSubDomRole === SubDomRole.AlwaysSubmissive) || (theirSubDomRole === SubDomRole.UsuallySubmissive))
            return new Score(Scoring.MATCH, `Loves <span>submissives</span>`);

        return new Score(Scoring.NEUTRAL);
    }


    static getTagValue(tagId: number, c: Character): CharacterInfotag | undefined {
        return c.infotags[tagId];
    }

    static getTagValueList(tagId: number, c: Character): number | null {
        const t = Matcher.getTagValue(tagId, c);

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

        const kinkVal = c.kinks[kinkId];

        if (kinkVal === undefined) {
            return null;
        }

        if (typeof kinkVal === 'string') {
            return kinkMapping[c.kinks[kinkId] as string];
        }

        const custom = c.customs[kinkVal];

        if (!custom) {
            return null;
        }

        return kinkMapping[custom.choice];
    }

    static getKinkGenderPreference(c: Character, gender: Gender): KinkPreference | null {
        if (!(gender in genderKinkMapping))
            return null;

        return Matcher.getKinkPreference(c, genderKinkMapping[gender]);
    }

    static getKinkSpeciesPreference(c: Character, species: Species): KinkPreference | null {
        return Matcher.getKinkPreference(c, species);
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
        const bodyTypeId = Matcher.getTagValueList(TagId.BodyType, c);

        if (bodyTypeId === BodyType.Anthro)
            return true;

        const speciesId = Matcher.species(c);

        if (!speciesId)
            return null;

        return (nonAnthroSpecies.indexOf(speciesId) < 0);
    }

    static isHuman(c: Character): boolean | null {
        const bodyTypeId = Matcher.getTagValueList(TagId.BodyType, c);

        if (bodyTypeId === BodyType.Human)
            return true;

        const speciesId = Matcher.species(c);

        return (speciesId === Species.Human);
    }

    static species(c: Character): Species | null {
        const mySpecies = Matcher.getTagValue(TagId.Species, c);

        if ((!mySpecies) || (!mySpecies.string)) {
            return Species.Human; // best guess
        }

        const s = Matcher.getMappedSpecies(mySpecies.string);

        if (!s) {
            console.log('Unknown species', c.name, mySpecies.string);
        }

        return s;
    }

    static generateSpeciesMappingCache(mapping: SpeciesMap): SpeciesMappingCache {
        return _.mapValues(
            mapping,
            (keywords: string[]) => _.map(
                keywords,
                (keyword: string) => {
                    const keywordPlural = `${keyword}s`; // this is weak: elf -> elves doesn't occur
                    return {
                        keyword,
                        regexp: RegExp(`(^|\\b)(${keyword}|${keywordPlural})($|\\b)`)
                    };
                }
            )
        );
    }

    private static speciesMappingCache?: SpeciesMappingCache;
    private static likelyHumanCache?: SpeciesMappingCache;

    private static matchMappedSpecies(species: string, mapping: SpeciesMappingCache): Species | null {
        let foundSpeciesId: Species | null = null;
        let match = '';

        const finalSpecies = species.toLowerCase().trim();

        _.each(
            mapping,
            (matchers, speciesId: string) => {
                _.each(
                    matchers,
                    (matcher) => {

                        // finalSpecies.indexOf(k) >= 0)
                        if ((matcher.keyword.length > match.length) && (matcher.regexp.test(finalSpecies))) {
                            match = matcher.keyword;
                            foundSpeciesId = parseInt(speciesId, 10);
                        }
                    }
                );
            }
        );

        return foundSpeciesId;
    }

    static getMappedSpecies(species: string): Species | null {
        if (!Matcher.speciesMappingCache) {
            Matcher.speciesMappingCache = Matcher.generateSpeciesMappingCache(speciesMapping);
        }

        if (!Matcher.likelyHumanCache) {
            Matcher.likelyHumanCache = Matcher.generateSpeciesMappingCache(likelyHuman);
        }

        return Matcher.matchMappedSpecies(species, Matcher.speciesMappingCache)
            || Matcher.matchMappedSpecies(species, Matcher.likelyHumanCache);
    }

    static getAllSpecies(c: Character): Species[] {
        const species = Matcher.getAllSpeciesAsStr(c);
        return _.filter(_.map(species, (s) => Matcher.getMappedSpecies(s)), (s) => (s !== null)) as Species[];
    }

    static getAllSpeciesAsStr(c: Character): string[] {
        const mySpecies = Matcher.getTagValue(TagId.Species, c);

        if ((!mySpecies) || (!mySpecies.string)) {
            return [];
        }

        const speciesStr = mySpecies.string.toLowerCase().replace(/optionally|alternatively/g, ',')
            .replace(/[)(]/g, ' ').trim();
        const matches = speciesStr.split(/[,]? or |,/);

        return _.filter(_.map(matches, (m) => m.toLowerCase().trim()), (m) => (m !== ''));
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
