export enum TagId {
    Age = 1,
    Orientation = 2,
    Gender = 3,
    Build = 13,
    FurryPreference = 29,
    SubDomRole = 15,
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

export enum SubDomRole {
    AlwaysSubmissive = 7,
    UsuallySubmissive = 8,
    Switch = 9,
    UsuallyDominant = 10,
    AlwaysDominant = 11
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

export enum Kink {
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

    RoleReversal = 408,

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

export interface GenderKinkIdMap {
    [key: number]: Kink
}

export const genderKinkMapping: GenderKinkIdMap = {
    [Gender.Female]: Kink.Females,
    [Gender.Male]: Kink.Males,
    [Gender.Cuntboy]: Kink.Cuntboys,
    [Gender.Herm]: Kink.Herms,
    [Gender.MaleHerm]: Kink.MaleHerms,
    [Gender.Shemale]: Kink.Shemales,
    [Gender.Transgender]: Kink.Transgenders
};

 // if no species and 'no furry characters', === human
 // if no species and dislike 'anthro characters' === human

export enum Species {
    Human = 609,
    Humanoid = 131,
    Bovine = 318,
    Equine = 236,
    Feline = 212,
    Canine = 226,
    Caprinae = 558,
    Demon = 7,
    Divinity = 530,
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
    Marsupial = 322,
    Anthro = 587,
    Robot = 161,
    Hyaenidae = 321,
    Mephitidae = 323,
    Bat = 451,
    Alien = 281,
    Dinosaur = 610,
    Pokemon = 504,
    Fae = 612,
    Taur = 68,
    Vampire = 182,
    Naga = 619,
    Monster = 483,

