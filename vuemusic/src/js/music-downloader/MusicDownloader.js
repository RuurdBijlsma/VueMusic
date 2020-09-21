import EventEmitter from "events";
import ytdl from 'ytdl-core';
import search from "youtube-search";

export default class MusicDownloader extends EventEmitter {
    constructor() {
        super();

        this.apiKey = null;
        this.searchCache = localStorage.getItem('searchCache') === null ?
            {cacheAge: +new Date()} : JSON.parse(localStorage.searchCache);
    }

    waitForApiKey() {
        return new Promise(resolve => {
            if (this.apiKey !== null)
                return resolve();
            let interval;
            interval = setInterval(() => {
                if (this.apiKey !== null) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        })
    }

    getSearchString(track) {
        return `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
    }

    async cachedSearch(term, maxResults = 3) {
        let cacheKey = term + '|' + maxResults.toString();
        if (this.searchCache[cacheKey])
            return this.searchCache[cacheKey];

        if (this.apiKey === null)
            await this.waitForApiKey();

        let {results} = await search(term, {maxResults, key: this.apiKey});
        this.searchCache[cacheKey] = results;
        localStorage.searchCache = JSON.stringify(this.searchCache);
        return results;
    }

    async getYtdlInfo(id) {
        return await ytdl.getInfo(id, {
            quality: 'highestaudio',
            filter: 'audioonly',
        });
    }

    async* getTrackUrls(track) {
        let offlineUrl = await this.isTrackOffline(track);
        if (offlineUrl)
            yield {local: true, url: offlineUrl};
        let searchTerm = this.getSearchString(track);
        let results = await this.cachedSearch(searchTerm);
        let ids = results.map(r => r.id);

        for (let id of ids) {
            let result = await this.getYtdlInfo(id);
            let formats = result.formats;
            let qualities = ["AUDIO_QUALITY_LOW", "AUDIO_QUALITY_MEDIUM", "AUDIO_QUALITY_HIGH"];
            formats = formats
                .sort((a, b) => b.averageBitrate - a.averageBitrate)
                .sort((a, b) => b.audioBitrate - a.audioBitrate)
                .sort((a, b) => b.mimeType.startsWith('audio') - a.mimeType.startsWith('audio'))
                .sort((a, b) => qualities.indexOf(b.audioQuality) - qualities.indexOf(a.audioQuality))
            for (let format of formats.slice(0, 2)) {
                yield {local: false, url: format.url};
            }
        }
    }

    async isTrackOffline(track) {
        throw "Not implemented";
    }

    async removeCached(track) {
        throw "Not implemented";
    }

    async downloadTrack(url, track, progress = () => 0, abortSignal = null) {
        throw "Not implemented";
    }
}