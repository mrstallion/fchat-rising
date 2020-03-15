import { ImagePreviewHelper } from './helper';

export class LocalImagePreviewHelper extends ImagePreviewHelper {
    hide(): void {
        this.visible = false;
        this.url = null;
    }


    show(url: string): void {
        this.visible = true;
        this.url = url;
    }


    match(domainName: string): boolean {
        return ((domainName === 'f-list.net') || (domainName === 'static.f-list.net'));
    }


    renderStyle(): Record<string, any> {
        return this.isVisible()
            ? { backgroundImage: `url(${this.getUrl()})`, display: 'block' }
            : { display: 'none' };
    }
}

