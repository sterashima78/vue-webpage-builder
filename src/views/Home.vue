<template>
  <div style="height: 100%">
    <v-app-bar color="deep-purple accent-4" dense dark>
      <v-toolbar-title>Vue Webpage Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <ComponentTreeDialog />
      <ComponentSelectorDialog
        :components="components"
        @select="dragTag = $event"
      />
      <PageMenu
        :addRoute="addLocalRoute"
        :currentRoute="currentRoute"
        :routing="routing"
      />
      <ViewPortMenu @update="wrapperStyle = $event" />
      <SettingDialog />
      <PreviewDialog />
      <FileMenu />
    </v-app-bar>
    <div class="canvas-wrapper">
      <div :style="wrapperStyle" style="background: white;">
        <VueCanvas @loaded="loaded" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
import { useLocalVue, IframeWindow } from "@/compositions/useLocalVue/";
import { useState } from "@/compositions/useNodeState/";
import { nodeDao } from "@/infrastructure/nodes";
import { aliasDao } from "@/infrastructure/alias";
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
    const { init } = useLocalVue();
    const { dragTag, currentRoute } = useState(nodeDao, aliasDao);
    const components = ref<string[]>([]);
    const routing: any = ref({
      push() {
        console.log("not init");
      }
    });
    const addLocalRoute: Ref<(path: string) => void> = ref(() => console.log());
    const wrapperStyle = ref({});
    return {
      wrapperStyle,
      currentRoute,
      addLocalRoute,
      routing,
      loaded: async (w: IframeWindow) => {
        const { components: c, router, addRoute } = await init(w);
        console.log("reload");
        components.value = c;
        routing.value = router;
        addLocalRoute.value = addRoute;
      },
      components,
      dragTag
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
