import MusicDownloader from "./MusicDownloader";
import FetchInterceptor from "./FetchInterceptor";
import XMLHttpRequestInterceptor from "./XMLHttpRequestInterceptor";

export default class BrowserMusicDownloader extends MusicDownloader {
    constructor() {
        super();
        this.cacheName = 'vue-music';
        FetchInterceptor.start();
        XMLHttpRequestInterceptor.start();
    }

    async isTrackOffline(track) {
        let trackString = this.getSearchString(track);
        const cacheStorage = await caches.open('vue-music');
        let response = await cacheStorage.match(trackString);
        if (response === undefined)
            return false;
        let blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    async downloadTrack(url, track, progress = () => 0, abortSignal = null) {
        progress('Downloading');
        let trackString = this.getSearchString(track);
        let res = await fetch(url, {signal: abortSignal});

        const cacheStorage = await caches.open(this.cacheName);
        await cacheStorage.put(trackString, res);
        progress('Done');
    }
}