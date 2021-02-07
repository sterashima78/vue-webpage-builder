<template>
  <VIframeSandbox
    :body="body"
    style="width:100%;height:100%"
    :script="inlineScript"
    :scriptsSrc="scriptsSrc"
    :styles="stylesStr"
    :cssLinks="cssLinks"
    @loaded="emit('loaded', $event)"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from "@vue/composition-api";
import { VIframeSandbox } from "vue-iframe-sandbox";
export default defineComponent({
  props: {
    body: {
      type: String as PropType<string>,
      default: ""
    },
    inlineScript: {
      type: String as PropType<string>,
      default: ""
    },
    stylesStr: {
      type: String as PropType<string>,
      default: ""
    },
    scriptsSrc: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    cssLinks: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  components: {
    VIframeSandbox
  },
  setup(_, { emit }) {
    return {
      emit
    };
  }
});
</script>
