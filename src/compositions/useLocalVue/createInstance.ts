import { Ref, watchEffect } from "@vue/composition-api";
import { NodeData, RouteNodeTreeData } from "@/types";
import { pipe } from "fp-ts/es6/pipeable";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import { VueConstructor, VNode, CreateElement } from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Worker from "worker-loader!./cloneObject.worker";

type Renderer = (h: CreateElement, node: NodeData) => VNode;

export const createVue = (
  selector: string,
  nodeData: Ref<RouteNodeTreeData>,
  renderNode: (h: CreateElement, node: NodeData) => VNode,
  Vue: VueConstructor<Vue>,
  Router: typeof VueRouter,
  VueOption: any | undefined
) => {
  const renderer: Renderer = (h, node) => renderNode(h, node);

  const components = pipe(
    fromNullable(Vue as any),
    map(i => i.options),
    map(i => i.components),
    map(i => Object.keys(i)),
    getOrElse(() => [] as string[])
  );
  const worker = new Worker();
  const store: { node: RouteNodeTreeData } = Vue.observable({
    node: nodeData.value
  });
  worker.onmessage = (event: any) => {
    store.node = event.data;
  };
  worker.postMessage(nodeData.value);
  watchEffect(() => worker.postMessage(nodeData.value));
  const CustomVue = VueOption ? Vue.extend(VueOption) : Vue;
  const routes: RouteConfig[] = Object.keys(store.node).map(path => ({
    path,
    component: Vue.extend({
      render(h) {
        return renderer(h, store.node[path]);
      }
    })
  }));
  const router = new Router({ routes });
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
    router,
    addRoute(path: string) {
      router.addRoutes([
        {
          path,
          component: Vue.extend({
            render(h) {
              return renderer(h, store.node[path]);
            }
          })
        }
      ]);
    }
  };
};
