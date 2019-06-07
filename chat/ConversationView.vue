<template>
    <div style="height:100%;display:flex;flex-direction:column;flex:1;margin:0 5px;position:relative" id="conversation">
        <div style="display:flex" v-if="isPrivate(conversation)" class="header">
            <img :src="characterImage" style="height:60px;width:60px;margin-right:10px" v-if="settings.showAvatars"/>
            <div style="flex:1;position:relative;display:flex;flex-direction:column">
                <div>
                    <user :character="conversation.character"></user>
                    <a href="#" @click.prevent="showLogs()" class="btn">
                        <span class="fa fa-file-alt"></span> <span class="btn-text">{{l('logs.title')}}</span>
                    </a>
                    <a href="#" @click.prevent="showSettings()" class="btn">
                        <span class="fa fa-cog"></span> <span class="btn-text">{{l('conversationSettings.title')}}</span>
                    </a>
                    <a href="#" @click.prevent="reportDialog.report()" class="btn">
                        <span class="fa fa-exclamation-triangle"></span><span class="btn-text">{{l('chat.report')}}</span></a>
                </div>
                <div style="overflow:auto;max-height:50px">
                    {{l('status.' + conversation.character.status)}}
                    <span v-show="conversation.character.statusText"> – <bbcode :text="conversation.character.statusText"></bbcode></span>
                </div>
            </div>
        </div>
        <div v-else-if="isChannel(conversation)" class="header">
            <div style="display: flex; align-items: center;">
                <div style="flex: 1;">
                    <span v-show="conversation.channel.id.substr(0, 4) !== 'adh-'" class="fa fa-star" :title="l('channel.official')"
                        style="margin-right:5px;vertical-align:sub"></span>
                    <h5 style="margin:0;display:inline;vertical-align:middle">{{conversation.name}}</h5>
                    <a href="#" @click.prevent="descriptionExpanded = !descriptionExpanded" class="btn">
                        <span class="fa" :class="{'fa-chevron-down': !descriptionExpanded, 'fa-chevron-up': descriptionExpanded}"></span>
                        <span class="btn-text">{{l('channel.description')}}</span>
                    </a>
                    <a href="#" @click.prevent="showManage()" v-show="isChannelMod" class="btn">
                        <span class="fa fa-edit"></span> <span class="btn-text">{{l('manageChannel.open')}}</span>
                    </a>
                    <a href="#" @click.prevent="showLogs()" class="btn">
                        <span class="fa fa-file-alt"></span> <span class="btn-text">{{l('logs.title')}}</span>
                    </a>
                    <a href="#" @click.prevent="showSettings()" class="btn">
                        <span class="fa fa-cog"></span> <span class="btn-text">{{l('conversationSettings.title')}}</span>
                    </a>
                    <a href="#" @click.prevent="reportDialog.report()" class="btn">
                        <span class="fa fa-exclamation-triangle"></span><span class="btn-text">{{l('chat.report')}}</span></a>
                </div>
                <ul class="nav nav-pills mode-switcher">
                    <li v-for="mode in modes" class="nav-item">
                        <a :class="isChannel(conversation) ? {active: conversation.mode == mode, disabled: conversation.channel.mode != 'both'} : undefined"
                            class="nav-link" href="#" @click.prevent="setMode(mode)">{{l('channel.mode.' + mode)}}</a>
                    </li>
                </ul>
            </div>
            <div style="z-index:5;position:absolute;left:0;right:0;max-height:60%;overflow:auto"
                :style="{display: descriptionExpanded ? 'block' : 'none'}" class="bg-solid-text border-bottom">
                <bbcode :text="conversation.channel.description"></bbcode>
            </div>
        </div>
        <div v-else class="header" style="display:flex;align-items:center">
            <h4>{{l('chat.consoleTab')}}</h4>
            <a href="#" @click.prevent="showLogs()" class="btn">
                <span class="fa fa-file-alt"></span> <span class="btn-text">{{l('logs.title')}}</span>
            </a>
        </div>
        <div class="search input-group" v-show="showSearch">
            <div class="input-group-prepend">
                <div class="input-group-text"><span class="fas fa-search"></span></div>
            </div>
            <input v-model="searchInput" @keydown.esc="hideSearch()" @keypress="lastSearchInput = Date.now()"
                :placeholder="l('chat.search')" ref="searchField" class="form-control"/>
            <a class="btn btn-sm btn-light" style="position:absolute;right:5px;top:50%;transform:translateY(-50%);line-height:0;z-index:10"
                @click="hideSearch"><i class="fas fa-times"></i></a>
        </div>
        <div class="auto-ads" v-show="isAutopostingAds()">
            <h4>{{l('admgr.activeHeader')}}</h4>
            <div class="update">{{adAutoPostUpdate}}</div>

            <div v-show="adAutoPostNextAd" class="next">
                <h5>{{l('admgr.comingNext')}}</h5>
                <div>{{(adAutoPostNextAd ? adAutoPostNextAd.substr(0, 50) : '')}}...</div>
            </div>

            <a class="btn btn-sm btn-outline-primary renew-autoposts" @click="renewAutoPosting()">{{l('admgr.renew')}}</a>
        </div>
        <div class="border-top messages" :class="isChannel(conversation) ? 'messages-' + conversation.mode : undefined" ref="messages"
            @scroll="onMessagesScroll" style="flex:1;overflow:auto;margin-top:2px">
            <template v-for="message in messages">
                <message-view :message="message" :channel="isChannel(conversation) ? conversation.channel : undefined" :key="message.id"
                    :classes="message == conversation.lastRead ? 'last-read' : ''">
                </message-view>
                <span v-if="hasSFC(message) && message.sfc.action === 'report'" :key="'r' + message.id">
                    <a :href="'https://www.f-list.net/fchat/getLog.php?log=' + message.sfc.logid"
                        v-if="message.sfc.logid" target="_blank">{{l('events.report.viewLog')}}</a>
                    <span v-else>{{l('events.report.noLog')}}</span>
                    <span v-show="!message.sfc.confirmed">
                        | <a href="#" @click.prevent="message.sfc.action === 'report' && acceptReport(message.sfc)">{{l('events.report.confirm')}}</a>
                    </span>
                </span>
            </template>
        </div>
        <bbcode-editor v-model="conversation.enteredText" @keydown="onKeyDown" :extras="extraButtons" @input="keepScroll"
            :classes="'form-control chat-text-box' + (isChannel(conversation) && conversation.isSendingAds ? ' ads-text-box' : '')"
            :hasToolbar="settings.bbCodeBar" ref="textBox" style="position:relative;margin-top:5px"
            :maxlength="isChannel(conversation) || isPrivate(conversation) ? conversation.maxMessageLength : undefined">
            <span v-if="isPrivate(conversation) && conversation.typingStatus !== 'clear'" class="chat-info-text">
                {{l('chat.typing.' + conversation.typingStatus, conversation.name)}}
            </span>
            <div v-show="conversation.infoText" class="chat-info-text">
                <span class="fa fa-times" style="cursor:pointer" @click.stop="conversation.infoText = ''"></span>
                <span style="flex:1;margin-left:5px">{{conversation.infoText}}</span>
            </div>
            <div v-show="conversation.errorText" class="chat-info-text">
                <span class="fa fa-times" style="cursor:pointer" @click.stop="conversation.errorText = ''"></span>
                <span class="redText" style="flex:1;margin-left:5px">{{conversation.errorText}}</span>
            </div>
            <div class="bbcode-editor-controls">
                <div v-if="isChannel(conversation) || isPrivate(conversation)" style="margin-right:5px">
                    {{getByteLength(conversation.enteredText)}} / {{conversation.maxMessageLength}}
                </div>
                <ul class="nav nav-pills send-ads-switcher" v-if="isChannel(conversation)"
                    style="position:relative;z-index:10;margin-right:5px">
                    <li class="nav-item">
                        <a href="#" :class="{active: !conversation.isSendingAds, disabled: (conversation.channel.mode != 'both') || (conversation.adManager.isActive())}"
                            class="nav-link" @click.prevent="setSendingAds(false)">{{l('channel.mode.chat')}}</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" :class="{active: conversation.isSendingAds, disabled: (conversation.channel.mode != 'both') || (conversation.adManager.isActive())}"
                            class="nav-link" @click.prevent="setSendingAds(true)">{{adsMode}}</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" :class="{active: conversation.adManager.isActive()}" class="nav-link toggle-autopost" @click="toggleAutoPostAds()">{{l('admgr.toggleAutoPost')}}</a>
                    </li>
                </ul>
                <div class="btn btn-sm btn-primary" v-show="!settings.enterSend" @click="sendButton">{{l('chat.send')}}</div>
            </div>
        </bbcode-editor>
        <command-help ref="helpDialog"></command-help>
        <settings ref="settingsDialog" :conversation="conversation"></settings>
        <logs ref="logsDialog" :conversation="conversation"></logs>
        <manage-channel ref="manageDialog" v-if="isChannel(conversation)" :channel="conversation.channel"></manage-channel>
    </div>
