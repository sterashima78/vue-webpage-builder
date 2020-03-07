<template>
  <div>
    <slot
      name="activator"
      :open="on"
      :close="off"
      :toggle="toggle"
      :is-active="isActive"
    />
    <component :is="style">
      <hsc-window
        v-show="isActive"
        title="Components"
        style="border:1px solid black;overflow: hidden;"
        :resizable="true"
        :minWidth="300"
        :minHeight="300"
        :maxWidth="500"
        :maxHeight="600"
      >
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
      </hsc-window>
    </component>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed } from "@vue/composition-api";
import { PropType } from "@vue/composition-api/dist/component/componentProps";
import { useTogglable } from "@/compositions/useTogglable";
import { StyleFactory } from "@hscmap/vue-window";
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
      ...useTogglable(),
      filteredComponents,
      keyword,
      search,
      dragStart,
      style: StyleFactory({
        button: {
          color: "red"
        },
        buttonActive: {
          color: "white"
        },
        buttonHover: {
          backgroundColor: "rgba(255, 0, 0, 0.8)"
        },
        content: {
          backgroundColor: "rgba(37, 61, 91, 0.8)",
          height: "100%"
        },
        titlebar: {
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.25), #436f7c)"
        },
        window: {
          border: "1px solid #f00",
          color: "white",
          boxShadow: "0 2pt 8pt rgba(0, 0, 0, 0.5)"
        }
      })
    };
  }
});
</script>
