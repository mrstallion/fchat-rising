import {Character as CharacterInfo, CharacterImage, CharacterSettings, Infotag, Kink, KinkChoice} from '../../interfaces';

export interface CharacterMenuItem {
    label: string
    permission: string
    link(character: Character): string
    handleClick?(evt: MouseEvent): void
}

export interface SelectItem {
    text: string
    value: string | number
}

export interface SharedStore {
    kinks: SharedKinks
    authenticated: boolean
}

export interface StoreMethods {
    bookmarkUpdate(id: number, state: boolean): Promise<boolean>

    characterBlock?(id: number, block: boolean, reason?: string): Promise<void>
    characterCustomKinkAdd(id: number, name: string, description: string, choice: KinkChoice): Promise<void>
    characterData(name: string | undefined, id: number | undefined, skipEvent: boolean | undefined): Promise<Character>
    characterDelete(id: number): Promise<void>
    characterDuplicate(id: number, name: string): Promise<DuplicateResult>
    characterFriends(id: number): Promise<FriendsByCharacter>
    characterNameCheck(name: string): Promise<CharacterNameCheckResult>
    characterRename?(id: number, name: string, renamedFor?: string): Promise<RenameResult>
    characterReport(reportData: CharacterReportData): Promise<void>

    contactMethodIconUrl(name: string): string
    sendNoteUrl(character: CharacterInfo): string

    fieldsGet(): Promise<void>

    friendDissolve(friend: Friend): Promise<void>
    friendRequest(target: number, source: number): Promise<FriendRequest>
    friendRequestAccept(request: FriendRequest): Promise<Friend>
    friendRequestIgnore(request: FriendRequest): Promise<void>
    friendRequestCancel(request: FriendRequest): Promise<void>

    friendsGet(id: number): Promise<CharacterFriend[]>

    groupsGet(id: number): Promise<CharacterGroup[]>

    guestbookPageGet(id: number, page: number, unapproved: boolean): Promise<GuestbookState>
    guestbookPostApprove(id: number, approval: boolean): Promise<void>
    guestbookPostDelete(id: number): Promise<void>
    guestbookPostPost(target: number, source: number, message: string, privatePost: boolean): Promise<void>
    guestbookPostReply(id: number, reply: string | null): Promise<GuestbookReply>

    hasPermission?(permission: string): boolean

    imagesGet(id: number): Promise<CharacterImage[]>
    imageUrl(image: CharacterImage): string
    imageThumbUrl(image: CharacterImage): string

    kinksGet(id: number): Promise<CharacterKink[]>

    memoUpdate(id: number, memo: string): Promise<MemoReply>
}

export interface SharedKinks {
    kinks: {[key: string]: Kink | undefined}
    kink_groups: {[key: string]: KinkGroup | undefined}
    infotags: {[key: string]: Infotag | undefined}
    infotag_groups: {[key: string]: InfotagGroup | undefined}
    listitems: {[key: string]: ListItem | undefined}
}

export type SiteDate = number | string | null;
export type KinkChoiceFull = KinkChoice | number;
export const CONTACT_GROUP_ID = '1';

export interface DisplayKink {
    id: number
    name: string
    description: string
    choice?: KinkChoice
    group: number
    isCustom: boolean
    hasSubkinks: boolean
    subkinks: DisplayKink[]
    ignore: boolean
}

export interface DisplayInfotag {
    id: number
    isContact: boolean
    string?: string
    number?: number | null
    list?: number
}

export interface KinkGroup {
    id: number
    name: string
    description: string
    sort_order: number
}

export interface InfotagGroup {
    id: number
    name: string
    description: string
    sort_order: number
}

export interface ListItem {
    id: number
    name: string
    value: string
    sort_order: number
}

export interface CharacterFriend {
    id: number
    name: string
}

export interface CharacterKink {
    id: number
    choice: KinkChoice
}

export type CharacterName = string | CharacterNameDetails;

export interface CharacterNameDetails {
    id: number
    name: string
    deleted: boolean
}

export type ThreadOrderMode = 'post' | 'explicit';

export interface GroupPermissions {
    view: boolean
    edit: boolean
    threads: boolean
    permissions: boolean
}

export interface CharacterGroup {
    id: number
    title: string
    public: boolean
    description: string
    threadCount: number
    orderMode: ThreadOrderMode
    createdAt: SiteDate
    myPermissions: GroupPermissions
    character: CharacterName
    owner: boolean
}

export interface Character {
    readonly is_self: boolean
    character: CharacterInfo
    readonly settings: CharacterSettings
    readonly badges?: string[]
    memo?: {
        id: number
        memo: string
    }
    readonly character_list?: {
        id: number
        name: string
    }[]
    bookmarked?: boolean
    readonly self_staff: boolean
    readonly ban?: string
    readonly ban_reason?: string
    readonly timeout?: number
    readonly block_reason?: string
}

export interface GuestbookPost {
    readonly id: number
    readonly character: CharacterNameDetails
    approved: boolean
    readonly private: boolean
    postedAt: SiteDate
    message: string
    reply: string | null
    repliedAt: SiteDate
    canEdit: boolean
    deleted?: boolean
}

export interface GuestbookReply {
    readonly reply: string
    readonly postId: number
    readonly repliedAt: SiteDate
}

export interface GuestbookState {
    posts: GuestbookPost[]
    readonly nextPage: boolean
    readonly canEdit: boolean
}

export interface MemoReply {
    readonly id: number
    readonly memo: string
    readonly updated_at: SiteDate
}

export interface DuplicateResult {
    // Url to redirect user to when duplication is complete.
    readonly next: string
}

export type RenameResult = DuplicateResult;

export interface CharacterNameCheckResult {
    valid: boolean
}

export interface CharacterReportData {
    subject: string
    message: string
    character: number | null
    type: string
    url: string
    reported_character: number
}

export interface Friend {
    id: number
    source: CharacterNameDetails
    target: CharacterNameDetails
    createdAt: SiteDate
}

export type FriendRequest = Friend;

export interface FriendsByCharacter {
    existing: Friend[]
    pending: FriendRequest[]
    incoming: FriendRequest[]
    name: string
}