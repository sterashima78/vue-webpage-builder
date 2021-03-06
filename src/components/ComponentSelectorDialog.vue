<template>
  <div>
    <slot
      name="activator"
      :open="on"
      :close="off"
      :toggle="toggle"
      :is-active="isActive"
    >
      <v-tooltip bottom>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn dark icon v-on="{ ...tooltip, click: toggle }">
            <v-icon>view_quilt</v-icon>
          </v-btn>
        </template>
        <span>New Components</span>
      </v-tooltip>
    </slot>
    <draggable-window :is-active="isActive">
      <template #title>Components</template>
      <v-row justify="space-around">
        <v-checkbox v-model="selectedType" label="HTML" value="HTML" />
        <v-checkbox v-model="selectedType" label="Vue" value="Vue" />
        <v-checkbox v-model="selectedType" label="Alias" value="Alias" />
      </v-row>
      <v-autocomplete
        v-model="keyword"
        :items="autocomplete"
        :search-input.sync="search"
        label="Keyword"
        placeholder="Start typing to Search"
        prepend-icon="mdi-database-search"
      ></v-autocomplete>
      <div
        ref="wrapper"
        style="height:calc(100% - 100px);overflow-y:scroll;"
        @scroll="handleScroll($event.currentTarget.scrollTop)"
      >
        <div :style="innerStyle">
          <div :style="listContainerStyle">
            <v-list-item
              v-for="component in displayedComponents"
              :key="component.tag"
              draggable="true"
              @dragstart="dragStart(component)"
              style="cursor: move;"
            >
              <v-list-item-icon>
                <v-icon v-text="component.icon" />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="component.tag" />
              </v-list-item-content>
            </v-list-item>
          </div>
        </div>
      </div>
    </draggable-window>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  computed,
  inject,
  PropType,
  onMounted
} from "@vue/composition-api";
import { useTogglable } from "@/compositions/useTogglable";
import { useAlias } from "@/compositions/useAlias";
import DraggableWindow from "./DraggableWindow.vue";
import tags from "@/tags";
import { AliasDaoInjectionKey } from "@/domain/alias";
import { useVirtualScroll } from "@/compositions/useVirtualScroll";
const itemHeight = 56;

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
    const wrapper = ref<HTMLElement | null>(null);
    const aliasDao = inject(AliasDaoInjectionKey);
    if (!aliasDao) {
      throw new Error("dao is not injected");
    }
    const { aliases } = useAlias(aliasDao);
    const elements = computed(() =>
      tags
        .map(i => ({ tag: i, icon: "mdi-language-html5", type: "HTML" }))
        .concat(
          props.components.map(i => ({
            tag: i,
            icon: "mdi-vuejs",
            type: "Vue"
          }))
        )
        .concat(
          aliases.value.map(i => ({
            tag: i,
            icon: "mdi-bookmark",
            type: "Alias"
          }))
        )
    );
    const keyword = ref("");
    const search = ref("");
    const selectedType = ref(["Vue", "HTML", "Alias"]);
    const dragStart = (component: { tag: string }) =>
      emit("select", component.tag);
    const filteredByTypeComponents = computed(() =>
      elements.value.filter(e => selectedType.value.includes(e.type))
    );
    const filteredComponents = computed(() =>
      search.value === null || search.value === ""
        ? filteredByTypeComponents.value
        : filteredByTypeComponents.value.filter(i =>
            i.tag.match(new RegExp(search.value, "i"))
          )
    );
    watch(
      () => keyword.value,
      v => {
        search.value = v;
      },
      {
        immediate: true
      }
    );
    return {
      selectedType,
      ...useTogglable(),
      keyword,
      search,
      dragStart,
      autocomplete: computed(() => elements.value.map(({ tag }) => tag)),
      wrapper,
      ...useVirtualScroll(onMounted, filteredComponents, wrapper, itemHeight)
    };
  }
});
</script>
