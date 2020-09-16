import EventEmitter from "events";
import ytdl from 'ytdl-core';
import search from "youtube-search";
import path from "path";
const ffBinaries = window.require('ffbinaries');

export default class MusicDownloader extends EventEmitter {
    constructor(browser = false, ffmpegDestination = './') {
        super();
        this.apiKey = null;
        this.browser = browser;
        this.ffmpegBasePath = ffmpegDestination;
        this.ffmpegPath = null;
        this.searchCache = localStorage.getItem('searchCache') === null ?
            {cacheAge: +new Date()} : JSON.parse(localStorage.searchCache);
    }

    getSearchString(track) {
        return `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
    }

    async cachedSearch(term, maxResults = 3) {
        let cacheKey = term + '|' + maxResults.toString();
        if (this.searchCache[cacheKey])
            return this.searchCache[cacheKey];

        let {results} = await search(term, {maxResults, key: this.apiKey});
        this.searchCache[cacheKey] = results;
        localStorage.searchCache = JSON.stringify(this.searchCache);
        return results;
    }

    async* getStreamFormats(track) {
        let searchTerm = this.getSearchString(track);
        let results = await this.cachedSearch(searchTerm);
        console.log(results);
        let ids = results.map(r => r.id);

        for (let id of ids) {
            let result = await ytdl.getInfo(id, {
                quality: 'highestaudio',
                filter: 'audioonly',
            });
            let formats = result.formats;
            let qualities = ["AUDIO_QUALITY_LOW", "AUDIO_QUALITY_MEDIUM", "AUDIO_QUALITY_HIGH"];
            formats = formats
                .sort((a, b) => b.averageBitrate - a.averageBitrate)
                .sort((a, b) => b.audioBitrate - a.audioBitrate)
                .sort((a, b) => b.mimeType.startsWith('audio') - a.mimeType.startsWith('audio'))
                .sort((a, b) => qualities.indexOf(b.audioQuality) - qualities.indexOf(a.audioQuality))
            for (let format of formats.slice(0, 2))
                yield format;
        }
    }

    async isTrackOffline(track){
        throw NotImplementedException();
    }

    async downloadUrl(url) {
        console.log('download', url);
    }

    async getFfmpegPath() {
        return new Promise(resolve => {
            if (this.ffmpegPath)
                return resolve(this.ffmpegPath);
            if (this.downloadingFfmpeg)
                return this.once('downloadedFfmpeg', () => resolve(this.ffmpegPath));

            ffBinaries.downloadBinaries(['ffmpeg'],
                {destination: this.ffmpegBasePath}, () => {
                    this.ffmpegPath = path.join(this.ffmpegBasePath, './ffmpeg');
                    resolve(this.ffmpegPath);
                    this.downloadingFfmpeg = false;
                    this.emit('downloadedFfmpeg');
                });
        });
    }
}