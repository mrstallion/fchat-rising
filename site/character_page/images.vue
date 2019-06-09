<template>
<!--    <div class="character-images row">-->
    <div class="character-images">
        <div v-show="loading" class="alert alert-info">Loading images.</div>
        <template v-if="!loading">
            <img :src="imageUrl(image)" :title="image.description" class="character-image" v-for="image in images" :key="image.id">

<!--            <div class="character-image col-6 col-sm-12 col-md-12" v-for="image in images" :key="image.id">-->
<!--                <img :src="imageUrl(image)" :title="image.description">-->
<!--            </div>-->
<!--                -->

<!--                <a :href="imageUrl(image)" target="_blank" @click="handleImageClick($event, image)">-->
<!--                    <img :src="thumbUrl(image)" :title="image.description">-->
<!--                </a>-->
<!--            </div>-->
        </template>
        <div v-if="!loading && !images.length" class="alert alert-info">No images.</div>
        <div class="image-preview" v-show="previewImage" @click="previewImage = ''">
            <img :src="previewImage"/>
            <div class="modal-backdrop show"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from '@f-list/vue-ts';
    import Vue from 'vue';
    import {CharacterImage} from '../../interfaces';
    import * as Utils from '../utils';
    import {methods} from './data_store';
    import {Character} from './interfaces';

    @Component
    export default class ImagesView extends Vue {
        @Prop({required: true})
        private readonly character!: Character;
        @Prop()
        private readonly usePreview?: boolean;
        private shown = false;
        previewImage = '';
        images: CharacterImage[] = [];
        loading = true;
        error = '';

        imageUrl = (image: CharacterImage) => methods.imageUrl(image);
        thumbUrl = (image: CharacterImage) => methods.imageThumbUrl(image);

        async show(): Promise<void> {
            if(this.shown) return;
            try {
                this.error = '';
                this.shown = true;
                this.loading = true;
                this.images = await methods.imagesGet(this.character.character.id);
            } catch(e) {
                this.shown = false;
                if(Utils.isJSONError(e))
                    this.error = <string>e.response.data.error;
                Utils.ajaxError(e, 'Unable to load images.');
            }
            this.loading = false;
        }

        handleImageClick(e: MouseEvent, image: CharacterImage): void {
            if(this.usePreview) {
                this.previewImage = methods.imageUrl(image);
                e.preventDefault();
            }
        }
    }
</script>