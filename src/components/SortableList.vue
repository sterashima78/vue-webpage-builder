<template>
  <v-list dense style="width:100%;cursor: move;">
    <v-list-item
      v-for="(item, i) in items"
      :key="i"
      draggable
      @dragstart="dragTarget = i"
      @dragover="$event.preventDefault()"
      @drop="sort(i)"
    >
      <v-list-item-icon>
        <v-icon>mdi-drag-vertical</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title v-text="text === '' ? item : item[text]" />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from "@vue/composition-api";
export default defineComponent({
  props: {
    items: {
      type: Array as PropType<any[]>,
      default: (): any[] => []
    },
    text: {
      type: String as PropType<string>,
      default: ""
    }
  },
  setup(props: { items: any[] }, { emit }) {
    const dragTarget = ref(-1);

    return {
      dragTarget,
      sort(index: number) {
        if (dragTarget.value < 0) return;
        if (dragTarget.value === index) return;
        const swapSmall = dragTarget.value < index ? dragTarget.value : index;
        const swapLarge = swapSmall === index ? dragTarget.value : index;
        emit("update", [
          ...props.items.slice(0, swapSmall),
          props.items[swapLarge],
          ...props.items.slice(swapSmall + 1, swapLarge),
          props.items[swapSmall],
          ...props.items.slice(swapLarge + 1)
        ]);
      }
    };
  }
});
</script>
