<template>
    <div class="dropdown" @focusout="blur">
        <a :class="linkClass" aria-haspopup="true" :aria-expanded="isOpen" @click.prevent="isOpen = !isOpen" href="#"
            style="width:100%;text-align:left;align-items:center" role="button" tabindex="-1" ref="button">
            <slot name="title">{{title}}</slot>
        </a>
        <div class="dropdown-menu" ref="menu" @mousedown.prevent.stop @click.prevent.stop="menuClick()">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Watch} from '@f-list/vue-ts';
    import Vue from 'vue';

    @Component
    export default class Dropdown extends Vue {
        isOpen = false;
        @Prop({default: 'btn btn-secondary dropdown-toggle'})
        readonly linkClass!: string;
        @Prop
        readonly keepOpen?: boolean;
        @Prop
        readonly title?: string;

        @Watch('isOpen')
        onToggle(): void {
            const menu = this.$refs['menu'] as HTMLElement;
            if(!this.isOpen) {
                menu.style.cssText = '';
                return;
            }
            menu.style.display = 'block';
            const offset = menu.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.left = offset.right < window.innerWidth ? `${offset.left}px` : `${window.innerWidth - offset.width}px`;
            menu.style.top = (offset.bottom < window.innerHeight) ? `${offset.top}px` :
                `${offset.top - offset.height - (<HTMLElement>this.$el).offsetHeight}px`;
        }

        blur(event: FocusEvent): void {
            let elm = <HTMLElement | null>event.relatedTarget;
            while(elm) {
                if(elm === this.$refs['menu']) return;
                elm = elm.parentElement;
            }
            this.isOpen = false;
        }

        menuClick(): void {
            if(!this.keepOpen) this.isOpen = false;
        }
    }
</script>