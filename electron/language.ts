import * as _ from 'lodash';


export function getSafeLanguages(langs: string | string[] | undefined): string[] {
    return langs ? _.castArray(langs) : [];
}


export const knownLanguageNames = {
    af: 'Afrikaans',
    bg: 'Bulgarian',
    ca: 'Catalan',
    cs: 'Czech',
    cy: 'Welsh',
    da: 'Danish',
    de: 'German',
    el: 'Greek',

    'en-AU': 'English, Australian',
    'en-CA': 'English, Canadian',
    'en-GB': 'English, British',
    'en-US': 'English, American',

    es: 'Spanish',
    'es-419': 'Spanish, Latin America and Caribbean',
    'es-AR': 'Spanish, Argentine',
    'es-ES': 'Spanish, Castilian',
    'es-MX': 'Spanish, Mexican',
    'es-US': 'Spanish, American',

    et: 'Estonian',
    fa: 'Persian',
    fi: 'Finnish',
    fo: 'Faroese',
    fr: 'French',
    he: 'Hebrew',
    hi: 'Hindi',
    hr: 'Croatian',
    hu: 'Hungarian',
    hy: 'Armenian',
    id: 'Indonesian',
    it: 'Italian',
    ko: 'Korean',
    lt: 'Lithuanian',
    lv: 'Latvian',
    nb: 'Norwegian',
    nl: 'Dutch',
    pl: 'Polish',

    'pt-BR': 'Portuguese, Brazilian',
    'pt-PT': 'Portuguese, European',

    ro: 'Romanian',
    ru: 'Russian',
    sh: 'Serbo-Croatian',
    sk: 'Slovak',
    sl: 'Slovenian',
    sq: 'Albanian',
    sr: 'Serbian',
    sv: 'Swedish',
    ta: 'Tamil',
    tg: 'Tajik',
    tr: 'Turkish',
    uk: 'Ukranian',
    vi: 'Vietnamese'
};

