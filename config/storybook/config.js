/* eslint-disable import/no-extraneous-dependencies */
import { configure, addDecorator  } from '@storybook/vue'

const req = require.context('../../src/stories', true, /.stories.js$/)

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";

Vue.use(Vuetify, {
  iconfont: "md"
});

addDecorator(() => ({
  template: "<v-app><story/></v-app>"
}));

configure(loadStories, module)