</template>

<script lang="ts">
    import {Component, Hook, Prop, Watch} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {EditorButton, EditorSelection} from '../bbcode/editor';
    import {isShowing as anyDialogsShown} from '../components/Modal.vue';
    import {Keys} from '../keys';
    import {BBCodeView, Editor} from './bbcode';
    import CommandHelp from './CommandHelp.vue';
    import { characterImage, getByteLength, getKey } from "./common";
    import ConversationSettings from './ConversationSettings.vue';
    import core from './core';
    import {Channel, channelModes, Character, Conversation, Settings} from './interfaces';
    import l from './localize';
    import Logs from './Logs.vue';
    import ManageChannel from './ManageChannel.vue';
    import MessageView from './message_view';
    import ReportDialog from './ReportDialog.vue';
    import {isCommand} from './slash_commands';
    import UserView from './user_view';

    @Component({
        components: {
            user: UserView, 'bbcode-editor': Editor, 'manage-channel': ManageChannel, settings: ConversationSettings,
            logs: Logs, 'message-view': MessageView, bbcode: BBCodeView, 'command-help': CommandHelp
        }
    })
    export default class ConversationView extends Vue {
        @Prop({required: true})
        readonly reportDialog!: ReportDialog;
        modes = channelModes;
        descriptionExpanded = false;
        l = l;
        extraButtons: EditorButton[] = [];
        getByteLength = getByteLength;
        tabOptions: string[] | undefined;
        tabOptionsIndex!: number;
        tabOptionSelection!: EditorSelection;
        showSearch = false;
        searchInput = '';
        search = '';
        lastSearchInput = 0;
        messageCount = 0;
        searchTimer = 0;
        messageView!: HTMLElement;
        resizeHandler!: EventListener;
        keydownHandler!: EventListener;
        keypressHandler!: EventListener;
        scrolledDown = true;
        scrolledUp = false;
        ignoreScroll = false;
        adCountdown = 0;
        adsMode = l('channel.mode.ads');
        autoPostingUpdater = 0;
        adAutoPostUpdate: string | null = null;
        adAutoPostNextAd: string | null = null;
        isChannel = Conversation.isChannel;
        isPrivate = Conversation.isPrivate;

        @Hook('mounted')
        mounted(): void {
            this.extraButtons = [{
                title: 'Help\n\nClick this button for a quick overview of slash commands.',
                tag: '?',
                icon: 'fa-question',
                handler: () => (<CommandHelp>this.$refs['helpDialog']).show()
            }];
            window.addEventListener('resize', this.resizeHandler = () => this.keepScroll());
            window.addEventListener('keypress', this.keypressHandler = () => {
                const selection = document.getSelection();
                if((selection === null || selection.isCollapsed) && !anyDialogsShown &&
                    (document.activeElement === document.body || document.activeElement === null || document.activeElement.tagName === 'A'))
                    (<Editor>this.$refs['textBox']).focus();
            });
            window.addEventListener('keydown', this.keydownHandler = ((e: KeyboardEvent) => {
                if(getKey(e) === Keys.KeyF && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                    this.showSearch = true;
                    this.$nextTick(() => (<HTMLElement>this.$refs['searchField']).focus());
                }
            }) as EventListener);
            this.searchTimer = window.setInterval(() => {
                if(Date.now() - this.lastSearchInput > 500 && this.search !== this.searchInput)
                    this.search = this.searchInput;
            }, 500);
            this.messageView = <HTMLElement>this.$refs['messages'];
            this.$watch('conversation.nextAd', (value: number) => {
                const setAdCountdown = () => {
                    const diff = ((<Conversation.ChannelConversation>this.conversation).nextAd - Date.now()) / 1000;
                    if(diff <= 0) {
                        if(this.adCountdown !== 0) window.clearInterval(this.adCountdown);
                        this.adCountdown = 0;
                        this.adsMode = l('channel.mode.ads');
                    } else this.adsMode = l('channel.mode.ads.countdown', Math.floor(diff / 60), Math.floor(diff % 60));
                };
                if(Date.now() < value && this.adCountdown === 0)
                    this.adCountdown = window.setInterval(setAdCountdown, 1000);
                setAdCountdown();
            });

            this.$watch(() => this.conversation.adManager.isActive(), () => (this.refreshAutoPostingTimer()));
            this.refreshAutoPostingTimer();
        }

        @Hook('destroyed')
        destroyed(): void {
            window.removeEventListener('resize', this.resizeHandler);
            window.removeEventListener('keydown', this.keydownHandler);
            window.removeEventListener('keypress', this.keypressHandler);
            clearInterval(this.searchTimer);
            clearInterval(this.autoPostingUpdater);
            clearInterval(this.adCountdown);
        }

        hideSearch(): void {
            this.showSearch = false;
            this.searchInput = '';
        }

        get conversation(): Conversation {
            return core.conversations.selectedConversation;
        }

        get messages(): ReadonlyArray<Conversation.Message | Conversation.SFCMessage> {
            if(this.search === '') return this.conversation.messages;
            const filter = new RegExp(this.search.replace(/[^\w]/gi, '\\$&'), 'i');
            return this.conversation.messages.filter((x) => filter.test(x.text));
        }

        async sendButton(): Promise<void> {
            return this.conversation.send();
        }

        @Watch('conversation')
        conversationChanged(): void {
            if(!anyDialogsShown) (<Editor>this.$refs['textBox']).focus();
            this.$nextTick(() => setTimeout(() => this.messageView.scrollTop = this.messageView.scrollHeight));
            this.scrolledDown = true;
            this.refreshAutoPostingTimer();
        }

        @Watch('conversation.messages')
        messageAdded(newValue: Conversation.Message[]): void {
            this.keepScroll();
            if(!this.scrolledDown && newValue.length === this.messageCount)
                this.messageView.scrollTop -= (this.messageView.firstElementChild!).clientHeight;
            this.messageCount = newValue.length;
        }

        keepScroll(): void {
            if(this.scrolledDown) {
                this.ignoreScroll = true;
                this.$nextTick(() => setTimeout(() => {
                    this.ignoreScroll = true;
                    this.messageView.scrollTop = this.messageView.scrollHeight;
                }, 0));
            }
        }

        onMessagesScroll(): void {
            if(this.ignoreScroll) {
                this.ignoreScroll = false;
                return;
            }
            if(this.messageView.scrollTop < 20) {
                if(!this.scrolledUp) {
                    const firstMessage = this.messageView.firstElementChild;
                    if(this.conversation.loadMore() && firstMessage !== null)
                        this.$nextTick(() => setTimeout(() => this.messageView.scrollTop = (<HTMLElement>firstMessage).offsetTop, 0));
                }
                this.scrolledUp = true;
            } else this.scrolledUp = false;
            this.scrolledDown = this.messageView.scrollTop + this.messageView.offsetHeight >= this.messageView.scrollHeight - 15;
        }

        @Watch('conversation.errorText')
        @Watch('conversation.infoText')
        textChanged(newValue: string, oldValue: string): void {
            if(oldValue.length === 0 && newValue.length > 0) this.keepScroll();
        }

        @Watch('conversation.typingStatus')
        typingStatusChanged(_: string, oldValue: string): void {
            if(oldValue === 'clear') this.keepScroll();
        }

        async onKeyDown(e: KeyboardEvent): Promise<void> {
            const editor = <Editor>this.$refs['textBox'];
            if(getKey(e) === Keys.Tab) {
                if(e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                if(this.conversation.enteredText.length === 0 || this.isConsoleTab) return;
                if(this.tabOptions === undefined) {
                    const selection = editor.getSelection();
                    if(selection.text.length === 0) {
                        const match = /\b[\w]+$/.exec(editor.text.substring(0, selection.end));
                        if(match === null) return;
                        selection.start = match.index < 0 ? 0 : match.index;
                        selection.text = editor.text.substring(selection.start, selection.end);
                        if(selection.text.length === 0) return;
                    }
                    const search = new RegExp(`^${selection.text.replace(/[^\w]/gi, '\\$&')}`, 'i');
                    const c = (<Conversation.PrivateConversation>this.conversation);
                    let options: ReadonlyArray<{character: Character}>;
                    options = Conversation.isChannel(this.conversation) ? this.conversation.channel.sortedMembers :
                        [{character: c.character}, {character: core.characters.ownCharacter}];
                    this.tabOptions = options.filter((x) => search.test(x.character.name)).map((x) => x.character.name);
                    this.tabOptionsIndex = 0;
                    this.tabOptionSelection = selection;
                }
                if(this.tabOptions.length > 0) {
                    const selection = editor.getSelection();
                    if(selection.end !== this.tabOptionSelection.end) return;
                    if(this.tabOptionsIndex >= this.tabOptions.length) this.tabOptionsIndex = 0;
                    const name = this.tabOptions[this.tabOptionsIndex];
                    const userName = (isCommand(this.conversation.enteredText) ? name : `[user]${name}[/user]`);
                    this.tabOptionSelection.end = this.tabOptionSelection.start + userName.length;
                    this.conversation.enteredText = this.conversation.enteredText.substr(0, this.tabOptionSelection.start) + userName +
                        this.conversation.enteredText.substr(selection.end);
                    ++this.tabOptionsIndex;
                }
            } else {
                if(this.tabOptions !== undefined) this.tabOptions = undefined;
                if(getKey(e) === Keys.ArrowUp && this.conversation.enteredText.length === 0
                    && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey)
                    this.conversation.loadLastSent();
                else if(getKey(e) === Keys.Enter) {
                    if(e.shiftKey === this.settings.enterSend) return;
                    e.preventDefault();
                    await this.conversation.send();
                }
            }
        }

        setMode(mode: Channel.Mode): void {
            const conv = (<Conversation.ChannelConversation>this.conversation);
            if(conv.channel.mode === 'both') conv.mode = mode;
        }

        acceptReport(sfc: {callid: number}): void {
            core.connection.send('SFC', {action: 'confirm', callid: sfc.callid});
        }

        setSendingAds(is: boolean): void {
            const conv = (<Conversation.ChannelConversation>this.conversation);
            if(conv.channel.mode === 'both') {
                conv.isSendingAds = is;
                (<Editor>this.$refs['textBox']).focus();
            }
        }

        showLogs(): void {
            (<Logs>this.$refs['logsDialog']).show();
        }

        showSettings(): void {
            (<ConversationSettings>this.$refs['settingsDialog']).show();
        }

        showManage(): void {
            (<ManageChannel>this.$refs['manageDialog']).show();
        }


        isAutopostingAds(): boolean {
            return this.conversation.adManager.isActive();
        }


        stopAutoPostAds(): void {
            this.conversation.adManager.stop();
        }


        renewAutoPosting(): void {
            this.conversation.adManager.renew();

            this.refreshAutoPostingTimer();
        }


        toggleAutoPostAds(): void {
            if(this.isAutopostingAds()) {
                this.stopAutoPostAds();
            } else {
                this.conversation.adManager.start();
            }

            this.refreshAutoPostingTimer();
        }


        refreshAutoPostingTimer() {
            if (this.autoPostingUpdater) {
                window.clearInterval(this.autoPostingUpdater);
            }

            if(this.isAutopostingAds() === false) {
                this.adAutoPostUpdate = null;
                this.adAutoPostNextAd = null;
                return;
            }

            const updateAutoPostingState = () => {
                const adManager = this.conversation.adManager;

                this.adAutoPostNextAd = adManager.getNextAd() || null;

                if(this.adAutoPostNextAd) {
                    const diff = ((adManager.getNextPostDue() || new Date()).getTime() - Date.now()) / 1000;
                    const expDiff = ((adManager.getExpireDue() || new Date()).getTime() - Date.now()) / 1000;

                    const diffMins = Math.floor(diff / 60);
                    const diffSecs = Math.floor(diff % 60);
                    const expDiffMins = Math.floor(expDiff / 60);
                    const expDiffSecs = Math.floor(expDiff % 60);

                    this.adAutoPostUpdate = l(
                        ((adManager.getNextPostDue()) && (!adManager.getFirstPost())) ? 'admgr.postingBegins' : 'admgr.nextPostDue',
                        diffMins,
                        diffSecs
                    ) + l('admgr.expiresIn', expDiffMins, expDiffSecs);
                } else {
                    this.adAutoPostNextAd = null;

                    this.adAutoPostUpdate = l('admgr.noAds');
                }
            };

            this.autoPostingUpdater = window.setInterval(updateAutoPostingState, 1000);

            updateAutoPostingState();
        }

        hasSFC(message: Conversation.Message): message is Conversation.SFCMessage {
            return (<Partial<Conversation.SFCMessage>>message).sfc !== undefined;
        }

        get characterImage(): string {
            return characterImage(this.conversation.name);
        }

        get settings(): Settings {
            return core.state.settings;
        }

        get isConsoleTab(): boolean {
            return this.conversation === core.conversations.consoleTab;
        }

        get isChannelMod(): boolean {
            if(core.characters.ownCharacter.isChatOp) return true;
            const conv = (<Conversation.ChannelConversation>this.conversation);
            const member = conv.channel.members[core.connection.character];
            return member !== undefined && member.rank > Channel.Rank.Member;
        }
    }
</script>

<style lang="scss">
    @import "~bootstrap/scss/functions";
    @import "~bootstrap/scss/variables";
    @import "~bootstrap/scss/mixins/breakpoints";

    #conversation {
        .header {
            @media (min-width: breakpoint-min(md)) {
                margin-right: 32px;
            }
            .btn {
                padding: 2px 5px;
            }
        }

        .send-ads-switcher a {
            padding: 3px 10px;
        }


        .toggle-autopost {
            margin-left: 1px;
        }


        .auto-ads {
            background-color: rgba(255, 128, 32, 0.8);
            padding-left: 10px;
            padding-right: 10px;
            padding-top: 5px;
            padding-bottom: 5px;
            margin: 0;
            position: relative;

            .renew-autoposts {
                display: block;
                float: right;
                /* margin-top: auto; */
                /* margin-bottom: auto; */
                position: absolute;
                /* bottom: 1px; */
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                border-color: rgba(255, 255, 255, 0.5);
                color: rgba(255, 255, 255, 0.9);

                &:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }

                &:active {
                    background-color: rgba(255, 255, 255, 0.6);
                }
            }

            h4 {
                font-size: 1.1rem;
                margin: 0;
                line-height: 100%;
            }

            .update {
                color: rgba(255, 255, 255, 0.6);
                font-size: 13px;
            }

            .next {
                margin-top: 0.5rem;
                color: rgba(255, 255, 255, 0.4);
                font-size: 11px;

                h5 {
                    font-size: 0.8rem;
                    margin: 0;
                    line-height: 100%;
                }
            }

        }

        @media (max-width: breakpoint-max(sm)) {
            .mode-switcher a {
                padding: 5px 8px;
            }
        }
    }

    .chat-info-text {
        display: flex;
        align-items: center;
        flex: 1 51%;
        @media (max-width: breakpoint-max(xs)) {
            flex-basis: 100%;
        }
    }
</style>