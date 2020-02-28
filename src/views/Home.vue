<template>
  <div style="height: 100%">
    <span
      style="display: inline-block;padding: 5px;cursor: move"
      v-for="component in components"
      v-text="component"
      :key="component"
      draggable="true"
      @dragstart="dragTag = component"
    />
    <div style="display:flex;width:100%;height:100%">
      <VIframeSandbox
        :body="body"
        style="width:80%;height:100%"
        :script="inlineScript"
        :scriptsSrc="scriptsSrc"
        :styles="stylesStr"
        :cssLinks="cssLinks"
        @loaded="loaded"
      />
      <v-treeview
        :items="treeNode.children"
        :hoverable="true"
        style="width:20%;height:100%"
      >
        <template slot="label" slot-scope="{ item }">
          <div
            draggable="true"
            style="cursor: move"
            @dragover="$event.preventDefault()"
          >
            {{ item.name }}
          </div>
        </template>
        <!-- <template slot="append">
          <v-icon>tune</v-icon>
          <v-icon>delete</v-icon>
        </template> -->
      </v-treeview>
    </div>
  </div>
</template>

<script lang="ts">
import "@/plugin";
import { VIframeSandbox } from "vue-iframe-sandbox";
import { defineComponent, ref } from "@vue/composition-api";
import { useLocalVue } from "@/compositions/localVue";
export default defineComponent({
  name: "Home",
  components: {
    VIframeSandbox
  },
  setup() {
    const dragTag = ref("");
    const scriptsSrc = [
      "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.js",
      "https://unpkg.com/element-ui/lib/index.js"
    ];
    const cssLinks = ["https://unpkg.com/element-ui/lib/theme-chalk/index.css"];
    const body = `<div id='main-wrapper' />`;
    // const scriptsSrc = {
    //   element: {
    //     name: "element",
    //     url: "https://unpkg.com/element-ui/lib/index.js"
    //   }
    // };
    // const cssLinks = {
    //   element: {
    //     name: "element",
    //     url: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
    //   }
    // };
    const inlineScript = ``;
    const stylesStr = "";
    const { init: loaded, components, treeNode } = useLocalVue(dragTag);
    return {
      scriptsSrc,
      cssLinks,
      inlineScript,
      stylesStr,
      loaded,
      body,
      components,
      dragTag,
      treeNode
    };
  }
});
</script>
