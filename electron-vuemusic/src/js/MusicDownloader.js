import EventEmitter from "events";
import ytdl from 'ytdl-core';
import search from "youtube-search";
import os from 'os'
import path from 'path';
import ffbinaries from "ffbinaries";
import fs from "fs";
import child_process from "child_process";
import Directories from "./Directories";
import fileNamify from 'filenamify';

export default class MusicDownloader extends EventEmitter {
    constructor(browser = false) {
        super();
        console.log(Directories)

        this.apiKey = null;
        this.browser = browser;
        this.ffmpegPath = null;
        this.downloadingFfmpeg = false;
        this.baseUrl = 'http://www.youtube.com/watch?v=';
        this.ytdlOptions = {
            quality: 'highestaudio',
            filter: 'audioonly',
        };
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

    async* getTrackUrls(track) {
        let offlineUrl = await this.isTrackOffline(track);
        if (offlineUrl)
            yield {local: true, url: offlineUrl};
        let searchTerm = this.getSearchString(track);
        let results = await this.cachedSearch(searchTerm);
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
            for (let format of formats.slice(0, 2)) {
                yield {local: false, url: format.url};
            }
        }
    }

    async isTrackOffline(track) {
        let fileName = fileNamify(this.getSearchString(track));
        let filePath = path.join(Directories.music, fileName + '.mp3');
        if (await this.fileExists(filePath)) {
            return filePath;
        }
        return false;
    }

    async downloadTrack(url, track, progress = () => 0, abortSignal = null) {
        abortSignal.addEventListener('abort', () => progress('Cancelled'));

        let fileName = fileNamify(this.getSearchString(track));

        console.log("Starting download", url);
        let downloadedTrackFile = path.join(Directories.temp, fileName);
        progress('Downloading');
        await this.downloadFile(url, downloadedTrackFile, abortSignal);
        progress('Processing metadata');
        console.log("Downloaded track to", downloadedTrackFile);
        let processedFile = await this.ffmpegProcessing(track, downloadedTrackFile, () => 0, abortSignal);
        progress('Done');
        console.log("FFMPEG done, processed file location", processedFile);
    }

    async ffmpegProcessing(track, trackInputFile, progress = () => 0, abortSignal = null) {
        let baseFileName = path.basename(trackInputFile);
        let tags = {
            title: track.name,
            artist: track.artists.map(a => a.name),
            disc: track.disc_number,
            track: track.track_number,
        };
        if (track.hasOwnProperty('album')) {
            tags.album = track.album.name;
            tags.year = new Date(track.album.release_date).getFullYear();
        }

        let hasImage = track.hasOwnProperty('album') && track.album.images.length > 0;
        let imageFile = path.join(Directories.temp, `image-${baseFileName}.jpg`);
        if (hasImage)
            await this.downloadFile(track.album.images[0].url, imageFile, abortSignal);

        let outputFile = path.join(Directories.temp, baseFileName + '.mp3');
        console.log("Adding metadata to", trackInputFile, 'output file:', outputFile);
        await this.ffmpegMetadata(trackInputFile, outputFile, hasImage ? imageFile : '', tags, abortSignal);

        return new Promise((resolve, reject) => {
            let destinationFile = path.join(Directories.music, baseFileName + '.mp3');
            fs.rename(outputFile, destinationFile, err => {
                console.log("Deleting ", trackInputFile)
                this.deleteFile(trackInputFile).then();
                if (hasImage) {
                    console.log("Deleting ", imageFile)
                    this.deleteFile(imageFile).then();
                }
                resolve(destinationFile)
            });
        });
    }

    async downloadFile(url, destinationFile, abortSignal = null) {
        let res = await fetch(url, {signal: abortSignal});
        let blob = await res.blob();
        let writer = fs.createWriteStream(destinationFile);
        writer.write(Buffer.from(await blob.arrayBuffer()));
    }

    async ffmpegMetadata(fileInput, fileOutput, coverImageFile, tags, abortSignal = null) {
        return new Promise(async (resolve, reject) => {
            let ffmpegPath = await this.getFfmpegPath();
            let command;
            if (coverImageFile) {
                command = `${ffmpegPath} -y -i "${fileInput}" -i "${coverImageFile}"` +
                    ` -map 0:0 -map 1:0 -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (Front)" ` +
                    `${this.tagsToString(tags)} "${fileOutput}"`;
            } else {
                command = `${ffmpegPath} -y -i "${fileInput}"` +
                    `${this.tagsToString(tags)} "${fileOutput}"`;
            }
            console.log("Waiting for files to unlock");
            if (await this.fileExists(fileOutput))
                await this.deleteFile(fileOutput);
            await this.waitForFileUnlock(fileInput);
            await this.waitForFileUnlock(coverImageFile);
            await this.waitForFileUnlock(ffmpegPath);
            console.log("All files seem unlocked and the output file doesn't exist, starting ffmpeg with command", {command});
            if (!abortSignal.aborted) {
                let process = child_process.exec(command, (error, stdout, stderr) => {
                    if (error)
                        return reject(error);
                    resolve({err: stderr, out: stdout});
                });
                abortSignal.addEventListener('abort', () => process.kill());
            }

        })
    }

    tagsToString(tags) {
        let result = [];
        for (let tag in tags)
            if (tags.hasOwnProperty(tag))
                if (tags[tag] instanceof Array)
                    for (let part of tags[tag])
                        result.push(`-metadata ${tag}="${part}"`);
                else
                    result.push(`-metadata ${tag}="${tags[tag]}"`);
        return result.join(' ');
    }

    async deleteFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }

    async fileExists(filePath) {
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.F_OK, err => {
                if (err)
                    resolve(false)
                resolve(true);
            });
        });
    }

    async waitSleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitForFileUnlock(filePath, timeout = 10000) {
        let startTime = performance.now();
        while (true) {
            if (performance.now() > startTime + timeout)
                throw "Timeout waiting for file to unlock";
            let isFileLocked = await this.isFileLocked(filePath);
            if (!isFileLocked)
                return true;
            await this.waitSleep(250);
        }
    }

    async isFileLocked(filePath) {
        return new Promise((resolve, reject) => {
            fs.open(filePath, 'r+', (err, fd) => {
                if (err && err.code === 'EBUSY') {
                    resolve(true);
                } else if (err && err.code === 'ENOENT') {
                    reject("File does not exist");
                } else {
                    fs.close(fd, err => {
                        if (err)
                            return reject(err);
                        resolve(false);
                    })
                }
            });
        })
    }

    async getFfmpegPath() {
        return new Promise(async (resolve, reject) => {
            if (this.ffmpegPath)
                return resolve(this.ffmpegPath);
            if (this.downloadingFfmpeg) {
                console.log("Waiting for ffmpeg download to finish");
                return this.once('downloadFFMPEG', resolve);
            }

            this.downloadingFfmpeg = true;
            ffbinaries.downloadBinaries(['ffmpeg'], {destination: Directories.files}, () => {
                this.ffmpegPath = path.join(Directories.files, ffbinaries.getBinaryFilename('ffmpeg', ffbinaries.detectPlatform()))
                resolve(this.ffmpegPath);
                this.emit('downloadFFMPEG');
                this.downloadingFfmpeg = false;
            });
        });

    }
}