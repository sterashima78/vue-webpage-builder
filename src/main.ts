import Vue from "vue";
import "./plugins/";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import { register } from "@/directives";
import vuetify from "./plugins/vuetify";
import { NodeDaoInjectionKey } from "@/domain/nodes";
import { AliasDaoInjectionKey } from "@/domain/alias";
import { nodeDao } from "@/infrastructure/nodes";
import { aliasDao } from "@/infrastructure/alias";
import VueAnalytics from "vue-analytics";
Vue.use(VueAnalytics, {
  id: "G-1SHXMWCJW1",
  router
});
register(Vue, nodeDao, aliasDao);
Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: h => h(App),
  provide: {
    [NodeDaoInjectionKey as symbol]: nodeDao,
    [AliasDaoInjectionKey as symbol]: aliasDao
  }
}).$mount("#app");
