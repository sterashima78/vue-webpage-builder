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
import VueGtag from "vue-gtag";
Vue.use(
  VueGtag,
  {
    config: { id: "UA-96186429-3" }
  },
  router
);
register(nodeDao, aliasDao)(Vue);
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
