import * as _ from 'lodash';
import Axios from 'axios';

export type UrlSolverCallback = (url: string, match: RegExpMatchArray) => Promise<string>;

export interface UrlSolver {
    matcher: RegExp;
    solver: UrlSolverCallback;
}


export class ImageUrlMutator {

    private solvers: UrlSolver[] = [];

    private static IMGUR_CLIENT_ID = 'd60e27140a73b2e';

    private debug: boolean;


    constructor(debug: boolean) {
        this.debug = debug;

        this.init();
    }

    protected init(): void {
        this.add(
            /^https?:\/\/imgur.com\/gallery\/([a-zA-Z0-9]+)/,
            async(url: string, match: RegExpMatchArray): Promise<string> => {
                // Imgur Gallery
                const galleryId = match[1];

                try {
                    const result = await Axios.get(
                        `https://api.imgur.com/3/gallery/${galleryId}/images`,
                        {
                            headers: {
                                Authorization: `Client-ID ${ImageUrlMutator.IMGUR_CLIENT_ID}`
                            }
                        }
                    );

                    const imageUrl = _.get(result, 'data.data.0.link', null);

                    if (!imageUrl) {
                        return url;
                    }

                    const imageCount = _.get(result, 'data.data.length', 1);

                    if (this.debug)
                        console.log('Imgur gallery', url, imageUrl, imageCount);

                    return `${imageUrl}?flist_gallery_image_count=${imageCount}`;

                } catch (err) {
                    console.error('Imgur Gallery Failure', url, err);
                    return url;
                }
            }
        );

        // must be AFTER gallery test
        this.add(
            /^https?:\/\/imgur.com\/([a-zA-Z0-9]+)/,
            async(url: string, match: RegExpMatchArray): Promise<string> => {
                // Single Imgur Image
                const imageId = match[1];

                try {
                    const result = await Axios.get(
                        `https://api.imgur.com/3/image/${imageId}`,
                        {
                            headers: {
                                Authorization: `Client-ID ${ImageUrlMutator.IMGUR_CLIENT_ID}`
                            }
                        }
                    );

                    const imageUrl = _.get(result, 'data.data.link', url);

                    if (this.debug)
                        console.log('Imgur image', url, imageUrl);

                    return imageUrl as string;
                } catch (err) {
                    console.error('Imgur Image Failure', url, err);
                    return url;
                }
            }
        );
    }


    setDebug(debug: boolean): void {
        this.debug = debug;
    }


    protected add(matcher: RegExp, solver: UrlSolverCallback): void {
        this.solvers.push({matcher, solver});
    }


    async resolve(url: string): Promise<string> {
        const match = _.find(this.solvers, (s: UrlSolver) => url.match(s.matcher)) as (UrlSolver | undefined);

        if (!match) {
            return url;
        }

        return match.solver(url, url.match(match.matcher) as RegExpMatchArray);
    }
}

