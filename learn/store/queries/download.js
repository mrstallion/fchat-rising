(() => {
    const conn = indexedDB.open('flist-ascending-profiles', 1);

    conn.onsuccess = (e) => {
        const db = e.target.result;
        const txn = db.transaction('profiles', 'readonly');
        const store = txn.objectStore('profiles');
        const cursorReq = store.openCursor();
        const records = [];

        cursorReq.onsuccess = (ce) => {
            const cursor = ce.target.result;

            if (!cursor) {
                return;
            }

            records.push(cursor.value);
            cursor.continue();
        };

        txn.oncomplete = (te) => {
            console.log('Found', records.length, 'records to download');
            const blob = new Blob([JSON.stringify(records)], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const el = document.createElement('a');
            const d = new Date();

            el.href = url;
            el.download = `flist-profile-cache-${d.toISOString()}.json`;

            document.body.appendChild(el);

            el.click();

            setTimeout(
                () => {
                    document.body.removeChild(el);
                    window.URL.revokeObjectURL(url);
                },
                0
            );


            // const a = records.length;
            // debugger;
        };
    };
})();

