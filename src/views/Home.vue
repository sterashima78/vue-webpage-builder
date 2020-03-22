<template>
  <div style="height: 100%">
    <v-app-bar color="deep-purple accent-4" dense dark>
      <v-toolbar-title>Vue Webpage Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <ComponentTreeDialog>
        <template #activator="{ toggle }">
          <v-btn icon @click="toggle">
            <v-icon>format_list_bulleted</v-icon>
          </v-btn>
        </template>
      </ComponentTreeDialog>
      <ComponentSelectorDialog
        :components="components"
        @select="dragTag = $event"
      >
        <template #activator="{ toggle }">
          <v-btn icon @click="toggle">
            <v-icon>view_quilt</v-icon>
          </v-btn>
        </template>
      </ComponentSelectorDialog>

      <SettingDialog
        :code="inlineScript"
        :scripts="scripts"
        :styles="styles"
        @add:script="addScript"
        @add:style="addStyle"
        @remove:script="removeScript"
        @remove:style="removeStyle"
        @update:js="inlineScript = $event"
      >
        <template #activator="{ open }">
          <v-btn icon @click="open">
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
      </SettingDialog>
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-file-multiple-outline</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="route in allRoute"
            :key="route"
            :style="{ background: currentRoute === route ? '#eee' : '' }"
            :disabled="currentRoute === route"
            @click="routing.push({ path: route })"
          >
            <v-list-item-content>
              <v-list-item-title v-text="route" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
      <FileMenu>
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on">
            <v-icon>insert_drive_file</v-icon>
          </v-btn>
        </template>
      </FileMenu>
    </v-app-bar>
    <div style="display:flex;width:100%;height: calc(100% - 50px)">
      <VueCanvas @loaded="loaded" />
    </div>
  </div>
</template>

<script lang="ts">
import ElementEditor from "@/components/ElementEditor.vue";
import ComponentSelectorDialog from "@/components/ComponentSelectorDialog.vue";
import SettingDialog from "@/components/SettingDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import VueCanvas from "@/components/VueCanvas.vue";
import ComponentTreeDialog from "@/components/ComponentTreeDialog.vue";
import { defineComponent, ref, computed } from "@vue/composition-api";
import { useLocalVue, IframeWindow } from "@/compositions/useLocalVue/";
import { useState } from "@/compositions/useNodeState/";
import { useHtml } from "@/compositions/useHtml";

export default defineComponent({
  name: "Home",
  components: {
    ElementEditor,
    ComponentSelectorDialog,
    SettingDialog,
    FileMenu,
    VueCanvas,
    ComponentTreeDialog
  },
  setup() {
    const {
      scripts,
      styles,
      scriptsSrc,
      cssLinks,
      body,
      inlineScript,
      stylesStr
    } = useHtml();
    const { init, currentRoute } = useLocalVue();
    const { dragTag, nodeTree } = useState();
    const allRoute = computed(() => Object.keys(nodeTree.value));
    const components = ref<string[]>([]);
    const routing: any = ref({
      push() {
        console.log("not init");
      }
    });
    return {
      allRoute,
      currentRoute,
      routing,
      scriptsSrc,
      cssLinks,
      inlineScript,
      stylesStr,
      loaded: async (w: IframeWindow) => {
        const { components: c, router } = await init(w);
        console.log("reload");
        components.value = c;
        routing.value = router;
      },
      body,
      components,
      dragTag,
      addStyle: ({ url, name }: { url: string; name: string }) => {
        styles.value.push({ url, name });
      },
      addScript: ({ url, name }: { url: string; name: string }) => {
        scripts.value.push({ url, name });
      },
      removeStyle: (key: string) => {
        styles.value = styles.value.filter(({ name }) => name !== key);
      },
      removeScript: (key: string) => {
        scripts.value = scripts.value.filter(({ name }) => name !== key);
      },
      scripts,
      styles
    };
  }
});
</script>
