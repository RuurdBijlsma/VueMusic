import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: false,
        themes: {
            dark: {
                primary: '#ef2d46',
                primaryLight: '#2a2a2b',
                secondary: '#de901a',
            },
            light: {
                primary: '#e7474c',
                primaryLight: '#f1efef',
                secondary: '#ffcf84',
            },
        },
    }
});
