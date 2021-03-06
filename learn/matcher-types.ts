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
    LanguagePreference = 49,

    Kinks = 99999
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
    Unsure = 59,
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

export const furryPreferenceMapping = {
    [FurryPreference.FurriesOnly]: 'furries only',
    [FurryPreference.FursAndHumans]: 'loves furries and humans',
    [FurryPreference.HumansOnly]: 'humans only',
    [FurryPreference.HumansPreferredFurriesOk]: 'loves humans, likes furries',
    [FurryPreference.FurriesPreferredHumansOk]: 'loves furries, likes humans'
};


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
    Rhinoceros = 14141414,
    Suidae = 15151515,
    Herpestidae = 16161616,
    Were = 17171717,
    Erinaceidae = 18181818,
    Elephantidae = 19191919,
    Camielidae = 20202020,
    Hippopotamidae = 21212121,
    Hub = 22222222,
    Pinniped = 23232323,
    Hybrid = 24242424,
    Xenarthra = 25252525
 }

export const nonAnthroSpecies = [
    Species.Human, Species.Humanoid, Species.Demon, Species.Divinity,
    Species.Elf, Species.Orc, Species.Robot,
    Species.Alien, Species.Pokemon, Species.Fae, Species.Vampire, Species.Monster,
    Species.Hub
];

export const mammalSpecies = [
    Species.Bovine, Species.Equine, Species.Feline, Species.Canine, Species.Caprinae,
    Species.Vulpine, Species.Cervine, Species.Lapine, Species.Musteline, Species.Procyon,
    Species.Rodent, Species.Ursine, Species.MarineMammal, Species.Primate,
    Species.Marsupial, Species.Anthro, Species.Hyaenidae, Species.Mephitidae, Species.Bat,
    Species.Taur, Species.Minotaur, Species.Giraffe, Species.Rhinoceros, Species.Suidae,
    Species.Herpestidae, Species.Were, Species.Erinaceidae, Species.Elephantidae, Species.Camielidae,
    Species.Hippopotamidae, Species.Pinniped, Species.Hybrid, Species.Xenarthra
];

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
    [Species.Rhinoceros]: 'rhinoceros',
    [Species.Suidae]: 'swine'
};


export const likelyHuman: SpeciesMap = {
    [Species.Human]: ['bimbo', 'witch', 'wizard', 'gyaru', 'milf', '.*slut', 'black', 'azarathian', 'kryptonian', 'mensch', 'thot',
        'sister', 'brother', 'mother', 'father', 'fuckpig', 'hero', 'she-stud', 'college', 'cutie',
        'bimboi', 'homo', 'streamer', '.*human', 'femboy', 'nord', 'norse', 'norseman', 'man', 'whitebo[yi]', '.*bo[yi].*', '.*girl.*',
        'french', 'whore', 'slutty', 'adult', 'otaku', 'cumdump', 'thug', 'magus', 'goth', 'servant', '.*caucasian', 'cosplayer',
        'sapien[s]?', 'american', 'korean', 'chinese', 'english', 'british', 'irish', 'brat', 'guy', 'blonde?', 'redhead', 'brunet(te)?',
        'paladin', 'knight', 'psychic',
        'male', 'female', 'shemale',
        'dothraki', 'amazon', 'african[ -]?american', 'amazonian', 'latina', 'latino',

        'aasimar', 'astartes', 'saiyan', 'echani', 'cathar', 'shikaisen', 'hyur', 'mid[ -]?lander', 'high[ -]?lander', 'arkanian',
        'exalted', 'leftherian'
    ]
};

// red panda / akai pandamimi
// pangolin
// echidna


function gen(s: string): string {
    return `${s}[ -]?(kin|folk|woman|man|g[iu]rl|bo[yi][e]?)?`;
}


