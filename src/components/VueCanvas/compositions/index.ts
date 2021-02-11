import {
  NodeTree,
  NodeData,
  nodeDataConverterFactory,
  nodeRenderFactory
} from "@sterashima/vue-component-render";
import { Ref, toRaw, watch } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import VueRouter, { RouteConfig, Route } from "vue-router";
import { klona as clone } from "klona/json";
export type RouteNodes = {
  [path: string]: NodeTree;
};

type LocalNodeState = {
  node: RouteNodes;
};

const preprocess = () => (nodeData: NodeData) => {
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
};

const converter = nodeDataConverterFactory(preprocess());
const rendererFactory = nodeRenderFactory(converter);

const createInstance = (
  Vue: VueConstructor<Vue>,
  VueOption: any,
  router: VueRouter,
  selector: string
) => {
  const CustomVue = VueOption ? Vue.extend(VueOption) : Vue;
  return new CustomVue({
    el: selector,
    router,
    template: `
        <div style="height: calc(100% - 15px);">
          <router-view></router-view>
        </div>
      `
  });
};

const pathToRoute = (
  Vue: VueConstructor<Vue>,
  rendererFactory: ReturnType<typeof nodeRenderFactory>,
  store: LocalNodeState
) => (path: string) => ({
  path,
  component: Vue.extend({
    render(h) {
      const renderer = rendererFactory(h);
      return renderer(store.node[path]);
    }
  })
});

const toRouteByPathFactory = (
  store: LocalNodeState,
  Vue: VueConstructor<Vue>
) => pathToRoute(Vue, rendererFactory, store);

const routing = (router: VueRouter) => (path: string | undefined) => {
  if (path === undefined || path === router.currentRoute.path) return;
  router.push({ path });
};

const createRoute = (
  Vue: VueConstructor<Vue>,
  store: LocalNodeState,
  Router: typeof VueRouter
) => {
  const routes: RouteConfig[] = Object.keys(store.node).map(
    toRouteByPathFactory(store, Vue)
  );
  const router = new Router({ routes });
  return router;
};

const getNewPath = (before: string[], after: string[]) => {
  if (before.length === after.length) return "";
  if (before.length > after.length) return "";
  const diff = after.filter(i => !before.includes(i));
  return diff.length === 0 ? "" : diff[0];
};

const updateRoute = (
  router: VueRouter,
  toRouteByPath: ReturnType<typeof pathToRoute>,
  store: LocalNodeState
) => (now: RouteNodes | undefined, before: RouteNodes | undefined) => {
  if (now === undefined) return;
  store.node = clone(now);
  if (before === undefined) return;
  const addedPath = getNewPath(Object.keys(before), Object.keys(now));
  if (addedPath === "") return;
  router.addRoutes([toRouteByPath(addedPath)]);
};

export const initialize = (selector: string) => (
  Vue: VueConstructor<Vue>,
  VueOption: any,
  Router: typeof VueRouter,
  nodes: Ref<RouteNodes>,
  currentRoute: Ref<string>
) => {
  // local state
  const store = Vue.observable<LocalNodeState>({
    node: toRaw(nodes.value)
  });
  // routing
  const router = createRoute(Vue, store, Router);
  watch(currentRoute, routing(router));
  router.afterEach((to: Route) => {
    currentRoute.value = to.path;
  });

  watch(nodes, updateRoute(router, toRouteByPathFactory(store, Vue), store), {
    immediate: true
  });
  // local instance
  return createInstance(Vue, VueOption, router, selector);
};
