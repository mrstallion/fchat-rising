/* tslint:disable:quotemark */

import { domain } from '../bbcode/core';

export interface ImagePreviewMutatorCollection {
    [key: string]: string;
}

export class ImagePreviewMutator {
    private mutators: ImagePreviewMutatorCollection = {};

    constructor() {
        this.init();
    }

    getMutatorJsForSite(url: string): string | undefined {
        const urlDomain = domain(url);

        if (!urlDomain)
            return;

        console.log('Domain is', urlDomain);

        const mutatorJs = this.mutators[urlDomain];

        if (!mutatorJs) {
            return this.mutators['default'];
        }

        return `(() => { try { ${mutatorJs} } catch (err) { console.error(err); } })()`;
    }

    protected add(domain: string, mutatorJs: string) {
        this.mutators[domain] = mutatorJs;
    }

    protected init() {
        this.add('default', this.getBaseJsMutatorScript('#image, #video, img, video'));
        this.add('e621.net', this.getBaseJsMutatorScript('#image, video'));
        this.add('e-hentai.org', this.getBaseJsMutatorScript('#img, video'));
        this.add('gelbooru.com', this.getBaseJsMutatorScript('#image, video'));
        this.add('chan.sankakucomplex.com', this.getBaseJsMutatorScript('#image, video'));
        this.add('danbooru.donmai.us', this.getBaseJsMutatorScript('#image, video'));
        this.add('gfycat.com', this.getBaseJsMutatorScript('video'));
        this.add('gfycatporn.com', this.getBaseJsMutatorScript('video'));
        this.add('www.youtube.com', this.getBaseJsMutatorScript('video'));
        this.add('instantfap.com', this.getBaseJsMutatorScript('#post img, #post video'));
        this.add('www.webmshare.com', this.getBaseJsMutatorScript('video'));

        // this fixes videos only -- images are fine as is
        this.add('i.imgur.com', this.getBaseJsMutatorScript('video'));

        this.add(
            'imgur.com',
            `
                const imageCount = $('.post-container video, .post-container img').length;

                ${this.getBaseJsMutatorScript('.post-container video, .post-container img', true)}

                if(imageCount > 1)
                    $('#flistWrapper').append('<div id="imageCount" style="position: absolute; bottom: 0; right: 0; background: green; border: 2px solid lightgreen; width: 5rem; height: 5rem; font-size: 2rem; font-weight: bold; color: white; border-radius: 5rem; margin: 0.75rem;"><div style="position: absolute; top: 50%; left: 50%; transform: translateY(-50%) translateX(-50%);">+' + (imageCount - 1) + '</div></div>');
            `
        );


        this.add(
            'rule34.xxx',
            `${this.getBaseJsMutatorScript('#image, video')}
                const content = document.querySelector('#content');
                content.remove();
            `
        );
    }

    getBaseJsMutatorScript(imageSelector: string, skipElementRemove = false): string {
        return `const body = document.querySelector('body');
        const img = document.querySelector('${imageSelector}');
        const el = document.createElement('div');
        el.id = 'flistWrapper';
        
        el.style = 'width: 100% !important; height: 100% !important; position: absolute !important;'
            + 'top: 0 !important; left: 0 !important; z-index: 100000 !important;'
            + 'background-color: black !important; background-size: contain !important;'
            + 'background-repeat: no-repeat !important; background-position: top left !important;'
            + 'opacity: 1 !important; padding: 0 !important; border: 0 !important; margin: 0 !important;';
        
        img.remove();
        el.append(img);
        body.append(el);
        body.class = '';
        
        body.style = 'border: 0 !important; padding: 0 !important; margin: 0 !important; overflow: hidden !important;'
            + 'width: 100% !important; height: 100% !important; opacity: 1 !important;'
            + 'top: 0 !important; left: 0 !important;';
        
        img.style = 'object-position: top left !important; object-fit: contain !important;'
            + 'width: 100% !important; height: 100% !important; opacity: 1 !important;'
            + 'margin: 0 !imporant; border: 0 !important; padding: 0 !important;';
        
        img.class = '';
        el.class = '';
        
        if (img.play) { img.muted = true; img.play(); }
        
        
        let removeList = [];
        body.childNodes.forEach((el) => { if(el.id !== 'flistWrapper') { removeList.push(el); } });
        ${skipElementRemove ? '' : 'removeList.forEach((el) => el.remove());'}
        removeList = [];
        `;
    }

}
