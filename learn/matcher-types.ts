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
        'sapien[s]?', 'american', 'korean', 'chinese', 'english', 'british', 'irish', 'brat', 'guy',
        'paladin', 'knight', 'psychic',
        'male', 'female', 'shemale',

        'aasimar', 'astartes', 'saiyan', 'echani', 'cathar', 'shikaisen', 'hyur', 'mid[ -]?lander', 'high[ -]?lander', 'arkanian',
        'exalted', 'leftherian'
    ]
};

// red panda / akai pandamimi
// echidna


export const speciesMapping: SpeciesMap = {
    [Species.Anthro]: ['anthro', 'anthropomorphic', 'kemono', 'kemomimi', 'kemonomimi', 'furry', 'erune', 'vastaya[n]?', 'rakshasa'],
    [Species.Human]: ['human', 'homo sapiens', 'human.*', 'homo[ -]?sapiens?', '𝖧𝗎𝗆𝖺𝗇', 'woman', 'dothraki', 'amazon', 'african[ -]?american',
        'homo[ -]?sapians?', 'h[o]+man', 'h[o]+min', 'humaine?', 'amazonian', 'latina', 'latino',
        '𝐻𝓊𝓂𝒶𝓃', '𝑯𝒖𝒎𝒂𝒏.?', '𝕙𝕦𝕞𝕒𝕟', '𝐇𝐔𝐌𝐀𝐍', '𝙷𝚞𝚖𝚊𝚗',
        'nephilim', 'angel', 'nephalem', 'archangel'
        ],

    [Species.Elf]: ['drow', 'draenei', 'dunmer', 'blutelf[e]?', 'draenai', 'elf.*', 'drow.*', 'e l f', 'e-l-f', 'sin\'?dorei',
        'kal\'?dorei', 'elves', 'ᴇʟғ', 'elven', 'elfe', 'nachtelfe?', 'elvish', 'ren\'?dorei', 'quel\'?dorei', 'hal[bf][ -]elf',
        '.*elf', 'waldelfe', 'shal\'?dorei', 'san\'?layn', 's[yi]lvan'
        ],

    [Species.Canine]: ['dog', 'dingo', 'coyote', 'jackal', 'husky', 'canine', 'wolf.*', 'doberman[n]?', 'hound', 'akita', 'pit ?bull',
        'terrier', 'bull[ -]?terrier', 'australian[ -]?shepherd', 'australian[ -]?shep[h]?ard', 'german[ -]?shep[h]?erd',
        'german[ -]?shep[h]?ard', 'malinois', 'woof', 'labrador', 'collie', 'canis', 'lupus', 'canid', 'chihuahua', 'poodle', 'chinchilla',
        'chow[ -]?chow', 'corgi', 'anubis', 'beagle', 'german[ -]?shep', '.*wolf', 'direwolf', 'pointer', 'dhole',
        'anubian', 'dalmatian', 'dalmation', 'inumimi', 'lupine', 'malamute', 'mastiff', 'mutt', 'rottweill?er', 'shih[ -]?tzu', 'worgen',
        'vallhund', 'puppy', 'okami', 'great[ -]?dane', 'golden[ -]?(retriever|lab|labrador)', 'cocker[ -]?spaniel', 'samoyed', 'awoo',
        'borzoi', 'spaniel', 'ookamimimi', 'jakkarumimi', 'chinchiramimi', 'woffo', 'wuff', 'wolfdog', 'setter', 'papillon',
        '🐶', '🐺', '🐕', '🐩', 'aussie[ -]?doodle', 'shiba', 'inu', 'veil[ -]?hound', 'timber[ -]?wolf', 'hell[ -]?hound', 'hound',
        'kangal', 'behemoth',
        'wolfess', 'latrans', 'dog[ -]?(girl|bo[yi][e]?)', 'wolf[ -]?(girl|bo[yi][e]?)', 'doggie', 'doggy', 'canis', 'fenrir', 'v[aá]na[r]?gand[r]?',
        'doggo', 'barghest', 'barguest', 'crux', 'ᴡᴏʟғ', '𝗪𝗼𝗹𝗳.?', '𝙳𝚘𝚐', 'dire[ -]?hound'],

    [Species.Equine]: ['horse', 'zebra', 'pony', 'donkey', 'stallion', 'mare', 'filly', 'equine', 'shire', 'mule', 'zeeb', 'pon[yi][ -]?bo[yi]',
        'unicorn', 'clydesdale', 'shire', 'appaloosa', 'friesian', 'draft', 'draught', 'alicorn', 'horsie', 'hoss', 'pegasus', 'colt',
        'filly', 'neigh', 'dullahan', 'tikbalang', 'gypsy[ -]?vanner', 'ardenne[r]?', 'ardennais[e]?', 'pony[ -]?(girl|bo[yi][e]?)',
        'cream[ -]?draft', 'belgian[ -]?draft', 'saddle[ -]?bred', 'warm[ -]?blood', 'marsh tacky', 'fox[ -]?trotter', 'morab',
        'saddle[ -]?horse', 'walkaloosa', 'welara', 'tiger[ -]?horse', 'horsekin', 'pone', 'tinker[ -]?hengste?',
        'horse[ -]?(girl|bo[yi][e]?)', 'umamimi', 'shimaumamimi', 'thestral', 'pegusus',
        'mustang', 'horse.*', '.*horse', '.*pony', 'equus', 'kelpie', 'kuranta', 'zonkey',
        '🐴', '🦓', '🐎'],

    [Species.Feline]: ['cat', 'jaguar', 'cheetah', 'lynx', 'tiger.*', 'puma', 'lion.*', 'kitten', 'cat[ -]?(girl|bo[yi][e]?)', 'neko',
        'neko[ -]?mimi', 'lioness', 'panther', 'panthress', 'tigress', 'feline', 'leopard', 'cougar', 'kitty', 'migo\'?te',
        'miqo\'?te', 'ocelot', 'saber[ -]?tooth', 'tabby', 'serval', 'russian[ -]?blue', 'thunderian', 'meow', 'lombax',
        '(exotic|domestic|british|oriental|american|shaded|chinchilla)[ -]?shorthair', 'burmese', 'maine[ -]?coon', 'korat', 'ragdoll',
        'ocicat', 'chartreux', 'german[ -]?rex', 'turkish[ -]?van', 'ragamuffin', 'norwegian[ -]?forest[ -]?(cat)?', 'burmilla',
        'khajiit', 'catamount', 'cat[ -]?person', 'tetton', 'tigre', 'calico', 'caracal', 'tabaxi', 'housecat',
        'kodkod', 'karotanta', 'siamese', 'felis', 'catus', 'nekomata', 'nekomimi', 'trianii', 'caitian', 'catt[o|e]', '.*cat', 'toramimi',
        'shishimimi', 'pansamimi', 'hyoumimi', 'mytharii', 'felinid', 'kitteh', 'cat[ -]folk', 'chat(te)?', 'lionkin', 'tigerkin',
        'nyah', 'charr', 'kater', 'kat', 'jinko', 'katze?',
        'liger', 'tigon', 'sab(re|er)[ -]?tooth',
        '🐅', '🐆', '🐯', '🦁', '🐈'],

    [Species.Vulpine]: ['fox', 'fennec', 'vixen', 'vulpine', 'fox.*', 'fennec', 'kitsune.*', 'kistune', 'gumiho', 'kumiho',
        'nogitsune', 'yako', '🦊', 'fox[ -]?(girl|bo[yi][e]?)', 'vulpes', 'silver[ -]?fox', 'arctic[ -]?fox', 'fennec[ -]?fox', 'red[ -]?fox',
        'cape[ -]?fox', 'ninetails', 'ninetales', 'vulpo', 'vulpera', 'kitsunemimi', 'foxkin', 'fire[ -]?fox'],

    [Species.Dragon]: ['dragon', '🐉', 'wyvern', 'felkin', 'dragon.*', '.*drake', '.*wyvern', '.*felkin',
        'night[ -]?fury', 'draconian', 'dragonn?ess', 'draconic', 'dragovian',
        'sea[ -]?dragon', 'doragonmimi', 'doragon', 'half[ -]dragon', 'dragonkin', 'wyverian', 'glavenus',
        'anjanath', 'ragon'
        ],

    [Species.Reptile]: ['lizard', 'snake', 'crocodile', 'alligator', 'chameleon', 'anole', 'aligator', 'snake.*', 'lizard', 'gator',
        'gecko', 'reptile', 'reptilian', 'scaly', 'scale[ -]?born', 'argonian', 'saxhleel', 'skink', 'cobra', 'turtle', 'tortoise',
        'nope[ -]rope', 'anaconda', 'python', 'lizardkin', 'lizard[ -]?folk', 'yuan[ -]?ti', 'crocodilian', 'serp[ea]a?nt(ine)?',
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
        'houndour', 'zoroark', 'mightyena', 'mew', 'nidoqueen',

        // digimon
        'gatomon', 'impmon', 'guilmon'
        ],

    [Species.Amphibian]: ['salamander', 'frog', 'toad', 'newt', 'amphibian', 'axolotl'],

    [Species.Avian]: ['bird', 'gryphon', 'raven', 'cardinal', 'cockatiel', 'ph(oe|eo)nix', 'roc', 'chimera', 'avian', 'albatross',
        'dove', 'eagle', 'owl', 'penguin', 'cockatoo', 'shoebill', 'rito', 'crow', 'meadow[ -]?lark', 'torimimi',
        'peacock', 'chocobo', 'emu', 'ostrich', 'flamingo', 'duck', 'swallow', 'nightingale', 'toucan', 'secretary[ -?]bird',
        '(pink|blue)[ -]?jay', 'jaybird', 'chicken', 'rooster', 'blauhäher', 'gryphon', 'gr[iy]ff[io]n',
        'parrot', 'avarr?ian',
        'maran',
        '🦚', '🦃', '🦢', '🦆', '🦅', '🦉', '🦜', '🦩'],

    [Species.Bat]: ['bat', 'nimbat', 'foxbat', 'pteropus', 'komorimimi', '🦇'],

    [Species.Bovine]: ['cow', 'bison', 'bovine', 'antelope', 'gazelle', 'oryx', 'buffalo', 'bison', 'black[ -]?angus', 'bull', 'ox',
        'ushimimi', 'holstaur', 'moo', 'ᴍᴏᴏ', 'cattle', 'hucow', 'caprin[a]?e', 'goat-antelope', 'muskox', 'urial', 'mouflon',
        'taurine', 'aurochs', 'bos', 'bos taurus', 'taurus',
        '🐃', '🐂', '🐄', '🐐'],

    [Species.Caprinae]: ['sheep', 'goat', 'ibex', 'takin', 'bharal', 'goral', 'serow', 'lamb', 'faun', 'ram', 'faunus', 'goat.*',
        'yagimimi', 'hitsujimimi', 'sheepie'],

    [Species.Camielidae]: ['camel', 'llama', 'alpaca', 'guanaco', 'dromedary', 'dromedar', '🦙', '🐪', '🐫'],
    [Species.Cervine]: ['deer', 'elk', 'moose', 'caribou', 'reindeer', 'doe', 'cervid', 'cervine', 'stag', 'shikamimi'],

    [Species.Dinosaur]: ['raptor', 't-rex', 'pterodactyl', 'deinonychus', 'death[ -]?claw', '[\\w-]*saurus', 'dinosaur',
        'trex', 'tyrannosaurus', 'saurian', '[\\w-]*raptor', 'dino',
        '🦖', '🦕'],

    [Species.Erinaceidae]: ['hedgehog', 'gymnure', 'moonrat'],
    [Species.Elephantidae]: ['elephant', 'mammoth', 'mastodon', 'pachyderm', 'tusker'],
    [Species.Fish]: ['shark', 'great white', 'sergal', 'fish', 'aquatic', 'melanopterus', 'carcharhinus', '.*fish', '.*shark'],
    [Species.Giraffe]: ['giraffe', '🦒', 'kirinmimi', 'okapi', '[gk]ira(ff|hv)[ei]?'],
    [Species.Herpestidae]: ['mongoose', 'meerkat', 'kusimanse', 'suricate'],
    [Species.Hippopotamidae]: ['hippo', 'hippopotamus', '🦛'],
    [Species.Hyaenidae]: ['hyena', 'aardwolf', 'hyaena', 'yeen'],

    [Species.Hybrid]: ['hybrid', 'cabbit', 'fabbit', 'laquine', 'folf', 'tolf', 'myox', 'wolger', 'silkie', 'yumar',
        'foxcoon', 'drazelle', 'vulpkanin', 'poochyena', 'batpon', 'delphox', 'unifox', 'rooram', 'catbat', 'bunfox'],

    [Species.Insect]: ['bug', 'bee', 'wasp', 'ant', 'spider', 'arachnid', 'scorpion', 'insect', 'buggo', 'hornet', 'vespidae',
        'mantis', 'beefolk', 'ladybug', 'hachimimi', 'moth', 'bumblebee', 'tolype'],

    [Species.Lapine]: ['bunny', 'rabbit', 'hare', 'lapine', 'viera', 'wabbit', 'lagomo(rp|pr)h', 'bunny[ -]?(girl|bo[yi][e])', 'usagimimi',
        'bun', '.*bunny', 'cabbit', 'fabbit', 'häschen', 'bunbun', 'cottontail', 'rabbet', 'jack[ -]?rabbit', 'lapine?', 'jackalope',
        'leporids?', 'leporidae', 'broodal', 'ʀᴀʙʙɪᴛ', 'ʟᴀᴘɪɴᴇ', '🐇'],

    [Species.MarineMammal]: ['whale', 'dolphin', 'orca', '🐬', 'killer[ -]?whale'],

    [Species.Marsupial]: ['kangaroo', 'opossum', 'koala', 'wombat', 'possum', 'roo', 'bandicoot', 'bilby', 'numbat', 'wallaby',
        'thylacine', 'marsupial[ -]?wolf', 'tasmanian[ -]?tiger', 'quokka', 'glider', 'cuscus', 'marsupial', 'tasmanian[ -]?devil', 'musky[ -]?rat',
        'bettong', 'Känguru', '🦘', '🐨'],

    [Species.Mephitidae]: ['skunk', '🦨', 'stink[ -]?badger'],

    [Species.Musteline]: ['otter', 'ferret', 'mink', 'weasel', 'stoat', 'wolverine', 'marten', 'musteline', 'badger', 'otterkin',
        'kawausomimi', 'itachimimi', 'ferettomimi', 'ottsel', '🦡', '🦦'],

    [Species.Pinniped]: ['seal', 'walrus', 'fur seal', 'sea[ -]?lion'],

    [Species.Primate]: ['gorilla', 'monkey', 'ape', 'chimp', 'lemur', 'bonobo', 'chimpanzee', 'silverback', 'sarumimi', 'primate',
        '🐒', '🦍', '🦧'],

    [Species.Procyon]: ['raccoon', 'coatimund', 'longtail', 'procyon', 'tanuki', 'tanukimimi', '🦝', 'racoon', 'rakunmimi',
        'ring[ -]?tail(ed)?'],

    [Species.Rhinoceros]: ['rhino', 'rhinoceros', '🦏', '.*rhino'],

    [Species.Rodent]: ['rat', 'mouse', 'chipmunk', 'squirrel', 'hamster', 'rodent', 'maus', 'gerbil', 'mousie', 'muskrat', 'ratsin',
        'skaven', 'roedor', 'risumimi', 'nezumimi', 'jerboa', 'burmecian', 'rat[ -]?(boy|girl|folk)', 'mouse[ -]?(boy|girl|folk)',
        '🐀', '🐁', '🐿'],

    [Species.Suidae]: ['pig', 'boar', 'warthog', 'bushpig', 'babirusa', 'sow', 'swine', 'suid', 'suine', 'piglet', 'hog',
        'piggie', 'piggy', 'quilboar', 'porcine', 'porcid', 'butamimi', '🐗', '🐖'],

    [Species.Ursine]: ['bear', 'panda', 'grizzly', 'black[ -]?bear', 'brown[ -]?bear', 'polar[ -]?bear', 'ursine', 'pandaren', 'ursus',
        'pandamimi', 'kumamimi'],

    [Species.Xenarthra]: ['armadillo', 'anteater', 'sloth', 'glyptodont', 'a(rm|mr)ad[iy]ll?o', 'sloth', 'ant[ -]?eater'],

    [Species.Demon]: ['demon', 'devil', 'succubus', 'incubus', 'daemon', 'deamon', 'demoness', 'demonkin', 'baphomet', 'eredar',
        'tengu', 'devilkin', 'd[a]?emonette', 'cambion', 'amanojaku', 'tanar[\']?ri', 'balor', 'marilith', 'lilith', '.*demon',
        'd[äa]mon[ie]n.*', 'ifrit', 'efree?t', 'afa?rit', 'demonic'],

    [Species.Divinity]: ['god', 'goddess', 'divinity', 'demi[ -]?god', 'demi[ -]?goddess'],
    [Species.Fae]: ['fairy', 'fae', 'imp', 'elemental', 'fey', 'pixie', 'nymph', 'faerie'],

    [Species.Humanoid]: ['satyr', 'gnome', 'dwarf', 'halfling', 'havlin', 't[h]?(ie|ei)fling', 'dwarves', 'humanoid', 'yordle', 'hylian', 'lalafell',
        'zwerg', 'draph', 'dryad'],

    [Species.Minotaur]: ['minotaur', 'tauren', 'minotaurus', 'm[iy]n[ao]t(uo|ou|o|u)ru?s?'],

    [Species.Monster]: ['gnoll', 'goblin', 'kobold', 'monster', 'troll', 'illithid', 'golem', 'basilisk', 'oni', 'kaiju', 'mimic',
        'hippogriff', 'hippogryph', 'manticore', 'harpy', 'gargoyle', 'ghost', 'eldritch', 'tentacle', 'youkai', 'ogre', 'skeleton',
        'ghoul', 'vrykolakas', 'godzilla', 'bugbear', 'gnobold', 'undead', 'lich', 'siren', 'mermaid', 'slime', 'goo',
        'y[oō]kai', 'shinigami', 'bunyip', 'giant', 'giantess', 'bokoblin', 'kirin', 'qilin'],

    [Species.Naga]: ['naga', 'lamia'],
    [Species.Taur]: ['centaur', 'chakat', 'equitaur', 'felitaur', 'weretaur', 'humantaur', 'cowtaur', '.*taur', 'cervitaur'],
    [Species.Orc]: ['orc', 'uruk-hai', 'snaga', 'uruk[ -]?hai', 'ork', 'orcess'],
    [Species.Vampire]: ['vampire', 'nosferatu', 'daywalker', 'd[h]?amp[h]?ir', 'vampyre', 'vampiric', 'vampir'],

    [Species.Were]: ['werewolf', 'lycan', 'werelion', 'weretiger', 'werebear', 'werecoyote', 'werehog', 'were[ -]?wolf', 'were[ -]?lion',
        'were[ -]?bear', 'were[ -]?coyote', 'were[ -]?hog', 'lycant[h]?rop[h]?[ey]?', 'loup[ -]?garou[sx]?',
        'were[ -]?squirrel', 'were[ -]?donkey', 'were[ -]?rat'],

    [Species.Alien]: ['krogan', 'xenomorph', 'quarian', 'turian', 'asari', 'togruta', 'otolla', 'gungan', 'chiss', 'alien', 'puazi',
        'hutt', 'klyntar', 'twi\'?lek', 'sangheili', 'salarian', 't[\']?vaoan', 'yautja'],

    [Species.Robot]: ['android', 'cyborg', 'gynoid', 'automaton', 'robot', 'transformer', 'cybertronian', 'reploid', 'synth', 'ai',
        'realian', 'replicant'],

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

