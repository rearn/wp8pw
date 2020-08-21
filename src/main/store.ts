import Vue from 'vue';
import Vuex from 'vuex';
import AxiosDigest from 'axios-digest';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    List: '',
    Sitekey: '',
    Recaptcha: {},
    digest: {
      user: '',
      password: '',
    },
    digestAxios: {},
  },
  mutations: {
    setAboutTitle(state, list) {
      state.List = list;
    },
    setRecaptchaSitekey(state, data) {
      state.Recaptcha = data;
    },
    setDigestUser(state, data) {
      if (state.digest.user !== data.user
        || state.digest.password !== data.password) {
        state.digest = data;
        if (state.digest.user === '') {
          state.digestAxios = {};
          return;
        }
        state.digestAxios = new AxiosDigest(
          state.digest.user,
          state.digest.password,
        );
      }
    },
  },
  actions: {
    async getListAsync({ commit }) {
      if (this.state.digest.user !== '') {
        const data = await (this.state.digestAxios as AxiosDigest)
          .get('/api/master/v1/content')
          .then((r) => r.data)
          .catch((err) => {
            this.dispatch('digestUserCreate', { user: '', password: '' });
            throw err;
          });
        commit('setAboutTitle', data);
      }
    },
    async getRecaptchaSitekeyAsync({ commit }) {
      commit(
        'setRecaptchaSitekey',
        await axios.get('/api/v1/recaptcha.json').then((r) => r.data),
      );
    },
    saveDigest() {
      if (this.state.digest.user === '') {
        sessionStorage.removeItem('digest');
        return;
      }
      sessionStorage.setItem('digest', JSON.stringify(this.state.digest));
    },
    loadDigest({ commit }) {
      const ssDigest = sessionStorage.getItem('digest');
      if (ssDigest !== null) {
        commit('setDigestUser', JSON.parse(ssDigest));
      }
    },
    digestUserCreate({ commit }, data) {
      commit('setDigestUser', data);
      this.dispatch('saveDigest');
    },
  },
});
