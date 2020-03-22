import { Ref, watch } from "@vue/composition-api";
import { NodeData } from "@/types";
import { pipe } from "fp-ts/es6/pipeable";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import clone from "lodash.clonedeep";
import { VueConstructor, VNode, CreateElement } from "vue";
import VueRouter from "vue-router";
new VueRouter();
export const createVue = (
  selector: string,
  nodeData: Ref<NodeData>,
  renderNode: (h: CreateElement, node: NodeData) => VNode,
  Vue: VueConstructor<Vue>,
  Router: typeof VueRouter,
  VueOption: any | undefined
) => {
  const components = pipe(
    fromNullable(Vue as any),
    map(i => i.options),
    map(i => i.components),
    map(i => Object.keys(i)),
    getOrElse(() => [] as string[])
  );
  const store = Vue.observable({ node: clone(nodeData.value) });
  watch(nodeData, v => (store.node = clone(v)));
  const CustomVue = VueOption ? Vue.extend(VueOption) : Vue;
  const router = new Router({
    routes: [
      {
        path: "/",
        component: Vue.extend({
          render(h) {
            return renderNode(h, store.node);
          }
        })
      },
      {
        path: "/hoge",
        component: Vue.extend({
          template: `
            <router-link to="/" v-text="'to home'" />
          `
        })
      }
    ]
  });
  return {
    vm: new CustomVue({
      el: selector,
      router,
      template: `
        <div style="height: calc(100% - 15px);">
          <router-view></router-view>
        </div>
      `
    }),
    components,
    router
  };
};
