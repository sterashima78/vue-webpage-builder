<template>
  <div>
    <v-autocomplete
      v-model="keyword"
      :items="components"
      :search-input.sync="search"
      color="white"
      label="Keyword"
      placeholder="Start typing to Search"
      prepend-icon="mdi-database-search"
    ></v-autocomplete>
    <div style="overflow-y:scroll;">
      <v-list-item
        v-for="component in filteredComponents"
        v-text="component"
        :key="component"
        draggable="true"
        @dragstart="dragStart(component)"
        style="cursor: move"
      >
        <v-list-item-content>
          <v-list-item-title v-text="component" />
        </v-list-item-content>
      </v-list-item>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed } from "@vue/composition-api";
import { PropType } from "@vue/composition-api/dist/component/componentProps";
export default defineComponent({
  props: {
    components: {
      type: Array as PropType<string[]>,
      default: (): string[] => []
    }
  },
  setup(props: { components: string[] }, { emit }) {
    const keyword = ref("");
    const search = ref("");
    const dragStart = component => emit("select", component);
    const filteredComponents = computed(() =>
      search.value === null || search.value === ""
        ? props.components
        : props.components.filter(i => i.indexOf(search.value) >= 0)
    );
    watch(keyword.value, v => (search.value = v));
    return {
      filteredComponents,
      keyword,
      search,
      dragStart
    };
  }
});
</script>
