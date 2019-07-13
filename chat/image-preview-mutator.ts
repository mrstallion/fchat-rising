/* tslint:disable:quotemark */

import * as _ from 'lodash';
import * as urlHelper from 'url';


import { domain as extractDomain } from '../bbcode/core';

export interface PreviewMutator {
    match: string | RegExp;
    injectJs: string;

    urlMutator?(url: string): string;
}

export interface ImagePreviewMutatorCollection {
    [key: string]: PreviewMutator;
}


export class ImagePreviewMutator {
    // tslint:disable: prefer-function-over-method
    private hostMutators: ImagePreviewMutatorCollection = {};
    private regexMutators: PreviewMutator[] = [];
    private debug: boolean;

    constructor(debug: boolean) {
        this.init();

        this.debug = debug;
    }

    setDebug(debug: boolean): void {
        this.debug = debug;
    }


    mutateUrl(url: string): string {
        const mutator = this.matchMutator(url);

        if ((!mutator) || (!mutator.urlMutator))
            return url;

        return mutator.urlMutator(url);
    }


    getMutatorJsForSite(url: string): string | undefined {
        let mutator = this.matchMutator(url);

        if (!mutator)
            mutator = this.hostMutators['default'];

        return this.wrapJs(mutator.injectJs) + this.getReShowMutator();
    }

    matchMutator(url: string): PreviewMutator | undefined {
        const urlDomain = extractDomain(url);

        if (!urlDomain)
            return;

        if (urlDomain in this.hostMutators)
            return this.hostMutators[urlDomain];

        return _.find(
            this.regexMutators,
            (m: PreviewMutator) => {
                const match = m.match;

                return (match instanceof RegExp) ? (urlDomain.match(match) !== null) : (match === urlDomain);
            }
        );
    }

    protected wrapJs(mutatorJs: string): string {
        return `(() => { try { ${mutatorJs} } catch (err) { console.error('Mutator error', err); } })();`;
    }

    protected add(domain: string | RegExp, mutatorJs: string, urlMutator?: (url: string) => string): void {
        if (domain instanceof RegExp) {
            this.regexMutators.push(
                {
                    match: domain,
                    injectJs: mutatorJs,
                    urlMutator
                }
            );

            return;
        }

        this.hostMutators[domain] = {
            match: domain,
            injectJs: mutatorJs,
            urlMutator
        };
    }

    protected init(): void {
        this.add('default', this.getBaseJsMutatorScript('#video, #image, video, img'));
        this.add('e621.net', this.getBaseJsMutatorScript('#image, video'));
        this.add('e-hentai.org', this.getBaseJsMutatorScript('#img, video'));
        this.add('gelbooru.com', this.getBaseJsMutatorScript('#image, video'));
        this.add('chan.sankakucomplex.com', this.getBaseJsMutatorScript('#image, video'));
        this.add('danbooru.donmai.us', this.getBaseJsMutatorScript('#image, video'));
        this.add('gfycat.com', this.getBaseJsMutatorScript('video'));
        this.add('gfycatporn.com', this.getBaseJsMutatorScript('video'));
        this.add('youtube.com', this.getBaseJsMutatorScript('video'));
        this.add('instantfap.com', this.getBaseJsMutatorScript('#post img, #post video'));
        this.add('webmshare.com', this.getBaseJsMutatorScript('video'));
        this.add('pornhub.com', this.getBaseJsMutatorScript('.mainPlayerDiv video, .photoImageSection img'));
        this.add('sex.com', this.getBaseJsMutatorScript('.image_frame img, .image_frame video'));
        this.add('redirect.media.tumblr.com', this.getBaseJsMutatorScript('picture img, picture video'));
        this.add('i.imgur.com', this.getBaseJsMutatorScript('video, img'));
        this.add('postimg.cc', this.getBaseJsMutatorScript('#main-image, video'));
        this.add('gifsauce.com', this.getBaseJsMutatorScript('video'));
        this.add('motherless.com', this.getBaseJsMutatorScript('.content video, .content img'));
        this.add(/^media[0-9]\.giphy\.com$/, this.getBaseJsMutatorScript('video, img[alt]'));

        // tslint:disable max-line-length
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


        this.add(
            'hentai-foundry.com',
            this.getBaseJsMutatorScript('main video, main img'),
            (url: string): string => {
                const u = urlHelper.parse(url, true);

                if (!u)
                    return url;

                // tslint:disable-next-line no-any
                (u.query as any).enterAgree = 1;

                delete u.search;

                return urlHelper.format(u);
            }
        );
    }

