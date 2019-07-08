import Axios from 'axios';
import Vue from 'vue';
import Editor from '../bbcode/Editor.vue';
import {InlineDisplayMode} from '../bbcode/interfaces';
import { initParser, standardParser } from '../bbcode/standard';
import CharacterLink from '../components/character_link.vue';
import CharacterSelect from '../components/character_select.vue';
import {setCharacters} from '../components/character_select/character_list';
import DateDisplay from '../components/date_display.vue';
import SimplePager from '../components/simple_pager.vue';

import {
    Character as CharacterInfo, CharacterImage, CharacterImageOld, CharacterInfotag, CharacterSettings, KinkChoice
} from '../interfaces';
import {registerMethod, Store} from '../site/character_page/data_store';
import {
    Character, CharacterFriend, CharacterKink, Friend, FriendRequest, FriendsByCharacter, GuestbookState, KinkChoiceFull,
    SharedKinks
} from '../site/character_page/interfaces';
import '../site/directives/vue-select'; //tslint:disable-line:no-import-side-effect
import * as Utils from '../site/utils';
import core from './core';
import { EventBus } from './event-bus';

const parserSettings = {
    siteDomain: 'https://www.f-list.net/',
    staticDomain: 'https://static.f-list.net/',
    animatedIcons: true,
    inlineDisplayMode: InlineDisplayMode.DISPLAY_ALL
};


// tslint:disable-next-line: ban-ts-ignore
// @ts-ignore
async function characterData(name: string | undefined, id: number = -1, skipEvent: boolean = false): Promise<Character> {
    // console.log('CharacterDataquery', name);

    const data = await core.connection.queryApi<CharacterInfo & {
        badges: string[]
        customs_first: boolean
        character_list: {id: number, name: string}[]
        current_user: {inline_mode: number, animated_icons: boolean}
        custom_kinks: {
            [key: number]:
                {id: number, choice: 'favorite' | 'yes' | 'maybe' | 'no', name: string, description: string, children: number[]}
        }
        custom_title: string
        images: CharacterImage[]
        kinks: {[key: string]: string}
        infotags: {[key: string]: string}
        memo?: {id: number, memo: string}
        settings: CharacterSettings,
        timezone: number
    }>('character-data.php', {name});
    const newKinks: {[key: string]: KinkChoiceFull} = {};
    for(const key in data.kinks)
        newKinks[key] = <KinkChoiceFull>(<string>data.kinks[key] === 'fave' ? 'favorite' : data.kinks[key]);
    for(const key in data.custom_kinks) {
        const custom = data.custom_kinks[key];
        if((<'fave'>custom.choice) === 'fave') custom.choice = 'favorite';
        custom.id = parseInt(key, 10);
        for(const childId of custom.children)
            newKinks[childId] = custom.id;
    }
    (<any>data.settings).block_bookmarks = (<any>data.settings).prevent_bookmarks; //tslint:disable-line:no-any
    const newInfotags: {[key: string]: CharacterInfotag} = {};
    for(const key in data.infotags) {
        const characterInfotag = data.infotags[key];
        const infotag = Store.kinks.infotags[key];
        if(infotag === undefined) continue;
        newInfotags[key] = infotag.type === 'list' ? {list: parseInt(characterInfotag, 10)} : {string: characterInfotag};
    }
    parserSettings.inlineDisplayMode = data.current_user.inline_mode;
    parserSettings.animatedIcons = core.state.settings.animatedEicons;

    const charData = {
        is_self: false,
        character: {
            id: data.id,
            name: data.name,
            title: data.custom_title,
            description: data.description,
            created_at: data.created_at,
            updated_at: data.updated_at,
            views: data.views,
            image_count: data.images.length,
            inlines: data.inlines,
            kinks: newKinks,
            customs: data.custom_kinks,
            infotags: newInfotags,
            online_chat: false,
            timezone: data.timezone,
            deleted: false
        },
        memo: data.memo,
        character_list: data.character_list,
        badges: data.badges,
        settings: data.settings,
        bookmarked: core.characters.get(data.name).isBookmarked,
        self_staff: false
    };

    if (!skipEvent)
        EventBus.$emit('character-data', { character: charData });

    return charData;
}

function contactMethodIconUrl(name: string): string {
    return `${Utils.staticDomain}images/social/${name}.png`;
}

