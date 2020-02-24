<template>
  <div>
    {{ components }}
    <VIframeSandbox
      :body="body"
      style="width:100%;height:100%"
      :script="inlineScript"
      :scriptsSrc="scriptsSrc"
      :styles="stylesStr"
      :cssLinks="cssLinks"
      @loaded="loaded"
    />
  </div>
</template>

<script lang="ts">
import { VIframeSandbox } from "vue-iframe-sandbox";
import { defineComponent } from "@vue/composition-api";
import { useLocalVue } from "@/compositions/localVue";
export default defineComponent({
  name: "Home",
  components: {
    VIframeSandbox
  },
  setup() {
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
    // const loaded = (w: window) => console.log(w);
    const { init: loaded, components } = useLocalVue();
    return {
      scriptsSrc,
      cssLinks,
      inlineScript,
      stylesStr,
      loaded,
      body,
      components
    };
  }
});
</script>
