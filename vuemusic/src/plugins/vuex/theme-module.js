import Utils from "../../js/Utils";
import Vuetify from '../vuetify';

export default {
    state: {
        original: JSON.parse(JSON.stringify(Vuetify.userPreset.theme)),
        color: null,
        fgLegible: true,
    },
    mutations: {
        color: (state, color) => state.color = color,
        fgLegible: (state, fgLegible) => state.fgLegible = fgLegible,
    },
    getters: {
        currentTheme: () => Vuetify.framework.theme,
    },
    actions: {
        async setThemeToItem({getters, dispatch, state}, item) {
            console.log('getter', getters.currentTheme, 'original', state.original)
            let imgUrl = getters.itemImage(item);
            let color = await dispatch('getImageColor', imgUrl);
            await dispatch('applyThemeColor', color);
        },
        async applyThemeColor({commit, state, dispatch, getters}, color) {
            if (color === null || color === undefined)
                return await dispatch('revertThemeColor');

            console.log("Apply", color);
            commit('color', color);
            let {bgLegible, fgLegible} = Utils.isLegible(color, getters.currentTheme);
            if (!bgLegible)
                return await dispatch('revertThemeColor');
            console.log("Applying theme color 🎨", color);
            commit('fgLegible', fgLegible);

            if (getters.currentTheme.isDark) {
                getters.currentTheme.themes.dark.primary = color;
            } else {
                getters.currentTheme.themes.light.primary = color;
                getters.currentTheme.themes.light.primarySeek = color;
            }
        },
        revertThemeColor({commit, getters, state}) {
            commit('fgLegible', true);

            if (getters.currentTheme.isDark) {
                getters.currentTheme.themes.dark.primary = state.original.themes.dark.primary;
            } else {
                getters.currentTheme.themes.light.primary = state.original.themes.light.primary;
                getters.currentTheme.themes.light.primarySeek = state.original.themes.light.primarySeek;
            }
        },
        async leavePage({commit, dispatch}) {
            commit('color', null);
            await dispatch('revertThemeColor');
        },
        getImageColor({dispatch}, imgUrl) {
            return new Promise(resolve => {
                let img = document.createElement('img');
                img.src = imgUrl;
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');
                img.onload = async () => {
                    let width = 20;
                    let height = 20;
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(img, 0, 0, width, height);
                    let bins = {};
                    let imageData = context.getImageData(0, 0, width, height);
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        let color = imageData.data.slice(i, i + 3);
                        let rgb = color.map(c => Math.floor(c / 20))
                        let [h, s, l] = await dispatch('rgbToHsl', rgb);
                        let binKey = rgb.join(',');
                        if (bins[binKey] === undefined)
                            bins[binKey] = {n: 0, color};
                        // console.log(hsl);
                        bins[binKey].n += 1 + (s * (1 - Math.abs(0.5 - l))) * 255;
                    }
                    let values = Object.values(bins);
                    const indexOfMaxValue = values.map(e => e.n).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
                    let [r, g, b] = values[indexOfMaxValue].color;
                    let toHex = c => c.toString(16).padStart(2, '0');
                    resolve('#' + toHex(r) + toHex(g) + toHex(b));
                };
            });
        },
        rgbToHsl({}, rgb) {
            let [r, g, b] = rgb;
            r /= 255, g /= 255, b /= 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0; // achromatic
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return [h, s, l];
        },
    }
}