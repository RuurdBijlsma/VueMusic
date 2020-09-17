import electron from 'electron';
import fs from 'fs';
import path from 'path';

class Directories {
    constructor() {
        this.temp = this.initializeDir('temp', 'vuemusic');
        this.files = this.initializeDir('appData', 'vuemusic');
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
}

export default new Directories();