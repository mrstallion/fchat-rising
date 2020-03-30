
// tslint:disable-next-line
export class PornhubIntegration {

  static preprocess(): string {
    return `
      const phCreateElement = (html) => {
        const range = document.createRange();

        range.selectNode(document.body);

        const el = range.createContextualFragment(html);

        document.body.appendChild(el);
      }

      const phGifImg = document.querySelector('[data-mp4],[data-webm],[data-gif]');

      if (phGifImg) {
        const phGifVideoUrl = phGifImg.dataset.mp4 || phGifImg.dataset.webm;

        if (phGifVideoUrl) {
          phCreateElement(\`<video src="\${phGifVideoUrl}" id="__flistCore"></video>\`);
        }

        const phGifUrl = phGifImg.dataset.gif;

        if (phGifUrl) {
          phCreateElement(\`<img src="\${phGifUrl}" id="__flistCore" />\`);
        }
      }
    `;
  }


  static postprocess(): string {
    return `
        document.addEventListener('load', (event) => {
            const phVideo = document.querySelector('video');

            console.log('LOAD LOAD', phVideo);

            if (
                (phVideo) && (phVideo.play)
                && ((!phVideo.ended) && (!(phVideo.currentTime > 0)))
            )
            {
              console.log('LOAD PLAYPLAY');

              phVideo.muted = true;
              phVideo.loop = true;
              phVideo.play();
            }
        });

        try {
            const phVideo = document.querySelector('video');

            console.log('TRY TRY', phVideo);

            if (
                (phVideo) && (phVideo.play)
                && ((!phVideo.ended) && (!(phVideo.currentTime > 0)))
            )
            {
              console.log('TRY PLAYPLAY');

              phVideo.muted = true;
              phVideo.loop = true;
              phVideo.play();
            }
        } catch (err) {
            console.error('Failed phVideo.play()', err);
        }
    `;
  }
}
