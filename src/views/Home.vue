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
      <SettingDialog />
      <PageMenu
        :addRoute="addLocalRoute"
        :currentRoute="currentRoute"
        :routing="routing"
      />
      <FileMenu />
    </v-app-bar>
    <div style="display:flex;width:100%;height: calc(100% - 50px)">
      <VueCanvas @loaded="loaded" />
    </div>
  </div>
</template>

<script lang="ts">
import ElementEditor from "@/components/ElementEditor.vue";
import PageMenu from "@/components/PageMenu.vue";
import ComponentSelectorDialog from "@/components/ComponentSelectorDialog.vue";
import SettingDialog from "@/components/SettingDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import VueCanvas from "@/components/VueCanvas.vue";
import ComponentTreeDialog from "@/components/ComponentTreeDialog.vue";
import { defineComponent, ref, Ref } from "@vue/composition-api";
import { useLocalVue, IframeWindow } from "@/compositions/useLocalVue/";
import { useState } from "@/compositions/useNodeState/";

export default defineComponent({
  name: "Home",
  components: {
    PageMenu,
    ElementEditor,
    ComponentSelectorDialog,
    SettingDialog,
    FileMenu,
    VueCanvas,
    ComponentTreeDialog
  },
  setup() {
    const { init } = useLocalVue();
    const { dragTag, currentRoute } = useState();
    const components = ref<string[]>([]);
    const routing: any = ref({
      push() {
        console.log("not init");
      }
    });
    const addLocalRoute: Ref<(path: string) => void> = ref(() => console.log());
    return {
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
