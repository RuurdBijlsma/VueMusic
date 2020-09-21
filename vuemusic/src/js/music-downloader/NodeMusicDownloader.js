import path from 'path';
import ffbinaries from "ffbinaries";
import fs from "fs";
import child_process from "child_process";
import fileNamify from 'filenamify';
import MusicDownloader from "./MusicDownloader";

export default class NodeMusicDownloader extends MusicDownloader {
    constructor(musicDir = './', filesDir = './', tempDir = './') {
        super();

        this.directories = {
            music: musicDir,
            files: filesDir,
            temp: tempDir,
        }

        this.ffmpegPath = null;
        this.downloadingFfmpeg = false;
    }

    async isTrackOffline(track) {
        let fileName = fileNamify(this.getSearchString(track));
        let filePath = path.join(this.directories.music, fileName + '.mp3');
        if (await this.fileExists(filePath)) {
            return filePath;
        }
        return false;
    }

    async removeCached(track) {
        let fileName = fileNamify(this.getSearchString(track));
        let filePath = path.join(this.directories.music, fileName + '.mp3');
        if (await this.fileExists(filePath)) {
            await this.deleteFile(filePath);
            console.warn(`Deleted cache ${filePath} for`, track);
            return true;
        }
        return false;
    }

    async downloadTrack(url, track, progress = () => 0, abortSignal = null) {
        abortSignal.addEventListener('abort', () => progress('Cancelled'));

        let fileName = fileNamify(this.getSearchString(track));

        let downloadedTrackFile = path.join(this.directories.temp, fileName);
        progress('Downloading');
        await this.downloadFile(url, downloadedTrackFile, abortSignal);
        progress('Processing metadata');
        let processedFile = await this.ffmpegProcessing(track, downloadedTrackFile, () => 0, abortSignal);
        progress('Done');
        console.log("Downloaded track and converted to mp3 ✔", processedFile);
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
        let imageFile = path.join(this.directories.temp, `image-${baseFileName}.jpg`);
        if (hasImage)
            await this.downloadFile(track.album.images[0].url, imageFile, abortSignal);

        let outputFile = path.join(this.directories.temp, baseFileName + '.mp3');
        await this.ffmpegMetadata(trackInputFile, outputFile, hasImage ? imageFile : '', tags, abortSignal);

        return new Promise((resolve, reject) => {
            let destinationFile = path.join(this.directories.music, baseFileName + '.mp3');
            fs.rename(outputFile, destinationFile, err => {
                this.deleteFile(trackInputFile).then();
                if (hasImage)
                    this.deleteFile(imageFile).then();
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
            if (await this.fileExists(fileOutput))
                await this.deleteFile(fileOutput);
            await this.waitForFileUnlock(fileInput);
            await this.waitForFileUnlock(coverImageFile);
            await this.waitForFileUnlock(ffmpegPath);

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
            if (this.downloadingFfmpeg)
                return this.once('downloadFFMPEG', resolve);

            this.downloadingFfmpeg = true;
            ffbinaries.downloadBinaries(['ffmpeg'], {destination: this.directories.files}, () => {
                this.ffmpegPath = path.join(this.directories.files, ffbinaries.getBinaryFilename('ffmpeg', ffbinaries.detectPlatform()))
                resolve(this.ffmpegPath);
                this.emit('downloadFFMPEG');
                this.downloadingFfmpeg = false;
            });
        });

    }
}