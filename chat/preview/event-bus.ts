import Vue from 'vue';
import { Character } from '../../site/character_page/interfaces';
import { Message } from '../common';
import { Conversation } from '../interfaces';
import ChannelConversation = Conversation.ChannelConversation;
import { NoteCheckerCount } from '../../site/note-checker';

/**
 * 'imagepreview-dismiss': {url: string}
 * 'imagepreview-show': {url: string}
 * 'imagepreview-toggle-stickyness': {url: string}
 * 'character-data': {character: Character}
 * 'character-score': {character: Character, score: number}
 * 'private-message': {message: Message}
 * 'channel-ad': {message: Message, channel: Conversation, profile: ComplexCharacter | undefined}
 * 'channel-message': {message: Message, channel: Conversation}
 * 'select-conversation': { conversation: Conversation }
 * 'note-counts-update': {}
 */


export interface EventBusEvent {
    // tslint:disable: no-any
    [key: string]: any;
}

export interface ChannelMessageEvent extends EventBusEvent {
    message: Message;
    channel: ChannelConversation;
}

// tslint:disable-next-line no-empty-interface
export interface ChannelAdEvent extends ChannelMessageEvent {}

export interface CharacterDataEvent {
    character: Character;
}


export interface SelectConversationEvent extends EventBusEvent {
    conversation: Conversation;
}


// tslint:disable-next-line no-empty-interface
export interface NoteCountsUpdate extends EventBusEvent, NoteCheckerCount {}


export const EventBus = new Vue();

