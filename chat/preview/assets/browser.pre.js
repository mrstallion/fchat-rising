(() => {
    try {
        const clear = () => {
            if (window.location.href.match(/https?:\/\/(www.)?pornhub.com/)) {
                if (!window.zest) {
                    window.zest = (q) => (document.querySelectorAll(q));
                }

                return;
            }

            try {
                const frameCount = window.frames.length;

                for (let i = 0; i < frameCount; i++) {
                    window.frames[i].location = 'about:blank';
                }
            } catch (e) {
                console.error('Frame location', e);
            }

            try {
                const scriptCount = document.scripts.length;

                for (let i = 0; i < scriptCount; i++) {
                    document.scripts[i].src = 'about:blank';
                }
            } catch (e) {
                console.error('Script location', e);
            }

            try {
                document.querySelectorAll('iframe, script' /*, style, head' */ )
                    .forEach((e) => e.remove());
            } catch (e) {
                console.error('Element remove', e);
            }


            const intervalCount = setInterval(() => {}, 10000);

            for (let i = 0; i <= intervalCount; i++) {
                try {
                    clearInterval(i);
                } catch (e) {
                    console.error('Clear interval', i, e);
                }
            }


            const timeoutCount = setTimeout(() => {}, 10000);

            for (let i = 0; i <= timeoutCount; i++) {
                try {
                    clearTimeout(i);
                } catch (e) {
                    console.error('Clear timeout', i, e);
                }
            }
        };

        console.log('Document loading', Date.now());
        clear();

        // window.stop();

        window.addEventListener('DOMContentLoaded', (event) => {
            console.log('DOM fully loaded and parsed', Date.now());
            clear();
        });
    } catch(e) {
        console.error(e);
    }
})();

