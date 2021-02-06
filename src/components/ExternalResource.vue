<template>
  <v-container>
    <h3>{{ title }}</h3>
    <v-layout>
      <v-text-field v-model="name" label="name" />
      <v-text-field v-model="url" label="url" />
      <v-btn @click="add" :disabled="name == '' || url == ''">add</v-btn>
    </v-layout>
    <v-list>
      <v-list-item v-for="obj in resources" :key="obj.name">
        <v-list-item-content>
          <v-list-item-title v-text="`${obj.name} (${obj.url})`" />
        </v-list-item-content>
        <v-list-item-action>
          <v-icon @click="remove(obj.name)" v-text="'delete'" />
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "@vue/composition-api";
interface Resource {
  url: string;
  name: string;
}
export default defineComponent({
  props: {
    title: {
      type: String as PropType<string>,
      default: ""
    },
    resources: {
      type: Array as PropType<Resource[]>,
      default: (): Resource[] => []
    }
  },
  setup(_, { emit }) {
    const url = ref<string>("");
    const name = ref<string>("");
    const remove = (name: string) => emit("remove", name);
    const add = () => {
      emit("add", { url: url.value, name: name.value });
      url.value = "";
      name.value = "";
    };
    return {
      url,
      name,
      remove,
      add
    };
  }
});
</script>
