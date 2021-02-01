import MusicDownloader from "./MusicDownloader";
import FetchInterceptor from "./FetchInterceptor";
import XMLHttpRequestInterceptor from "./XMLHttpRequestInterceptor";
import config from './config'

export default class BrowserMusicDownloader extends MusicDownloader {
    constructor() {
        super();
        this.cacheName = 'vue-music';
        FetchInterceptor.start();
        XMLHttpRequestInterceptor.start();
    }

    async getYtdlInfo(id) {
        // sadly we must move ytdl to the server, because the IP of the ytdl requester has to match the client requesting it
        let response = await fetch(config.api + '/ytdl?id=' + id, {method: "POST"});
        return await response.json();
    }

    async removeCached(track) {
        let trackString = this.getSearchString(track);
        const cacheStorage = await caches.open(this.cacheName);
        console.warn(`Deleted cache ${trackString} for`, track);
        return await cacheStorage.delete(trackString);
    }

    async isTrackOffline(track) {
        let trackString = this.getSearchString(track);
        const cacheStorage = await caches.open(this.cacheName);
        let response = await cacheStorage.match(trackString);
        if (response === undefined)
            return false;
        let blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    async downloadTrack(url, track, progress = () => 0, abortSignal = null) {
        progress('Downloading');
        let trackString = this.getSearchString(track);
        try {
            let res = await fetch(url, {signal: abortSignal});
            const cacheStorage = await caches.open(this.cacheName);
            await cacheStorage.put(trackString, res);
            progress('Downloaded');
        } catch (e) {
            return progress('Failed');
        }
    }
}