import Vue from 'vue';
import Vuex from 'vuex';
import Emitter from '../util/Emitter';
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
});
store.subscribe((mutation, state) => {
  Emitter.$emit('update:vuex', {mutation, state})
})
export default store
