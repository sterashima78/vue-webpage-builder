<template>
  <div style="height: 100%">
    <v-app-bar color="deep-purple accent-4" dense dark>
      <img
        width="25px"
        style="margin-right: 20px"
        src="@/../docs/.vuepress/public/logo.png"
      />
      <v-toolbar-title>Vue Webpage Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <ComponentTreeDialog />
      <ComponentSelectorDialog
        :components="components"
        @select="dragTag = $event"
      />
      <PageMenu
        :currentRoute="currentRoute"
        @update:route="currentRoute = $event"
      />
      <ViewPortMenu @update="wrapperStyle = $event" />
      <SettingDialog />
      <PreviewDialog />
      <FileMenu />
    </v-app-bar>
    <div class="canvas-wrapper">
      <div :style="wrapperStyle" style="background: white;">
        <VueCanvas
          :body="body"
          :script="inlineScript"
          :scriptsSrc="scriptsSrc"
          :styles="stylesStr"
          :cssLinks="cssLinks"
          :installer="installer"
          @loaded="loaded"
          @update:components="components = $event"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "@vue/composition-api";
import { useLocalVue } from "@/compositions/useLocalVue/";
import VueRouter from "vue-router";
import Vue, { VueConstructor } from "vue";
import { useState } from "@/compositions/useNodeState/";
import { NodeDaoInjectionKey } from "@/domain/nodes";
import { AliasDaoInjectionKey } from "@/domain/alias";
import { useHtml } from "@/compositions/useHtml";
import { register } from "@/directives";

export default defineComponent({
  name: "Home",
  components: {
    PageMenu: () => import("@/components/PageMenu.vue"),
    ElementEditor: () => import("@/components/ElementEditor.vue"),
    ComponentSelectorDialog: () =>
      import("@/components/ComponentSelectorDialog.vue"),
    SettingDialog: () => import("@/components/SettingDialog.vue"),
    FileMenu: () => import("@/components/FileMenu.vue"),
    VueCanvas: () => import("@/components/VueCanvas.vue"),
    ComponentTreeDialog: () => import("@/components/ComponentTreeDialog.vue"),
    ViewPortMenu: () => import("@/components/ViewPortMenu.vue"),
    PreviewDialog: () => import("@/components/PreviewDialog.vue")
  },
  setup() {
    const nodeDao = inject(NodeDaoInjectionKey);
    const aliasDao = inject(AliasDaoInjectionKey);
    if (!nodeDao || !aliasDao) {
      throw new Error("Dao is not injected");
    }
    const {
      dragTag,
      currentRoute,
      nodeTree,
      hoverNodeId,
      dropNodeId
    } = useState(nodeDao, aliasDao);
    const { init } = useLocalVue(
      nodeTree,
      hoverNodeId,
      dropNodeId,
      currentRoute
    );
    const components = ref<string[]>([]);
    const wrapperStyle = ref({});
    return {
      wrapperStyle,
      currentRoute,
      loaded: ({
        Vue,
        Router,
        VueOption,
        setVM,
        dispatch
      }: {
        Vue: VueConstructor<Vue>;
        Router: typeof VueRouter;
        VueOption: any;
        setVM: (vm: Vue) => void;
        dispatch: () => void;
      }) => {
        init(Vue, Router, VueOption, setVM, dispatch);
        console.log("reload");
      },
      components,
      dragTag,
      ...useHtml(),
      installer: register(nodeDao, aliasDao)
    };
  }
});
</script>
<style lang="scss" scoped>
.canvas-wrapper {
  background: #eee;
  display: flex;
  width: 100%;
  height: calc(100% - 50px);
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