async function fieldsGet(): Promise<void> {
    if(Store.kinks !== undefined) return; //tslint:disable-line:strict-type-predicates
    try {
        const fields = (await (Axios.get(`${Utils.siteDomain}json/api/mapping-list.php`))).data as SharedKinks & {
            kinks: {[key: string]: {group_id: number}}
            infotags: {[key: string]: {list: string, group_id: string}}
        };
        const kinks: SharedKinks = {kinks: {}, kink_groups: {}, infotags: {}, infotag_groups: {}, listitems: {}};
        for(const id in fields.kinks) {
            const oldKink = fields.kinks[id];
            kinks.kinks[oldKink.id] = {
                id: oldKink.id,
                name: oldKink.name,
                description: oldKink.description,
                kink_group: oldKink.group_id
            };
        }
        for(const id in fields.kink_groups) {
            const oldGroup = fields.kink_groups[id]!;
            kinks.kink_groups[oldGroup.id] = {
                id: oldGroup.id,
                name: oldGroup.name,
                description: '',
                sort_order: oldGroup.id
            };
        }
        for(const id in fields.infotags) {
            const oldInfotag = fields.infotags[id];
            kinks.infotags[oldInfotag.id] = {
                id: oldInfotag.id,
                name: oldInfotag.name,
                type: oldInfotag.type,
                validator: oldInfotag.list,
                search_field: '',
                allow_legacy: true,
                infotag_group: oldInfotag.group_id
            };
        }
        for(const id in fields.listitems) {
            const oldListItem = fields.listitems[id]!;
            kinks.listitems[oldListItem.id] = {
                id: oldListItem.id,
                name: oldListItem.name,
                value: oldListItem.value,
                sort_order: oldListItem.id
            };
        }
        for(const id in fields.infotag_groups) {
            const oldGroup = fields.infotag_groups[id]!;
            kinks.infotag_groups[oldGroup.id] = {
                id: oldGroup.id,
                name: oldGroup.name,
                description: oldGroup.description,
                sort_order: oldGroup.id
            };
        }
        Store.kinks = kinks;
    } catch(e) {
        Utils.ajaxError(e, 'Error loading character fields');
        throw e;
    }
}

async function friendsGet(id: number): Promise<CharacterFriend[]> {
    return (await core.connection.queryApi<{friends: CharacterFriend[]}>('character-friends.php', {id})).friends;
}

async function imagesGet(id: number): Promise<CharacterImage[]> {
    return (await core.connection.queryApi<{images: CharacterImage[]}>('character-images.php', {id})).images;
}

async function guestbookGet(id: number, page: number): Promise<GuestbookState> {
    return core.connection.queryApi<GuestbookState>('character-guestbook.php', {id, page: page - 1});
}

async function kinksGet(id: number): Promise<CharacterKink[]> {
    const data = await core.connection.queryApi<{kinks: {[key: string]: string}}>('character-data.php', {id});
    return Object.keys(data.kinks).map((key) => {
        const choice = data.kinks[key];
        return {id: parseInt(key, 10), choice: <KinkChoice>(choice === 'fave' ? 'favorite' : choice)};
    });
}


export function init(characters: {[key: string]: number}): void {
    Utils.setDomains(parserSettings.siteDomain, parserSettings.staticDomain);
    initParser(parserSettings);

    Vue.component('character-select', CharacterSelect);
    Vue.component('character-link', CharacterLink);
    Vue.component('date-display', DateDisplay);
    Vue.component('simple-pager', SimplePager);
    Vue.component('bbcode-editor', Editor);
    setCharacters(Object.keys(characters).map((name) => ({name, id: characters[name]})));
    core.connection.onEvent('connecting', () => {
        Utils.Settings.defaultCharacter = characters[core.connection.character];
    });
    Vue.directive('bbcode', (el, binding) => {
        while(el.firstChild !== null)
            el.removeChild(el.firstChild);
        el.appendChild(standardParser.parseEverything(<string>binding.value));
    });
    registerMethod('characterData', characterData);
    registerMethod('contactMethodIconUrl', contactMethodIconUrl);
    registerMethod('sendNoteUrl', (character: CharacterInfo) => `${Utils.siteDomain}read_notes.php?send=${character.name}`);
    registerMethod('fieldsGet', fieldsGet);
    registerMethod('friendsGet', friendsGet);
    registerMethod('kinksGet', kinksGet);
    registerMethod('imagesGet', imagesGet);
    registerMethod('guestbookPageGet', guestbookGet);
    registerMethod('imageUrl', (image: CharacterImageOld) => image.url);
    registerMethod('memoUpdate', async(id: number, memo: string) => {
        await core.connection.queryApi('character-memo-save.php', {target: id, note: memo});
        return {id, memo, updated_at: Date.now() / 1000};
    });
    registerMethod('imageThumbUrl', (image: CharacterImage) => `${Utils.staticDomain}images/charthumb/${image.id}.${image.extension}`);
    registerMethod('bookmarkUpdate', async(id: number, state: boolean) => {
        await core.connection.queryApi(`bookmark-${state ? 'add' : 'remove'}.php`, {id});
        return state;
    });
    registerMethod('characterFriends', async(id: number) =>
        core.connection.queryApi<FriendsByCharacter>('character-friend-list.php', {id}));
    registerMethod('friendRequest', async(target_id: number, source_id: number) =>
        (await core.connection.queryApi<{request: FriendRequest}>('request-send2.php', {source_id, target_id})).request);
    registerMethod('friendDissolve', async(friend: Friend) =>
        core.connection.queryApi<void>('friend-remove.php', {source_id: friend.source.id, dest_id: friend.target.id}));
    registerMethod('friendRequestAccept', async(req: FriendRequest) => {
        await core.connection.queryApi('request-accept.php', {request_id: req.id});
        return {id: undefined!, source: req.target, target: req.source, createdAt: Date.now() / 1000};
    });
    registerMethod('friendRequestCancel', async(req: FriendRequest) =>
        core.connection.queryApi<void>('request-cancel.php', {request_id: req.id}));
    registerMethod('friendRequestIgnore', async(req: FriendRequest) =>
        core.connection.queryApi<void>('request-deny.php', {request_id: req.id}));
}