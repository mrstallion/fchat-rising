<template>
    <div class="bbcode-editor" style="display:flex;flex-wrap:wrap;justify-content:flex-end">
        <slot></slot>
        <a tabindex="0" class="btn btn-light bbcode-btn btn-sm" role="button" @click="showToolbar = true" @blur="showToolbar = false"
            style="border-bottom-left-radius:0;border-bottom-right-radius:0" v-if="hasToolbar">
            <i class="fa fa-code"></i>
        </a>
        <div class="bbcode-toolbar btn-toolbar" role="toolbar" :style="showToolbar ? {display: 'flex'} : undefined" @mousedown.stop.prevent
            v-if="hasToolbar" style="flex:1 51%">
            <div class="btn-group" style="flex-wrap:wrap">
                <div class="btn btn-light btn-sm" v-for="button in buttons" :title="button.title" @click.prevent.stop="apply(button)">
                    <i :class="(button.class ? button.class : 'fa ') + button.icon"></i>
                </div>
                <div @click="previewBBCode" class="btn btn-light btn-sm" :class="preview ? 'active' : ''"
                    :title="preview ? 'Close Preview' : 'Preview'">
                    <i class="fa fa-eye"></i>
                </div>
            </div>
            <button type="button" class="close" aria-label="Close" style="margin-left:10px" @click="showToolbar = false">&times;</button>
        </div>
        <div class="bbcode-editor-text-area" style="order:100;width:100%;">
            <textarea ref="input" v-model="text" @input="onInput" v-show="!preview" :maxlength="maxlength" :placeholder="placeholder"
                :class="finalClasses" @keyup="onKeyUp" :disabled="disabled" @paste="onPaste" @keypress="$emit('keypress', $event)"
                :style="hasToolbar ? {'border-top-left-radius': 0} : undefined" @keydown="onKeyDown"></textarea>
            <textarea ref="sizer"></textarea>
            <div class="bbcode-preview" v-show="preview">
                <div class="bbcode-preview-warnings">
                    <div class="alert alert-danger" v-show="previewWarnings.length">
                        <li v-for="warning in previewWarnings">{{warning}}</li>
                    </div>
                </div>
                <div class="bbcode" ref="preview-element"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Hook, Prop, Watch} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {getKey} from '../chat/common';
    import {Keys} from '../keys';
    import {BBCodeElement, CoreBBCodeParser, urlRegex} from './core';
    import {defaultButtons, EditorButton, EditorSelection} from './editor';
    import {BBCodeParser} from './parser';

    @Component
    export default class Editor extends Vue {
        @Prop
        readonly extras?: EditorButton[];

        @Prop({default: 1000})
        readonly maxlength!: number;

        @Prop
        readonly classes?: string;

        @Prop
        readonly value?: string | undefined;

        @Prop
        readonly disabled?: boolean;

        @Prop
        readonly placeholder?: string;

        @Prop({default: true})
        readonly hasToolbar!: boolean;

        @Prop({default: false, type: Boolean})
        readonly invalid!: boolean;

        preview = false;
        previewWarnings: ReadonlyArray<string> = [];
        previewResult = '';
        // tslint:disable-next-line: no-unnecessary-type-assertion
        text: string = (this.value !== undefined ? this.value : '') as string;
        element!: HTMLTextAreaElement;
        sizer!: HTMLTextAreaElement;
        maxHeight!: number;
        minHeight!: number;
        showToolbar = false;

        protected parser!: BBCodeParser;
        protected defaultButtons = defaultButtons;

        private isShiftPressed = false;
        private undoStack: string[] = [];
        private undoIndex = 0;
        private lastInput = 0;
        //tslint:disable:strict-boolean-expressions
        private resizeListener!: () => void;

        @Hook('created')
        created(): void {
            // console.log('EDITOR', 'created');
            this.parser = new CoreBBCodeParser();
            this.resizeListener = () => {
                const styles = getComputedStyle(this.element);
                this.maxHeight = parseInt(styles.maxHeight, 10) || 250;
                this.minHeight = parseInt(styles.minHeight, 10) || 60;
            };
        }

        @Hook('mounted')
        mounted(): void {
            // console.log('EDITOR', 'mounted');
            this.element = <HTMLTextAreaElement>this.$refs['input'];
            const styles = getComputedStyle(this.element);
            this.maxHeight = parseInt(styles.maxHeight, 10) || 250;
            this.minHeight = parseInt(styles.minHeight, 10) || 60;
            setInterval(() => {
                if(Date.now() - this.lastInput >= 500 && this.text !== this.undoStack[0] && this.undoIndex === 0) {
                    if(this.undoStack.length >= 30) this.undoStack.pop();
                    this.undoStack.unshift(this.text);
                }
            }, 500);
            this.sizer = <HTMLTextAreaElement>this.$refs['sizer'];
            this.sizer.style.cssText = styles.cssText;
            this.sizer.style.height = '0';
            this.sizer.style.minHeight = '0';
            this.sizer.style.overflow = 'hidden';
            this.sizer.style.position = 'absolute';
            this.sizer.style.top = '0';
            this.sizer.style.visibility = 'hidden';
            this.resize();
            window.addEventListener('resize', this.resizeListener);
        }

        //tslint:enable

        @Hook('destroyed')
        destroyed(): void {
            // console.log('EDITOR', 'destroyed');
            window.removeEventListener('resize', this.resizeListener);
        }

        get finalClasses(): string | undefined {
            let classes = this.classes;
            if(this.invalid)
                classes += ' is-invalid';
            return classes;
        }

        get buttons(): EditorButton[] {
            const buttons = this.defaultButtons.slice();
            if(this.extras !== undefined)
                for(let i = 0, l = this.extras.length; i < l; i++)
                    buttons.push(this.extras[i]);
            return buttons;
        }

        @Watch('value')
        watchValue(newValue: string): void {
            this.$nextTick(() => this.resize());
            if(this.text === newValue) return;
            this.text = newValue;
            this.lastInput = 0;
            this.undoIndex = 0;
            this.undoStack = [];
        }

        getSelection(): EditorSelection {
            const length = this.element.selectionEnd - this.element.selectionStart;
            return {
                start: this.element.selectionStart,
                end: this.element.selectionEnd,
                length,
                text: this.element.value.substr(this.element.selectionStart, length)
            };
        }

        replaceSelection(replacement: string): string {
            const selection = this.getSelection();
            const start = this.element.value.substr(0, selection.start) + replacement;
            const end = this.element.value.substr(selection.end);
            this.element.value = start + end;
            this.element.dispatchEvent(new Event('input'));
            return start + end;
        }

        setSelection(start: number, end?: number): void {
            if(end === undefined)
                end = start;
            this.element.focus();
            this.element.setSelectionRange(start, end);
        }

        applyText(startText: string, endText: string): void {
            const selection = this.getSelection();
            if(selection.length > 0) {
                const replacement = startText + selection.text + endText;
                this.text = this.replaceSelection(replacement);
                this.setSelection(selection.start, selection.start + replacement.length);
            } else {
                const start = this.text.substr(0, selection.start) + startText;
                const end = endText + this.text.substr(selection.start);
                this.text = start + end;
                this.$nextTick(() => this.setSelection(start.length));
            }
            this.$emit('input', this.text);
        }

        apply(button: EditorButton): void {
            // Allow emitted variations for custom buttons.
            this.$once('insert', (startText: string, endText: string) => this.applyText(startText, endText));
            // noinspection TypeScriptValidateTypes
            if(button.handler !== undefined) {
                // tslint:ignore-next-line:no-any
                return button.handler.call(this as any, this);
            }
            if(button.startText === undefined)
                button.startText = `[${button.tag}]`;
            if(button.endText === undefined)
                button.endText = `[/${button.tag}]`;

            const ebl = button.endText ? button.endText.length : 0;
            const sbl = button.startText ? button.startText.length : 0;

            if(this.text.length + sbl + ebl > this.maxlength) return;
            this.applyText(button.startText || '', button.endText || '');
            this.lastInput = Date.now();
        }

        onInput(): void {
            if(this.undoIndex > 0) {
                this.undoStack = this.undoStack.slice(this.undoIndex);
                this.undoIndex = 0;
            }
            this.$emit('input', this.text);
            this.lastInput = Date.now();
        }

        onKeyDown(e: KeyboardEvent): void {
            const key = getKey(e);
            if((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
                if(key === Keys.KeyZ) {
                    e.preventDefault();
                    if(this.undoIndex === 0 && this.undoStack[0] !== this.text) this.undoStack.unshift(this.text);
                    if(this.undoStack.length > this.undoIndex + 1) {
                        this.text = this.undoStack[++this.undoIndex];
                        this.$emit('input', this.text);
                        this.lastInput = Date.now();
                    }
                } else if(key === Keys.KeyY) {
                    e.preventDefault();
                    if(this.undoIndex > 0) {
                        this.text = this.undoStack[--this.undoIndex];
                        this.$emit('input', this.text);
                        this.lastInput = Date.now();
                    }
                }
                for(const button of this.buttons)
                    if(button.key === key) {
                        e.stopPropagation();
                        e.preventDefault();
                        this.apply(button);
                        break;
                    }
            } else if(e.shiftKey) this.isShiftPressed = true;
            this.$emit('keydown', e);
        }

        onKeyUp(e: KeyboardEvent): void {
            if(!e.shiftKey) this.isShiftPressed = false;
            this.$emit('keyup', e);
        }

        resize(): void {
            this.sizer.style.fontSize = this.element.style.fontSize;
            this.sizer.style.lineHeight = this.element.style.lineHeight;
            this.sizer.style.width = `${this.element.offsetWidth}px`;
            this.sizer.value = this.element.value;
            this.element.style.height = `${Math.max(Math.min(this.sizer.scrollHeight, this.maxHeight), this.minHeight)}px`;
            this.sizer.style.width = '0';
        }

        onPaste(e: ClipboardEvent): void {
            const data = e.clipboardData!.getData('text/plain');
            if(!this.isShiftPressed && urlRegex.test(data)) {
                e.preventDefault();
                this.applyText(`[url=${data}]`, '[/url]');
            }
        }

        focus(): void {
            this.element.focus();
        }

        previewBBCode(): void {
            this.doPreview();
        }

        protected doPreview(): void {
            const targetElement = <HTMLElement>this.$refs['preview-element'];
            if(this.preview) {
                this.preview = false;
                this.previewWarnings = [];
                this.previewResult = '';
                const previewElement = (<BBCodeElement>targetElement.firstChild);
                // noinspection TypeScriptValidateTypes
                if(previewElement.cleanup !== undefined) previewElement.cleanup();
                if(targetElement.firstChild !== null) targetElement.removeChild(targetElement.firstChild);
            } else {
                this.preview = true;
                this.parser.storeWarnings = true;
                targetElement.appendChild(this.parser.parseEverything(this.text));
                this.previewWarnings = this.parser.warnings;
                this.parser.storeWarnings = false;
            }
        }
    }
</script>