export const speciesMapping: SpeciesMap = {
    [Species.Anthro]: ['anthro', 'anthropomorphic', 'kemono', 'kemomimi', 'kemonomimi', 'furry', 'erune', 'vastayan?', 'rakshasa',
        gen('(beast|anthro|furry)')
        ],

    [Species.Human]: ['human', 'homo sapiens', 'human.*', 'homo[ -]?sapi[ea]ns?', 'woman', 'hy?[uo]+m[aie]n', 'humaine?',
        'meat[ -]?popsicle',
        // where should these go?
        'angel', 'neph[ai]l[ei]m', 'arch[ -]?angel'
        ],

    [Species.Elf]: ['drow', 'draenei', 'dunmer', 'draenai', 'blutelf[e]?', 'elf.*', 'drow.*', 'e[ -]l[ -]f', 'sin\'?dorei',
        'kal\'?dorei', 'elves', 'elven', '.*elfe?', 'elvish', 'ren\'?dorei', 'quel\'?dorei', 'hal[bf][ -]elf',
        'shal\'?dorei', 'san\'?layn', 's[yi]lvan', gen('(elf|drow)')
        ],

    [Species.Canine]: ['dog', 'dingo', 'coyote', 'jackal', 'husky', 'canine', 'wolf.*', 'doberman[n]?', 'hound', 'akita', 'pit ?bull',
        'terrier', 'bull[ -]?terrier', 'australian[ -]?shepherd', 'australian[ -]?shep[h]?ard', 'german[ -]?shep[h]?([ea]rd)?',
        'malinois', 'woof', 'labrador', 'collie', 'canis', 'lupus', 'canid', 'chihuahua', 'poodle', 'chinchilla',
        'chow[ -]?chow', 'corgi', 'anubis', 'beagle', '.*wolf', 'direwolf', 'pointer', 'dhole', 'worg(en)?',
        'anubian', 'dalmatian', 'dalmation', 'inumimi', 'lupine', 'malamute', 'mastiff', 'mutt', 'rott?w[ea]ill?er', 'shih[ -]?tzu',
        'vallhund', 'puppy', 'oo?kami', 'great[ -]?dane', 'golden[ -]?(retriever|lab|labrador)', 'cocker[ -]?spaniel', 'samm?oyed', 'awoo+',
        'borzoi', 'spaniel', 'ookamimimi', 'jakkarumimi', 'chinchiramimi', 'woffo', 'wuff', 'wolfdog', 'setter', 'papillon',
        '🐶', '🐺', '🐕', '🐩', 'aussie[ -]?doodle', 'shiba', 'inu', 'veil[ -]?hound', 'timber[ -]?wolf', 'hell[ -]?hound', 'hound',
        'kangal', 'behemoth', 'mongrel', 'fenrir', 'v[aá]na[r]?gand[r]?', 'crux', 'st.?[ -]?bernard',
        'wolfess', 'latrans', gen('(dog|wolf)'), 'chien', 'loup', 'sch[aä]ferhund',
        'doggie', 'doggy', 'canis', 'doggo', 'barghest', 'barguest', 'dire[ -]?hound'],

    [Species.Equine]: ['horse', 'zebra', 'donkey', 'stallion', 'mare', 'filly', 'equine',
        'unicorn.*', 'clydesdale', 'shire', 'appaloosa', 'friesian', 'draft', 'draught', 'alicorn', 'hoss', 'peg[au]sus', 'colt',
        'filly', 'neigh', 'dullahan', 'tikbalang', 'gypsy[ -]?vanner', 'ardenne[r]?', 'ardennais[e]?', 'mule', 'zeeb', 'shire',
        'cream[ -]?draft', 'belgian[ -]?draft', 'saddle[ -]?bred', 'warm[ -]?blood', 'marsh tacky', 'fox[ -]?trotter', 'morab',
        'saddle[ -]?horse', 'walkaloosa', 'welara', 'tiger[ -]?horse', 'tinker[ -]?hengste?', 'jackass',
        gen('(horsi?ey?|hoss|zeeb(ra)?|donkey|pon[yie])'), 'umamimi', 'shimaumamimi', 'thestral', 'foal', 'palomino',
        'mustang', 'horse.*', '.*horse', '.*pony', 'equus', 'kelpie', 'kuranta', 'zonkey', 'whorse',
        '🐴', '🦓', '🐎'],

    [Species.Feline]: ['cat', 'jaguar', 'cheetah', 'lynx', 'tiger.*', 'puma', 'lion.*', 'kitten',
        'neko[ -]?mimi', 'lioness', 'panther', 'panthe?ress', 'tige?ress', 'feline', 'leopard(ess)?', 'cougar', 'kitty', 'migo\'?te',
        'miqo\'?te', 'ocelot', 'saber[ -]?tooth', 'tabby', 'serval', 'russian[ -]?blue', 'thunderian', 'meow', 'lombax',
        '(exotic|domestic|british|oriental|american|shaded|chinchilla)[ -]?shorthair', 'burmese', 'maine[ -]?coon', 'korat', 'ragdoll',
        'ocicat', 'chartreux', 'german[ -]?rex', 'turkish[ -]?van', 'ragamuffin', 'norwegian[ -]?forest[ -]?(cat)?', 'burmilla',
        'khajiit', 'catamount', 'cat[ -]?person', 'tetton', 'tigre', 'calico', 'caracal', 'tabaxi', 'housecat', 'neko',
        'kodkod', 'karotanta', 'siamese', 'felis', 'catus', 'nekomata', 'nekomimi', 'trianii', 'caitian', 'catt[o|e]', '.*cat', 'toramimi',
        'shishimimi', 'pansamimi', 'hyoumimi', 'mytharii', 'felinid', 'kitteh', 'chat(te)?',
        gen('(cat|lion|tiger)'),
        'nyah', 'charr', 'kater', 'kat', 'jinko', '.*katze?', 'liger', 'tigon', 'sab(re|er)[ -]?tooth',
        '🐅', '🐆', '🐯', '🦁', '🐈'],

    [Species.Vulpine]: ['fox', 'fennec', 'vixen', 'vulpine', 'fox.*', 'fennec', 'kitsune.*', 'kistune', 'gumiho', 'kumiho',
        'nogitsune', 'yako', '🦊', gen('fox'), 'vulpes', 'silver[ -]?fox', 'arctic[ -]?fox', 'fennec[ -]?fox', 'red[ -]?fox',
        'cape[ -]?fox', 'ninetails', 'ninetales', 'vulpo', 'vulpera', 'kitsunemimi', 'fire[ -]?fox', 'faw(x|ks)'],

    [Species.Dragon]: ['dragon', '🐉', 'wyvern', 'felkin', 'dragon.*', '.*dra(k|ch)e', '.*wyvern', '.*felkin',
        'night[ -]?fury', 'draconian', 'dragonn?ess', 'draconic', 'draconis', 'dragovian',
        'sea[ -]?dragon', 'doragonmimi', 'doragon', 'half[ -]dragon', 'wyverian', 'glavenus',
        'anjanath', 'ragon', 'zinogre', 'drgn',
        gen('dragon')
        ],

    [Species.Reptile]: ['lizard', 'snake', 'crocodile', 'alligator', 'chameleon', 'anole', '(all?i)?gator', 'snake.*', 'gator',
        'gecko', 'reptile', 'reptilian', 'scaly', 'scale[ -]?born', 'argonian', 'saxhleel', 'skink', 'cobra', 'turtle', 'tortoise',
        'nope[ -]rope', 'anaconda', 'python', gen('(lizard|snake|croc)'), 'yuan[ -]?ti', 'crocodilian',
        'serp[ea]a?nt(ine)?', 'viper', 'titanoboa', 'boa', 'taipan', 'croc',
        'ludroth', 'zvarr', '🐍'],

    [Species.Pokemon]: ['charizard', 'charmander', 'pikachu', 'digimon', 'renamon', 'eevee', 'gardev(oi|io)r', 'absol', 'aggron',
        'jolteon', 'lopunny', 'raichu', 'scyther', 'blaziken', 'lucario', 'gengar', 'mudsdale', 'mewtwo', 'glaceon', 'pokemon',
        'croconaw', 'rattata', 'toxtricity', 'audino', 'sandslash', 'luxray', 'samurott', 'pokémon', 'riolu', 'greninja',
        'meowstick', 'alolan', 'sylveon', 'arcanine', 'zebstrika', 'rapidash', 'umbreon', 'litten', 'vulpix', 'groudon',
        'gothitelle', 'kecleon', 'quagsire', 'garchomp', 'mismagius', 'zigzagoon', 'sceptile', 'joltik', 'cinderace',
        'hypnomade', 'furfrou', 'flareon', 'zeraora', 'mudkip', 'nidoking', 'zorua', 'salamence', 'lycanrock?',
        'dewott', 'delcatty', 'braixen', 'zacian', 'fennekin', 'kirlia', 'cinccino', 'growlithe', 'shaymin', 'salazzle',
        'vaporeon', 'reshiram', 'quilava', 'decidueye', 'marshadow', 'weavile', 'zubat', 'buizel', 'latias', 'nidorina',
        'chandelur(e|ia)', 'sneasel', 'rockruff', 'lugia', 'komala', 'meowstic', 'leafeon', 'purrloin', 'pokemorph',
        'houndour', 'zoroark', 'mightyena', 'mew', 'nidoqueen', 'zangoose', 'goodra', 'flygon', 'dialga', 'pansear',
        'bibarel', 'charmeleon', 'lapras',

        // digimon
        'gatomon', 'impmon', 'guilmon'
        ],

    [Species.Amphibian]: ['salamander', 'frog', 'toad', 'newt', 'amphibian', 'axolotl'],

    [Species.Avian]: ['bird', 'gryphon', 'raven', 'cardinal', 'cockatiel', 'ph(oe|eo)nix', 'roc', 'chimera', 'avian', 'albatross',
        'dove', 'eagle', 'owl', 'penguin', 'cockatoo', 'shoebill', 'rito', 'crow', 'meadow[ -]?lark', 'torimimi',
        'peacock', 'chocobo', 'emu', 'ostrich', 'flamingo', 'duck', 'swallow', 'nightingale', 'toucan', 'secretary[ -?]bird',
        '(pink|blue)[ -]?jay', 'jaybird', 'chicken', 'rooster', 'blauhäher', 'gryphon', 'gr[iy]ff[io]n',
        'parrot', 'avarr?ian', gen('(bird|raven)'),
        'maran',
        '🦚', '🦃', '🦢', '🦆', '🦅', '🦉', '🦜', '🦩'],

    [Species.Bat]: ['bat', 'nimbat', 'foxbat', 'pteropus', 'komorimimi', '🦇'],

    [Species.Bovine]: ['cow', 'bison', 'bovine', 'antelope', 'gazelle', 'oryx', 'buffalo', 'bison', 'black[ -]?angus', 'bull', 'ox',
        'ushimimi', 'holstaur', 'moo', 'cattle', 'hucow', 'caprin[a]?e', 'goat[ -]?antelope', 'muskox', 'urial', 'mouflon',
        'taurine', 'aurochs', 'bos', 'bos taurus', 'taur[u|o]s',
        '🐃', '🐂', '🐄', '🐐'],

    [Species.Caprinae]: ['sheep', 'goat', 'ibex', 'takin', 'bharal', 'goral', 'serow', 'lamb', 'faun', 'ram', 'faunus', 'goat.*',
        'yagimimi', 'hitsujimimi', 'sheepie', gen('(sheep|goat|ram)')],

    [Species.Camielidae]: ['camel', 'llama', 'alpaca', 'guanaco', 'dromedary', 'dromedar', '🦙', '🐪', '🐫'],

    [Species.Cervine]: ['deer', 'elk', 'moose', 'caribou', 'reindeer', 'doe[ -]?(girl)?', 'fawn', 'cervid', 'cervine', 'stag', 'shikamimi',
        gen('deer')],

    [Species.Dinosaur]: ['raptor', 't-rex', 'pterodactyl', 'deinonychus', 'death[ -]?claw', '[\\w-]*saurus', 'dinosaur',
        'trex', 'tyrannosaurus', 'saurian', '[\\w-]*raptor', 'dino',
        '🦖', '🦕'],

    [Species.Erinaceidae]: ['hedgehog', 'gymnure', 'moonrat'],
    [Species.Elephantidae]: ['elephant', 'mammoth', 'mastodon', 'pachyderm', 'tusker'],

    [Species.Fish]: ['shark', 'great white', 'sergal', 'fish', 'aquatic', 'melanopterus', 'carcharhinus', '.*fish', '.*shark',
        gen('(shark|fish)')
    ],

    [Species.Giraffe]: ['giraffe', '🦒', 'kirinmimi', 'okapi', '[gk]ira(ff|hv)[ei]?'],
    [Species.Herpestidae]: ['mongoose', 'meerkat', 'kusimanse', 'suricate'],
    [Species.Hippopotamidae]: ['hippo', 'hippopotamus', '🦛'],
    [Species.Hyaenidae]: ['hyena', 'aardwolf', 'hyaena', 'yeen', gen('hyena')],

    [Species.Hybrid]: ['hybrid', 'cabbit', 'fabbit', 'laquine', 'folf', 'tolf', 'myox', 'wolger', 'silkie', 'yumar',
        'foxcoon', 'drazelle', 'vulpkanin', 'poochyena', 'batpon', 'delphox', 'unifox', 'rooram', 'catbat', 'bunfox'],

    [Species.Insect]: ['bug', 'bee', 'wasp', 'ant', 'insect', 'buggo', 'hornet', 'vespidae',
        'mantis', gen('bee'), 'ladybug', 'hachimimi', 'moth', 'bumblebee', 'tolype',

        // technically belong to their own group
        'tarantula', 'arachnida', 'spider', gen('spider'), 'arachnid', 'scorpion'
        ],

    [Species.Lapine]: ['bunny', 'rabbit', 'hare', 'lapine', 'viera', 'wabbit', 'lagomo(rp|pr)h', gen('(bunny|rabbit)'), 'usagimimi',
        'bun', '.*bunny', 'cabbit', 'fabbit', 'häschen', 'bunbun', 'cottontail', 'rabbet', 'jack[ -]?rabbit', 'lapine?', 'jackalope',
        'leporids?', 'leporidae', 'broodal', 'kanin(chen)?', '🐇'],

    [Species.MarineMammal]: ['whale', 'dolphin', 'orca', '🐬', 'killer[ -]?whale'],

    [Species.Marsupial]: ['kangaroo', 'opossum', 'koala', 'wombat', 'possum', 'roo([ -]kin)?', 'bandicoot', 'bilby', 'numbat', 'wallaby',
        'thylacine', 'marsupial[ -]?wolf', 'tasmanian[ -]?tiger', 'quokka', 'glider', 'cuscus', 'marsupial', 'tasmanian[ -]?devil', 'musky[ -]?rat',
        'bettong', 'k[äa]nguru', '🦘', '🐨'],

    [Species.Mephitidae]: ['skunk', '🦨', 'stink[ -]?badger'],

    [Species.Musteline]: ['otter', 'ferret', 'mink', 'weasel', 'stoat', 'wolverine', 'marten', 'musteline', 'badger',
        'kawausomimi', 'itachimimi', 'ferettomimi', 'ottsel', gen('(otter|ferret|weasel)'), '🦡', '🦦'],

    [Species.Pinniped]: ['seal', 'walrus', 'fur seal', 'sea[ -]?lion'],

    [Species.Primate]: ['gorilla', 'monkey', 'ape', 'chimp', 'lemur', 'bonobo', 'chimpanzee', 'silverback', 'sarumimi', 'primate',
        '🐒', '🦍', '🦧'],

    [Species.Procyon]: ['raccoon', 'coatimund', 'longtail', 'procyon', 'tanuki', 'tanukimimi', '🦝', 'racoon', 'rakunmimi',
        'ring[ -]?tail(ed)?'],

    [Species.Rhinoceros]: ['rhino', 'rhinoceros', '🦏', '.*rhino'],

    [Species.Rodent]: ['rat', 'mouse', 'chipmunk', 'squirrel', 'hamster', 'rodent', 'maus', 'gerbil', 'mousie', 'muskrat', 'ratsin',
        'skaven', 'roedor', 'risumimi', 'nezumimi', 'jerboa', 'burmecian', 'porcupine', 'squirril',
        gen('(rat|mousi?ey?|maus|squirrel)'),
        '🐀', '🐁', '🐿'],

    [Species.Suidae]: ['pig', 'boar', 'warthog', 'bushpig', 'babirusa', 'sow', 'swine', 'suid', 'suine', 'piglet', 'hog',
        'piggie', 'piggy', 'quilboar', 'porcine', 'porcid', 'butamimi', '🐗', '🐖'],

    [Species.Ursine]: ['bear', 'panda', 'grizzly', 'black[ -]?bear', 'brown[ -]?bear', 'polar[ -]?bear', 'ursine', 'pandaren', 'ursus',
        'pandamimi', 'kumamimi'],

    // pangolin doesn't fit here
    [Species.Xenarthra]: ['armadillo', 'anteater', 'sloth', 'glyptodont', 'a(rm|mr)ad[iy]ll?o', 'sloth', 'ant[ -]?eater', 'pangoo?lin'],

    [Species.Demon]: ['demon', 'devil', 'succubus', 'incubus', 'daemon', 'deamon', 'demoness', 'baphomet', 'eredar',
        'tengu', gen('(devil|demon)'), 'd[a]?emonette', 'cambion', 'amanojaku', 'tanar[\']?ri', 'balor', 'marilith', 'lilith', '.*demon',
        'd[äa]mon([ie]n)?.*', 'ifrit', 'efree?t', 'afa?rit', 'demonic'],

    [Species.Divinity]: ['god', 'goddess', 'divinity', 'demi[ -]?god', 'demi[ -]?goddess'],
    [Species.Fae]: ['fairy', 'fae', 'imp', 'elemental', 'fey', 'pixie', 'nymph', 'faerie'],

    [Species.Humanoid]: ['satyr', 'gnome', 'dwarf', 'halfling', 'havlin', 't[h]?(ie|ei)fling', 'dwarves', 'humanoid', 'yordle', 'hylian', 'lalafell',
        'zwerg', 'draph', 'dryad', 'homunculus', 'githyanki'],

    [Species.Minotaur]: ['minotaur', 'tauren', 'minotaurus', 'm[iy]n[ao]t(uo|ou|o|u)ru?s?', 'minotaure'],

    [Species.Monster]: ['gnoll', 'goblin', 'kobold', 'monster', 'troll', 'illithid', 'golem', 'basilisk', 'oni', 'kaiju', 'mimic',
        'hippogriff', 'hippogryph', 'manticore', 'harpy', 'gargoyle', 'ghost', 'eldritch', 'tentacle', 'youkai', 'ogre', 'skeleton',
        'ghoul', 'vrykolakas', 'godzilla', 'bugbear', 'gnobold', 'undead', 'lich', 'siren', 'mermaid', 'slime', 'goo',
        'y[oō]kai', 'shinigami', 'bunyip', 'giant', 'giantess', 'bokoblin', 'kirin', 'qilin', 'olog[ -]?hai', 'owlbear'],

    [Species.Naga]: ['naga', 'lamia'],
    [Species.Taur]: ['centaur', 'chakat', 'equitaur', 'felitaur', 'weretaur', 'humantaur', 'cowtaur', '.*taur', 'cervitaur'],
    [Species.Orc]: ['orc', 'uruk-hai', 'snaga', 'uruk[ -]?hai', 'ork', 'orcess', gen('orc')],
    [Species.Vampire]: ['vampire', 'nosferatu', 'daywalker', 'd[h]?amp[h]?ir', 'vampyre', 'vampiric', 'vampir'],

    [Species.Were]: ['werewolf', 'lycan', 'werelion', 'weretiger', 'werebear', 'werecoyote', 'werehog', 'were[ -]?wolf', 'were[ -]?lion',
        'were[ -]?bear', 'were[ -]?coyote', 'were[ -]?hog', 'lycant[h]?rop[h]?[ey]?', 'loup[ -]?garou[sx]?',
        'were[ -]?squirrel', 'were[ -]?donkey', 'were[ -]?rat', 'were[ -]?beast'],

    [Species.Alien]: ['krogan', 'xenomorph', 'quarian', 'turian', 'asari', 'togruta', 'otolla', 'gungan', 'chiss', 'alien', 'puazi',
        'hutt', 'klyntar', 'twi\'?lek', 'sangheili', 'salarian', 't[\']?vaoan', 'yautja', 'zabrak'],

    [Species.Robot]: ['android', 'cyborg', 'gynoid', 'automaton', 'robot', 'transformer', 'cybertronian', 'reploid', 'synth', 'ai',
        'realian', 'replicant', 'synthetic'],

    [Species.Hub]: ['hub', 'varies', 'various', 'variable', 'many', 'flexible', 'any', 'partner preference']
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


export interface SpeciesMappingCacheRecord {
    regexp: RegExp;
    keyword: string;
}


export interface SpeciesMappingCache {
    [key: number]: SpeciesMappingCacheRecord[];
}


export const kinkMatchScoreMap = {
    favorite: {
        favorite: 0.55,
        yes: 0.25,
        maybe: -0.5,
        no: -1.0
    },

    yes: {
        favorite: 0.20,
        yes: 0.20,
        maybe: -0.25,
        no: -0.5
    },

    maybe: {
        favorite: -0.5,
        yes: -0.25,
        maybe: 0,
        no: 0
    },

    no: {
        favorite: -1.0,
        yes: -0.5,
        maybe: -0.1,
        no: 0
    }
};


export const kinkComparisonExclusions = {
    585: true, // amputees
    587: true, // anthro characters
    588: true, // body hair
    589: true, // canon characters
    458: true, // chubby
    605: true, // disabilities
    590: true, // facial hair / beards
    531: true, // femboys
    592: true, // femininity
    109: true, // older characters
    600: true, // shorter characters
    601: true, // skinny characters
    584: true, // slime / goo characters
    616: true, // superheroes / villains
    603: true, // taller characters
    532: true, // tomboys
    720: true, // toons
    354: true, // twinks
    183: true, // very fat characters
    85: true, // very lithe characters
    84: true, // very muscular characters
    197: true // younger characters
};

export const kinkComparisonExclusionGroups = {
    29: true, // gender preferences
    30: true // species preferences
};


export const kinkComparisonSwaps: Record<any, number> = {
    137: 157, // anal sex giving -> receiving
    157: 137, // anal sex receiving -> giving
    163: 16, // rimming giving -> receiving
    16: 163, // rimming receiving -> giving
    229: 340, // vaginal sex giving -> receiving
    340: 229, // vaginal sex receiving -> giving
    513: 515, // cunnilingus giving -> receiving
    515: 513, // cunnilingus receiving -> giving
    141: 158, // oral sex giving -> receiving
    158: 141 // oral sex receiving -> giving
};


export interface KinkBucketScore {
    score: number;
    count: number;
    weighted: number;
}

export interface MatchResultKinkScores {
    [key: string]: KinkBucketScore;
}

