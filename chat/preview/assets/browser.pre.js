(() => {
    try {
        console.log('RUNNING RUNNING RUNNING', Date.now());
        document.querySelectorAll('iframe').forEach((e) => e.remove());

        window.addEventListener('DOMContentLoaded', (event) => {
            document.querySelectorAll('iframe').forEach((e) => e.remove());
            console.log('DOM fully loaded and parsed', Date.now());
        });
    } catch(e) {
        console.error(e);
    }
})();

