import ImagePreview from '../ImagePreview.vue';

export * from './external';
export * from './local';

export abstract class ImagePreviewHelper {
    protected visible = false;
    protected url: string | null = 'about:blank';
    protected parent: ImagePreview;
    protected debug: boolean;

    abstract show(url: string): void;
    abstract hide(): void;
    abstract match(domainName: string): boolean;
    abstract renderStyle(): Record<string, any>;

    constructor(parent: ImagePreview) {
        if (!parent) {
            throw new Error('Empty parent!');
        }

        this.parent = parent;
        this.debug = parent.debug;
    }

    isVisible(): boolean {
        return this.visible;
    }

    getUrl(): string | null {
        return this.url;
    }

    setDebug(debug: boolean): void {
        this.debug = debug;
    }
}

