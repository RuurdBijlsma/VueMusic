import electron from 'electron';
import fs from 'fs';
import path from 'path';

class Directories {
    constructor() {
        this.temp = this.initializeDir('temp', 'vuemusic');
        this.files = this.initializeDir('appData', 'vuemusic-files');
        this.music = this.getDir('music', '');
    }

    initializeDir(base, dir) {
        let fullDir = this.getDir(base, dir);
        this.createDir(fullDir);
        return fullDir;
    }

    getDir(base = 'music', dir = 'files') {
        let app = electron.app;
        if (electron.hasOwnProperty('remote'))
            app = electron.remote.app;
        return path.join(app.getPath(base), dir);
    }

    createDir(dir) {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
    }

    importLSFile() {
        let localStorageFile = path.join(this.files, 'localStorage.json');

        if (fs.existsSync(localStorageFile)) {
            let ls = JSON.parse(fs.readFileSync(localStorageFile));
            for (let key in ls)
                if (ls.hasOwnProperty(key))
                    localStorage[key] = ls[key];
        }
    }

    exportLSToFile() {
        let localStorageFile = path.join(this.files, 'localStorage.json');

        let localData = JSON.stringify(localStorage);
        fs.writeFileSync(localStorageFile, localData);
    }
}

export default new Directories();