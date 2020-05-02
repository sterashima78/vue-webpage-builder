<template>
  <v-menu v-model="isActive" :close-on-content-click="false" :nudge-width="200">
    <template v-slot:activator="{ on }">
      <v-icon v-on="on">mdi-bookmark-plus-outline</v-icon>
    </template>

    <v-card>
      <v-card-title>Register alias</v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Alias" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="regist">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script lang="ts">
import { defineComponent, computed, ref, PropType } from "@vue/composition-api";
import { useAlias } from "@/compositions/useAlias";
import { useTogglable } from "@/compositions/useTogglable";
import { NodeTree } from "../types";
export default defineComponent({
  props: {
    node: {
      type: Object as PropType<NodeTree>
    }
  },
  setup(props: { node: NodeTree }) {
    const name = ref("");
    const { regist, isRegist } = useAlias();
    const { isActive, off } = useTogglable();
    return {
      isActive,
      name,
      isRegistered: computed(() => isRegist(name.value)),
      regist: () => {
        regist(name.value, props.node);
        off();
      }
    };
  }
});
</script>
