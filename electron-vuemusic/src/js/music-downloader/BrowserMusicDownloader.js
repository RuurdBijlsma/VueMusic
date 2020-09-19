import MusicDownloader from "./MusicDownloader";
import FetchInterceptor from "./FetchInterceptor";
import XMLHttpRequestInterceptor from "./XMLHttpRequestInterceptor";

export default class BrowserMusicDownloader extends MusicDownloader {
    constructor() {
        super();
        FetchInterceptor.start();
        XMLHttpRequestInterceptor.start();
    }

    async isTrackOffline(track) {
        let trackString = this.getSearchString(track);
        //caches stuff
        return false;
    }

    async downloadTrack(url, track, progress = () => 0, abortSignal = null) {
        //fetch stuff with server involved
    }
}