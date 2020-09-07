import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: false,
        themes: {
            dark: {
                primary: '#ef2d46',
                foreground: '#ffffff',
                primarySeek: '#c9c9c9',
                navBackground: '#1b1b1c',
                primaryLight: '#2a2a2b',
                secondary: '#de901a',
            },
            light: {
                primary: '#e7474c',
                foreground: '#1a1a1a',
                primarySeek: '#e7474c',
                navBackground: '#ffffff',
                primaryLight: '#f1efef',
                secondary: '#ffcf84',
            },
        },
    }
});
