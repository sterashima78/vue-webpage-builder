<template>
  <div>
    <slot name="activator" :open="on">
      <v-btn icon @click="on">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </slot>
    <v-dialog
      v-model="isActive"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card style="width: 100%;height: 100%">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="off">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Preview</v-toolbar-title>
        </v-toolbar>

        <v-iframe-sandbox
          :body="body"
          style="width: 100%;height: calc(100% - 60px)"
          :script="inlineScript"
          :scriptsSrc="scriptsSrc"
          :styles="stylesStr"
          :cssLinks="cssLinks"
        />
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Resource } from "@/types";
import { useTogglable } from "@/compositions/useTogglable";
import { defineComponent, ref, watch } from "@vue/composition-api";
import { VIframeSandbox } from "vue-iframe-sandbox";
import { useHtml } from "@/compositions/useHtml";
import { toHtmlOptions } from "@/compositions/exporter";
interface Props {
  scripts: Resource[];
  styles: Resource[];
  code: string;
}
export default defineComponent({
  components: {
    VIframeSandbox
  },
  setup() {
    const toggle = useTogglable();
    const html = useHtml();
    const body = ref("");
    const inlineScript = ref("");
    watch(
      () => toggle.isActive.value,
      v => {
        if (!v) {
          body.value = "";
          inlineScript.value = "";
          return;
        }
        const { nodes, path } = toHtmlOptions();
        body.value = `
            <div id="app-main" style="height:100%;width:100%">
              <router-view />
            </div>
            ${nodes}
          `;
        inlineScript.value = `
            const routes = ${path}
            const router = new VueRouter({
              routes
            })
            const CustomVue = ("VueOption" in window) ? Vue.extend(VueOption) : Vue;
            window.vm = new CustomVue({
              el: "#app-main",
              router
            });
            window.dispatchEvent(new Event("createdVue"))
          `.concat(html.inlineScript.value);
      }
    );
    return {
      ...toggle,
      ...html,
      body,
      inlineScript
    };
  }
});
</script>