    getBaseJsMutatorScript(elSelector: string, skipElementRemove: boolean = false): string {
        return `const body = document.querySelector('body');
            let selected = Array.from(document.querySelectorAll('${elSelector}'))
                .filter((i) => ((i.width !== 1) && (i.height !== 1)));

            const img = selected.shift();

            ${this.debug ? `console.log('Selector', '${elSelector}'); console.log('Selected', selected); console.log('Img', img);` : ''}

            if (!img) { return; }

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
                + 'top: 0 !important; left: 0 !important; position: absolute !important';

            img.style = 'object-position: top left !important; object-fit: contain !important;'
                + 'width: 100% !important; height: 100% !important; opacity: 1 !important;'
                + 'margin: 0 !imporant; border: 0 !important; padding: 0 !important;';

            img.class = '';
            el.class = '';

            ${this.debug ? "console.log('Wrapper', el);" : ''}

            if (img.play) { img.muted = true; img.play(); }

            let removeList = [];
            const safeIds = ['flistWrapper', 'flistError', 'flistHider'];

            body.childNodes.forEach((el) => ((safeIds.indexOf(el.id) < 0) ? removeList.push(el) : true));

            ${skipElementRemove ? '' : 'removeList.forEach((el) => el.remove());'}
            removeList = [];
        `;
    }

    getErrorMutator(code: number, description: string): string {
        const errorHtml = `
            <div id="flistError" style="
                width: 100% !important;
                height: 100% !important;
                background-color: black !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 200000 !important;
                margin: 0 !important;
                padding: 0 !important;
                line-height: 100% !important;
                border: 0 !important;
                opacity: 1 !important;
                text-align: center !important;
            "><h1 style="
                color: #FF4444 !important;
                font-size: 45pt !important;
                margin: 0 !important;
                margin-top: 10pt !important;
                line-height: 100% !important;
                padding: 0 !important;
                border: 0 !important;
                background: none !important;
                font-family: Helvetica, Arial, sans-serif !important;
                font-weight: bold !important;
            ">${code}</h1><p style="
                max-width: 400px !important;
                color: #ededed !important;
                display: inline-block !important;
                font-size: 15pt !important;
                font-family: Helvetica, Arial, sans-serif !important;
                font-weight: 300 !important;
                border: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                margin-top: 5pt !important;
                line-height: 130% !important;
            ">${description}</p></div>
        `;

        return this.injectHtmlJs(errorHtml);
    }

    protected injectHtmlJs(html: string): string {
        return this.wrapJs(`
            const range = document.createRange();

            range.selectNode(document.body);

            const error = range.createContextualFragment(\`${html}\`);

            document.body.appendChild(error);
        `);
    }

    getHideMutator(): string {
        return this.injectHtmlJs(`
            <div id="flistHider" style="
                width: 100% !important;
                height: 100% !important;
                background-color: black !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 300000 !important;
                margin: 0 !important;
                padding: 0 !important;
                line-height: 100% !important;
                border: 0 !important;
                opacity: 1 !important;
                text-align: center !important;
            "></div>
        `) + this.wrapJs(
            `
                window.__flistUnhide = () => {
                    const elements = document.querySelectorAll('#flistHider');

                    if (elements) {
                        elements.forEach( (el) => el.remove() );
                    }
                };
            `
        );
    }

    getReShowMutator(): string {
        return this.wrapJs(
            `
            const elements = document.querySelectorAll('#flistHider');

            if (elements) {
                elements.forEach( (el) => el.remove() );
            }
            `
        );
    }
}