    Minotaur = 12121212,
    Giraffe = 13131313,
    Rhinoceros = 14141414
 }

export const nonAnthroSpecies = [
    Species.Human, Species.Elf, Species.Orc, Species.Humanoid,
    Species.Demon, Species.Divinity, Species.Alien, Species.Robot,
    Species.Fae, Species.Vampire
];

export const mammalSpecies = [Species.Equine, Species.Feline, Species.Canine, Species.Vulpine, Species.Cervine, Species.Lapine,
    Species.Musteline, Species.Procyon, Species.Rodent, Species.Ursine, Species.MarineMammal, Species.Primate,
    Species.Anthro, Species.Bovine, Species.Caprinae, Species.Marsupial, Species.Hyaenidae, Species.Minotaur,
    Species.Bat, Species.Mephitidae, Species.Taur, Species.Giraffe, Species.Rhinoceros];

export interface SpeciesMap {
    [key: number]: string[];
}

export interface SpeciesStrMap {
    [key: number]: string;
}

export const speciesNames: SpeciesStrMap = {
    [Species.MarineMammal]: 'marine mammals',
    [Species.Elf]: 'elves',
    [Species.Fish]: 'fishes',
    [Species.Mephitidae]: 'mephitis',
    [Species.Rhinoceros]: 'rhinoceros'
};

export const speciesMapping: SpeciesMap = {
    [Species.Human]: ['human', 'humanoid', 'angel', 'android', 'african american', 'africanamerican', 'woman', 'dothraki', 'homo sapien', 'homosapien', 'homosapian', 'hooman', 'hoomin', 'hooomin'],
    [Species.Humanoid]: ['satyr', 'gnome', 'dwarf', 'halfling', 'tiefling', 'humanoid'],
    [Species.Equine]: ['horse', 'stallion', 'mare', 'filly', 'equine', 'shire', 'donkey', 'mule', 'zebra', 'pony', 'unicorn', 'clydesdale', 'shire',
        'appaloosa', 'friesian', 'draft', 'draught', 'alicorn', 'amazon', 'amazonian', 'horsie', 'hoss', 'pegasus', 'colt', 'filly'],
    [Species.Feline]: ['cat', 'kitten', 'catgirl', 'neko', 'tiger', 'puma', 'lion', 'lioness',
        'tigress', 'feline', 'jaguar', 'cheetah', 'lynx', 'leopard', 'cougar', 'kitty', 'migote', 'miqo\'te', 'miqote', 'ocelot',
        'sabertooth', 'saber tooth', 'tabby', 'liger', 'serval'],
    [Species.Canine]: ['dog', 'wolf', 'dingo', 'coyote', 'jackal', 'canine', 'doberman', 'husky', 'hound', 'akita', 'pitbull', 'pit bull', 'terrier',
        'bull terrier', 'australian shepherd', 'australian shepard', 'german shepherd', 'german shepard', 'malinois', 'woof', 'labrador', 'collie',
        'canis', 'canid', 'chihuahua', 'poodle', 'chinchilla', 'chowchow', 'corgi', 'anubis', 'anubian', 'dalmatian', 'inumimi', 'lupine', 'malamute', 'mastiff',
        'mutt', 'rottweiler', 'shih tzu', 'worgen'],
    [Species.Vulpine]: ['fox', 'fennec', 'kitsune', 'vulpine', 'vixen'],
    [Species.Avian]: ['bird', 'gryphon', 'phoenix', 'roc', 'chimera', 'avian', 'albatross', 'cockatiel', 'dove', 'eagle', 'owl', 'penguin', 'raven'],
    [Species.Amphibian]: ['salamander', 'frog', 'toad', 'newt', 'amphibian'],
    [Species.Cervine]: ['deer', 'elk', 'moose', 'cervid', 'cervine', 'caribou', 'reindeer', 'doe', 'stag'],
    [Species.Insect]: ['bee', 'wasp', 'spider', 'scorpion', 'ant', 'insect'],
    [Species.Lapine]: ['bunny', 'rabbit', 'hare', 'lapine'],
    [Species.Dragon]: ['dragon', 'drake', 'wyvern', 'draconian'],
    [Species.Demon]: ['demon', 'daemon', 'deamon', 'demoness', 'demonkin', 'devil', 'succubus', 'incubus', 'baphomet'],
    [Species.Musteline]: ['mink', 'ferret', 'weasel', 'stoat', 'otter', 'wolverine', 'marten', 'musteline'],
    [Species.Procyon]: ['raccoon', 'racoon', 'coatimund', 'longtail', 'procyon'],
    [Species.Rodent]: ['rat', 'mouse', 'chipmunk', 'squirrel', 'rodent', 'maus'],
    [Species.Ursine]: ['bear', 'panda', 'black bear', 'brown bear', 'polar bear', 'ursine'],
    [Species.MarineMammal]: ['whale', 'killer whale', 'dolphin'],
    [Species.Primate]: ['monkey', 'ape', 'chimp', 'chimpanzee', 'gorilla', 'lemur', 'silverback'],
    [Species.Divinity]: ['god', 'goddess', 'demigod', 'demigoddess', 'demi-god', 'demi-goddess'],
    [Species.Elf]: ['elf', 'e l f', 'drow', 'draenei', 'draenai', 'kaldorei', 'sindorei'],
    [Species.Fish]: ['fish', 'shark', 'great white', 'sergal', 'elven'],
    [Species.Orc]: ['orc'],
    [Species.Reptile]: ['chameleon', 'anole', 'alligator', 'aligator', 'snake', 'crocodile', 'lizard', 'gator', 'gecko', 'reptile', 'reptilian'],
    [Species.Anthro]: ['anthro', 'anthropomorphic'],
    [Species.Bovine]: ['cow', 'bovine', 'bison', 'antelope', 'gazelle', 'oryx', 'black angus', 'bull', 'ox'],
    [Species.Caprinae]: ['sheep', 'goat', 'ibex', 'takin', 'bharal', 'goral', 'serow', 'lamb'],
    [Species.Marsupial]: ['opossum', 'possum', 'kangaroo', 'roo', 'koala', 'wombat'],
    [Species.Hyaenidae]: ['hyena'],
    [Species.Minotaur]: ['minotaur', 'tauren'],
    [Species.Bat]: ['bat'],
    [Species.Alien]: ['alien', 'krogan', 'xenomorph'],
    [Species.Mephitidae]: ['skunk'],
    [Species.Robot]: ['android', 'robot', 'cyborg'],
    [Species.Dinosaur]: ['saurus', 'deathclaw', 'dinosaur', 'raptor', 'trex', 't-rex'],
    [Species.Pokemon]: ['charizard', 'charmander', 'pikachu', 'digimon', 'renamon', 'eevee', 'gardevoir', 'absol', 'aggron', 'jolteon', 'lopunny'],
    [Species.Fae]: ['fairy', 'fae', 'imp', 'elemental'],
    [Species.Taur]: ['chakat', 'centaur', 'equitaur'],
    [Species.Vampire]: ['vampyre', 'vampire', 'dhampir', 'daywalker'],
    [Species.Naga]: ['naga', 'lamia'],
    [Species.Monster]: ['gnoll', 'goblin', 'kobold', 'monster', 'troll', 'illithid', 'golem', 'basilisk'],
    [Species.Giraffe]: ['giraffe'],
    [Species.Rhinoceros]: ['rhino', 'rhinoceros']
};


export interface FchatGenderMap {
    [key: string]: Gender;
}

export const fchatGenderMap: FchatGenderMap = {
    None: Gender.None,
    Male: Gender.Male,
    Female: Gender.Female,
    Shemale: Gender.Shemale,
    Herm: Gender.Herm,
    'Male-Herm': Gender.MaleHerm,
    'Cunt-Boy': Gender.Cuntboy,
    Transgender: Gender.Transgender
};

export interface KinkPreferenceMap {
    [key: string]: KinkPreference;
}

export const kinkMapping: KinkPreferenceMap = {
    favorite: KinkPreference.Favorite,
    yes: KinkPreference.Yes,
    maybe: KinkPreference.Maybe,
    no: KinkPreference.No
};

