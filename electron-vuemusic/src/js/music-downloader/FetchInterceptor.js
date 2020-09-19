class FetchInterceptor {
    constructor() {
        this._fetch = window.fetch;
    }

    start() {
        let originalFetch = this._fetch;
        window.fetch = function () {
            let [url, options] = arguments;

            let interceptUrls = ["https://www.youtube.com"]
            for (let interceptUrl of interceptUrls) {
                if (url.startsWith(interceptUrl)) {
                    console.log("INTERCEPT", url, options);
                    url = 'http://localhost:3000/proxy?url=' + encodeURIComponent(url);
                    break;
                }
            }


            return originalFetch.apply(this, [url, options]);
        };
    }

    stop() {
        window.fetch = this._fetch;
    }
}

export default new FetchInterceptor();