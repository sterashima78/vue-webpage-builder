<template>
  <v-draggable-resizable
    v-show="isActive"
    :draggable="draggable"
    :enable-native-drag="true"
    :w="300"
    :h="400"
    :max-height="500"
    :max-width="400"
    :x="20"
    :y="20"
    drag-handle=".drag-handle"
  >
    <v-card style="height: 100%">
      <v-toolbar
        class="drag-handle"
        @mouseenter="draggable = true"
        @mouseleave="draggable = false"
      >
        <v-toolbar-title><slot name="title"/></v-toolbar-title>
      </v-toolbar>
      <v-card-text style="height: calc(100% - 55px);">
        <slot />
      </v-card-text>
    </v-card>
  </v-draggable-resizable>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from "@vue/composition-api";
import VDraggableResizable from "vue-draggable-resizable";
export default defineComponent({
  props: {
    isActive: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  components: {
    VDraggableResizable
  },
  setup() {
    const draggable = ref(false);
    return {
      draggable
    };
  }
});
</script>
<style lang="scss" scoped>
.drag-handle {
  cursor: move;
}
</style>
