<template>
  <div style="height: 100%">
    <v-app-bar color="deep-purple accent-4" dense dark>
      <v-toolbar-title>Vue Webpage Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="showTree = !showTree">
        <v-icon>format_list_bulleted</v-icon>
      </v-btn>
      <v-btn icon @click="showWindow = !showWindow">
        <v-icon>code</v-icon>
      </v-btn>
      <v-btn icon @click="showSetting = !showSetting">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-app-bar>
    <div style="display:flex;width:100%;height: calc(100% - 50px)">
      <VIframeSandbox
        :body="body"
        style="width:100%;height:100%"
        :script="inlineScript.replace('<br>', '\n')"
        :scriptsSrc="scriptsSrc"
        :styles="stylesStr"
        :cssLinks="cssLinks"
        @loaded="loaded"
      />
    </div>
    <v-dialog v-model="dialog" persistent>
      <ElementEditor
        :findById="findById"
        :editNodeById="editNodeById"
        :editNode="editNode"
        @close="dialog = false"
        @update="setEditTarget(editNode.id)"
      />
    </v-dialog>
    <hsc-window-style-black>
      <hsc-window
        v-show="showTree"
        title="Componet Tree"
        style="background: white;border:1px solid black;"
        :resizable="true"
        :isScrollable="true"
        :minWidth="300"
        :minHeight="300"
        :maxWidth="500"
        :maxHeight="600"
      >
        <v-treeview
          :items="treeNode.children"
          :hoverable="true"
          style="width:100%;height:100%"
        >
          <template slot="label" slot-scope="{ item }">
            <div
              :id="item.id"
              draggable="true"
              style="cursor: move"
              @mouseenter="cancelEvent"
              @mouseover="mouseOver"
              @mouseleave="mouseLeave"
              @dragstart="dragStart"
              @dragleave="dragLeave"
              @dragenter="dragEnter"
              @dragover="cancelEvent"
              @dragend="dragEnd"
              @drop="drop"
            >
              {{ item.name }}
            </div>
          </template>
          <template #append="{ item }">
            <v-icon @click="activeDialog(item.id)">tune</v-icon>
            <v-icon @click="removeNodeById(item.id)">delete</v-icon>
          </template>
        </v-treeview>
      </hsc-window>

      <hsc-window
        v-show="showWindow"
        title="Components"
        style="background: white;border:1px solid black;overflow: hidden;"
        :resizable="true"
        :minWidth="300"
        :minHeight="300"
        :maxWidth="500"
        :maxHeight="600"
      >
        <ComponentSelector
          :components="components"
          @dragStart="dragTag = $event"
        />
      </hsc-window>
    </hsc-window-style-black>
    <v-dialog
      v-model="showSetting"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showSetting = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
        </v-toolbar>
        <ExternalResource
          title="JavaScript"
          :resources="scripts"
          @add="addScript"
          @remove="removeScript"
        />

        <ExternalResource
          title="Style"
          :resources="styles"
          @add="addStyle"
          @remove="removeStyle"
        />
        <v-container>
          <h3>Inline Javascript</h3>
          <div style="height:500px;">
            <ace @change="inlineScript = $event" :code="inlineScript" />
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import "@/plugin";
import ElementEditor from "@/components/ElementEditor.vue";
import ExternalResource from "@/components/ExternalResource.vue";
import ComponentSelector from "@/components/ComponentSelector.vue";
import Ace from "@/components/Ace.vue";
import { isNone } from "fp-ts/lib/Option";
import { VIframeSandbox } from "vue-iframe-sandbox";
import { defineComponent, ref, computed, Ref } from "@vue/composition-api";
import { useLocalVue } from "@/compositions/localVue";
import { Node } from "@/types";
import {
  mouseOver,
  mouseLeave,
  dragStart,
  dragLeave,
  dragEnd,
  dragEnter,
  cancelEvent,
  drop
} from "@/compositions/store";
interface Resource {
  url: string;
  name: string;
}
export default defineComponent({
  name: "Home",
  components: {
    VIframeSandbox,
    ElementEditor,
    ExternalResource,
    ComponentSelector,
    Ace
  },
  setup() {
    const dragTag = ref("");
    const scripts: Ref<Resource[]> = ref([
      {
        name: "element-ui",
        url: "https://unpkg.com/element-ui/lib/index.js"
      }
    ]);
    const styles: Ref<Resource[]> = ref([
      {
        name: "element-ui",
        url: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
      }
    ]);
    const scriptsSrc = computed(() => [
      "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.js",
      ...scripts.value.map(i => i.url)
    ]);
    const cssLinks = computed(() => styles.value.map(i => i.url));
    const body = `<div id='main-wrapper' />`;
    const inlineScript = ref(
      '/** before created vue */\n \
      console.log(window.vm);\n \
      /** after created vue */\n \
      window.addEventListener("createdVue", ()=> console.log(window.vm));'.replace(
        /^ +|\n +/g,
        "\n"
      )
    );
    const stylesStr = "";
    const {
      init,
      components,
      treeNode,
      hoverNodeId,
      dragNodeId,
      dropNodeId,
      moveNodeTo,
      addNodeTo,
      findById,
      editNode: editNodeById,
      removeNodeById
    } = useLocalVue(dragTag);
    const dialog = ref(false);
    const editNode = ref<Node | undefined>(undefined);
    const setEditTarget = (id: string) => {
      const node = findById(id);
      if (isNone(node)) return false;
      editNode.value = node.value.value;
      return true;
    };
    const activeDialog = (id: string) => {
      dialog.value = setEditTarget(id);
    };
    return {
      removeNodeById,
      findById,
      editNodeById,
      editNode,
      activeDialog,
      dialog,
      scriptsSrc,
      cssLinks,
      inlineScript,
      stylesStr,
      loaded: w => {
        console.log("reload");
        init(w);
      },
      body,
      components,
      dragTag,
      treeNode,
      mouseOver: mouseOver(hoverNodeId),
      mouseLeave: mouseLeave(hoverNodeId),
      cancelEvent,
      dragStart: dragStart(dragNodeId),
      dragLeave: dragLeave(dropNodeId),
      dragEnd: dragEnd(dragNodeId),
      dragEnter: dragEnter(dropNodeId),
      drop: drop(dragTag, dragNodeId, dropNodeId, addNodeTo, moveNodeTo),
      setEditTarget,
      showWindow: ref(false),
      showTree: ref(false),
      showSetting: ref(false),
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
