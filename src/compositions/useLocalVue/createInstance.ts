import { Ref, watch } from "@vue/composition-api";
import { RouteNodeTreeData } from "@/types";
import { pipe } from "fp-ts/lib/pipeable";
import { fromNullable, map, getOrElse } from "fp-ts/lib/Option";
import { VueConstructor } from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Worker from "worker-loader!./cloneObject.worker";
import {
  nodeDataConverterFactory,
  nodeRenderFactory
} from "@sterashima/vue-component-render";
import { toNodeTree } from "./converter";

const converter = nodeDataConverterFactory(nodeData => {
  const directives = nodeData.data?.directives || [];
  const domProps = nodeData.data?.domProps || [];
  return {
    tag: nodeData.tag,
    data: {
      ...nodeData.data,
      directives: [
        ...directives,
        {
          name: "web-builder"
        }
      ],
      domProps: {
        ...domProps,
        draggable: true
      }
    }
  };
});
const rendererFactory = nodeRenderFactory(converter);

const pathToRoute = (
  Vue: VueConstructor<Vue>,
  rendererFactory: ReturnType<typeof nodeRenderFactory>,
  converter: typeof toNodeTree,
  store: { node: RouteNodeTreeData }
) => (path: string) => ({
  path,
  component: Vue.extend({
    render(h) {
      const renderer = rendererFactory(h);
      return renderer(converter(store.node[path]));
    }
  })
});

export const createVue = (
  selector: string,
  nodeData: Ref<RouteNodeTreeData>,
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
  const worker = new Worker();
  const store: { node: RouteNodeTreeData } = Vue.observable({
    node: nodeData.value
  });
  worker.onmessage = (event: any) => {
    store.node = event.data;
  };
  worker.postMessage(nodeData.value);
  watch(nodeData, () => worker.postMessage(nodeData.value), {
    immediate: true
  });
  const CustomVue = VueOption ? Vue.extend(VueOption) : Vue;
  const toRouteByPath = pathToRoute(Vue, rendererFactory, toNodeTree, store);
  const routes: RouteConfig[] = Object.keys(store.node).map(toRouteByPath);
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
    addRoute: (path: string) => router.addRoutes([toRouteByPath(path)])
  };
};
