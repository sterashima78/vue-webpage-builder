<template>
  <div>
    <slot name="activator" :open="on">
      <v-btn icon @click="on">
        <v-icon>settings</v-icon>
      </v-btn>
    </slot>
    <v-dialog
      v-model="isActive"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="off">
            <v-icon>close</v-icon>
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
            <ace @change="code = $event" :code="code" />
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Resource } from "@/types";
import ExternalResource from "@/components/ExternalResource.vue";
import Ace from "@/components/Ace.vue";
import { useTogglable } from "@/compositions/useTogglable";
import { defineComponent } from "@vue/composition-api";
import { useHtml } from "@/compositions/useHtml";
interface Props {
  scripts: Resource[];
  styles: Resource[];
  code: string;
}
export default defineComponent({
  components: {
    ExternalResource,
    Ace
  },
  setup() {
    const {
      styles,
      scripts,
      inlineScript,
      addScript,
      addStyle,
      removeScript,
      removeStyle
    } = useHtml();
    return {
      styles,
      scripts,
      code: inlineScript,
      addScript,
      addStyle,
      removeScript,
      removeStyle,
      ...useTogglable()
    };
  }
});
</script>
