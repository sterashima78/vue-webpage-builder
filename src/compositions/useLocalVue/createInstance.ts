import { Ref, watch } from "@vue/composition-api";
import { RouteNodeTreeData } from "@/types";
import { pipe } from "fp-ts/lib/pipeable";
import { fromNullable, map, getOrElse } from "fp-ts/lib/Option";
import { VueConstructor } from "vue";
import VueRouter, { RouteConfig, Route } from "vue-router";
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

const getComponentsFromVue = (Vue: VueConstructor<Vue>) =>
  pipe(
    fromNullable(Vue as any),
    map(i => i.options),
    map(i => i.components),
    map(i => Object.keys(i)),
    getOrElse(() => [] as string[])
  );

const getNewPath = (before: string[], after: string[]) => {
  if (before.length === after.length) return "";
  if (before.length > after.length) return "";
  const diff = after.filter(i => !before.includes(i));
  return diff.length === 0 ? "" : diff[0];
};

const updateRoute = (
  worker: Worker,
  router: VueRouter,
  toRouteByPath: ReturnType<typeof pathToRoute>
) => (
  now: RouteNodeTreeData | undefined,
  before: RouteNodeTreeData | undefined
) => {
  if (now === undefined) return;
  worker.postMessage(now);
  if (before === undefined) return;
  const addedPath = getNewPath(Object.keys(before), Object.keys(now));
  if (addedPath === "") return;
  router.addRoutes([toRouteByPath(addedPath)]);
};

const routing = (router: VueRouter) => (path: string | undefined) => {
  if (path === undefined || path === router.currentRoute.path) return;
  router.push({ path });
};

export const createVue = (
  selector: string,
  nodeData: Ref<RouteNodeTreeData>,
  Vue: VueConstructor<Vue>,
  Router: typeof VueRouter,
  VueOption: any | undefined,
  currentRoute: Ref<string>
) => {
  const store = Vue.observable<{ node: RouteNodeTreeData }>({
    node: nodeData.value
  });
  const toRouteByPath = pathToRoute(Vue, rendererFactory, toNodeTree, store);

  const routes: RouteConfig[] = Object.keys(store.node).map(toRouteByPath);
  const router = new Router({ routes });
  watch(currentRoute, routing(router));
  router.afterEach((to: Route) => {
    currentRoute.value = to.path;
  });

  const worker = new Worker();
  worker.onmessage = (event: any) => (store.node = event.data);
  watch(nodeData, updateRoute(worker, router, toRouteByPath), {
    immediate: true
  });

  const CustomVue = VueOption ? Vue.extend(VueOption) : Vue;
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
    components: getComponentsFromVue(Vue)
  };
};
