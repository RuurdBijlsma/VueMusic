module.exports = {
    "pluginOptions": {
        "electronBuilder": {
            "nodeIntegration": true,
            "experimentalNativeDepCheck": true,
            "externals": ['express']
        }
    },
    "transpileDependencies": [
        "vuetify"
    ],
    publicPath: '/vuemusic',
    pwa: {
        name: 'Vue Music',
        themeColor: '#ef2d46',
        msTileColor: "#ef2d46",
        manifestOptions: {
            "name": "Vue Music",
            "short_name": "Vue Music",
            "start_url": "./",
            "display": "standalone",
            "background_color": "#1b1b1c",
            "theme_color": "#ef2d46",
            "description": "Stream tracks from Spotify™",
            "icons": [
                {
                    "src": "img/icons/favicon-16x16.png",
                    "sizes": "16x16",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/apple-touch-icon-76x76.png",
                    "sizes": "76x76",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/favicon-32x32.png",
                    "sizes": "32x32",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/msapplication-icon-144x144.png",
                    "sizes": "144x144",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/android-chrome-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/android-chrome-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ]
        },
    }
}