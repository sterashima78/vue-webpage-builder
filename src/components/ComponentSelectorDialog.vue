<template>
  <div>
    <slot
      name="activator"
      :open="on"
      :close="off"
      :toggle="toggle"
      :is-active="isActive"
    >
      <v-btn icon @click="toggle">
        <v-icon>view_quilt</v-icon>
      </v-btn>
    </slot>
    <draggable-window :is-active="isActive">
      <template #title>Components</template>
      <v-autocomplete
        v-model="keyword"
        :items="components"
        :search-input.sync="search"
        label="Keyword"
        placeholder="Start typing to Search"
        prepend-icon="mdi-database-search"
      ></v-autocomplete>
      <div style="height:calc(100% - 50px);overflow-y:scroll;">
        <v-list-item
          v-for="component in filteredComponents"
          v-text="component"
          :key="component"
          draggable="true"
          @dragstart="dragStart(component)"
          style="cursor: move;"
        >
          <v-list-item-content>
            <v-list-item-title v-text="component" />
          </v-list-item-content>
        </v-list-item>
      </div>
    </draggable-window>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed } from "@vue/composition-api";
import { PropType } from "@vue/composition-api/dist/component/componentProps";
import { useTogglable } from "@/compositions/useTogglable";
import { useAlias } from "@/compositions/useAlias";
import DraggableWindow from "./DraggableWindow.vue";
import tags from "@/tags";
export default defineComponent({
  components: {
    DraggableWindow
  },
  props: {
    components: {
      type: Array as PropType<string[]>,
      default: (): string[] => []
    }
  },
  setup(props: { components: string[] }, { emit }) {
    const { aliases } = useAlias();
    const elements = computed(() =>
      tags.concat(props.components).concat(aliases.value)
    );
    const keyword = ref("");
    const search = ref("");
    const dragStart = (component: string) => emit("select", component);
    const filteredComponents = computed(() =>
      search.value === null || search.value === ""
        ? elements.value
        : elements.value.filter(i => i.indexOf(search.value) >= 0)
    );
    watch(
      () => keyword.value,
      v => (search.value = v)
    );
    return {
      ...useTogglable(),
      filteredComponents,
      keyword,
      search,
      dragStart
    };
  }
});
</script>
