<template>
  <VIframeSandbox
    :body="body"
    style="width:100%;height:100%"
    :script="inlineScript.replace('<br>', '\n')"
    :scriptsSrc="scriptsSrc"
    :styles="stylesStr"
    :cssLinks="cssLinks"
    @loaded="emit('loaded', $event)"
  />
</template>
<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { VIframeSandbox } from "vue-iframe-sandbox";
import { useHtml } from "@/compositions/useHtml";
export default defineComponent({
  components: {
    VIframeSandbox
  },
  setup(_, { emit }) {
    return {
      emit,
      ...useHtml()
    };
  }
});
</script>
