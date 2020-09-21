class Database {
    constructor() {
        const request = window.indexedDB.open("vue-music", 1);

        request.onerror = event => console.warn("Could not open indexed DB", event);
        request.onsuccess = event => {
            console.log("opened db", event)
        };
    }
}

export default new Database();