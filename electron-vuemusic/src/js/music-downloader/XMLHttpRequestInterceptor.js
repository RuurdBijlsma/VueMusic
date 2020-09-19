export default class XMLHttpRequestInterceptor {
    constructor() {
        this.options = {
        };
        this.url = '';
        this.readyState = 0;
        this.status = 0;
        this.onreadystatechange = () => {
        };
        this.responseText = '';
    }

    static start() {
        this._XMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = XMLHttpRequestInterceptor;
    }

    static stop() {
        window.XMLHttpRequest = this._XMLHttpRequest;
    }

    async send(postData) {
        this.options.body = postData;
        await this.sendLive();
    }

    async sendLive() {
        let response = await fetch(this.url, this.options);
        this.readyState = 4;
        this.status = response.status;
        this.responseText = await response.text();
        this.onreadystatechange();
    }

    open(type, url) {
        this.options.method = type;
        this.url = url;
    }

    abort(...args) {
        console.info("abort", ...args);
    }

    setRequestHeader(key, value) {
        if (!this.options.hasOwnProperty('headers'))
            this.options.headers = {};
        this.options.headers[key] = value;
    }
}