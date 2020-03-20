<template>
  <v-container>
    <slot name="title"></slot>
    <v-row v-for="(val, key) in data ? data : {}" :key="key">
      <v-text-field :value="val" :label="key" @input="updateAttr(key, $event)">
        <template #append>
          <v-icon @click="removeAttr(key)">delete</v-icon>
        </template>
      </v-text-field>
    </v-row>
    <v-row>
      <v-text-field label="attribute" v-model="newAttr.name" />
      <v-text-field label="value" v-model="newAttr.val" />
      <v-btn @click="addAttr">add</v-btn>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent, ref, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "ElementEditor",
  props: {
    data: {
      type: Object as PropType<{ [name: string]: string }>,
      default: () => ({})
    }
  },
  setup(
    props: {
      data: { [name: string]: string };
    },
    { emit }
  ) {
    const newAttr = ref({
      name: "",
      val: ""
    });
    const addAttr = () => {
      if (newAttr.value.name === "") return false;
      if (newAttr.value.val === "") return false;
      emit("add", newAttr.value);
      newAttr.value.name = "";
      newAttr.value.val = "";
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
