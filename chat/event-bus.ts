import Vue from 'vue';

export interface EventBusEvent {
    // tslint:disable: no-any
    [key: string]: any;
}

export const EventBus = new Vue();

