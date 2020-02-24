<template>
  <VIframeSandbox
    :body="body"
    style="width:100%;height:100%"
    :script="inlineScript"
    :scriptsSrc="scriptsSrc"
    :styles="stylesStr"
    :cssLinks="cssLinks"
    @loaded="loaded"
  />
</template>

<script lang="ts">
import { VIframeSandbox } from "vue-iframe-sandbox";
import { defineComponent } from "@vue/composition-api";

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
    const body = `
    <div id='main-wrapper'>
      <el-row>
        <el-button>Default</el-button>
        <el-button type="primary">Primary</el-button>
        <el-button type="success">Success</el-button>
        <el-button type="info">Info</el-button>
        <el-button type="warning">Warning</el-button>
        <el-button type="danger">Danger</el-button>
      </el-row>

      <el-row>
        <el-button plain>Plain</el-button>
        <el-button type="primary" plain>Primary</el-button>
        <el-button type="success" plain>Success</el-button>
        <el-button type="info" plain>Info</el-button>
        <el-button type="warning" plain>Warning</el-button>
        <el-button type="danger" plain>Danger</el-button>
      </el-row>

      <el-row>
        <el-button round>Round</el-button>
        <el-button type="primary" round>Primary</el-button>
        <el-button type="success" round>Success</el-button>
        <el-button type="info" round>Info</el-button>
        <el-button type="warning" round>Warning</el-button>
        <el-button type="danger" round>Danger</el-button>
      </el-row>

      <el-row>
        <el-button icon="el-icon-search" circle></el-button>
        <el-button type="primary" icon="el-icon-edit" circle></el-button>
        <el-button type="success" icon="el-icon-check" circle></el-button>
        <el-button type="info" icon="el-icon-message" circle></el-button>
        <el-button type="warning" icon="el-icon-star-off" circle></el-button>
        <el-button type="danger" icon="el-icon-delete" circle></el-button>
      </el-row>
    </div>`;
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
    const inlineScript = `new Vue({el: "#main-wrapper"})`;
    const stylesStr = "";
    const loaded = (w: window) => console.log(w);
    return {
      scriptsSrc,
      cssLinks,
      inlineScript,
      stylesStr,
      loaded,
      body
    };
  }
});
</script>
