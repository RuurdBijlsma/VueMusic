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
}