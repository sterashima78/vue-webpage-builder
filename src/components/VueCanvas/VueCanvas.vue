<template>
  <VIframeSandbox
    :body="body"
    style="width:100%;height:100%"
    :script="script"
    :scriptsSrc="scriptsSrc"
    :styles="styles"
    :cssLinks="cssLinks"
    @loaded="loaded"
  />
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VueRouter from "vue-router";
import { initialize, RouteNodes } from "./compositions";

export type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
  VueRouter: typeof VueRouter;
  router?: VueRouter;
};
import { defineComponent, PropType, toRef } from "@vue/composition-api";
import { VIframeSandbox } from "vue-iframe-sandbox";
import { pipe } from "fp-ts/lib/pipeable";
import { fromNullable, map, getOrElse } from "fp-ts/lib/Option";

const getComponentsFromVue = (Vue: VueConstructor<Vue>) =>
  pipe(
    fromNullable(Vue as any),
    map(i => i.options),
    map(i => i.components),
    map(i => Object.keys(i)),
    getOrElse(() => [] as string[])
  );

export default defineComponent({
  props: {
    body: {
      type: String as PropType<string>,
      default: ""
    },
    script: {
      type: String as PropType<string>,
      default: ""
    },
    styles: {
      type: String as PropType<string>,
      default: ""
    },
    scriptsSrc: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    cssLinks: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    installer: {
      type: Function as PropType<(Vue: VueConstructor<Vue>) => void>,
      default: () => undefined
    },
    nodes: {
      type: Object as PropType<RouteNodes>,
      default: () => ({})
    },
    path: {
      type: String as PropType<string>,
      default: ""
    }
  },
  components: {
    VIframeSandbox
  },
  setup(props, { emit }) {
    const nodes = toRef(props, "nodes");
    const path = toRef(props, "path");
    const loaded = (w: IframeWindow) => {
      if (w.Vue === undefined) return setTimeout(() => loaded(w), 100);
      props.installer(w.Vue);
      emit("update:components", getComponentsFromVue(w.Vue));
      const vm = initialize("#main-wrapper")(
        w.Vue,
        w.VueOption,
        w.VueRouter,
        nodes,
        path
      );
      w.vm = vm;
      w.dispatchEvent(new Event("createdVue"));
      console.log("reload");

      // emit("loaded", {
      //   Vue: w.Vue,
      //   Router: w.VueRouter,
      //   VueOptopn: w.VueOption,
      //   setVM: (vm: Vue) => (w.vm = vm),
      //   dispatch: () => w.dispatchEvent(new Event("createdVue")),
      // });
    };
    return {
      loaded
    };
  }
});
</script>
