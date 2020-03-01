<template>
  <v-container>
    <slot name="title"></slot>
    <v-row v-for="(val, key) in data" :key="key">
      <v-text-field :value="val" :label="key" @input="updateAttr(key, $event)">
        <template #append>
          <v-icon @click="removeAttr(key)">delete</v-icon>
        </template>
      </v-text-field>
    </v-row>
    <v-row>
      <v-text-field label="attribute" v-model="newAttr.name" />
      <v-text-field label="value" v-model="newAttr.value" />
      <v-btn @click="addAttr">add</v-btn>
    </v-row>
  </v-container>
</template>
<script lang="ts">
// import { PropType } from "vue";
import {
  PropType,
  PropOptions
} from "@vue/composition-api/dist/component/componentProps";
import { defineComponent, ref } from "@vue/composition-api";
import { Node, NodeTree } from "@/types";
import { isNone, Option } from "fp-ts/lib/Option";

export default defineComponent({
  name: "ElementEditor",
  props: {
    data: {
      type: Object,
      default: () => ({})
    } as PropOptions<{ [name: string]: string }>
  },
  setup(
    props: {
      data: { [name: string]: string };
    },
    { emit }
  ) {
    const newAttr = ref<{ name: string; value: string }>({
      name: "",
      value: ""
    });
    const addAttr = () => {
      if (newAttr.value.name === "") return false;
      if (newAttr.value.value === "") return false;
      emit("add", newAttr.value);
      newAttr.value.name = "";
      newAttr.value.value = "";
    };

    const updateAttr = (name: string, value: string) =>
      emit("update", { name, value });

    const removeAttr = (key: string) => emit("remove", key);
    return {
      newAttr,
      removeAttr,
      updateAttr,
      addAttr,
      close: () => emit("close")
    };
  }
});
</script>
