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
import { useState } from "@/compositions/useNodeState";
import { useTogglable } from "@/compositions/useTogglable";
import { NodeTree } from "../types";
import { pipe } from "fp-ts/es6/pipeable";
import { fold } from "fp-ts/es6/Option";
import { nodeDao } from "@/infrastructure/nodes";
export default defineComponent({
  props: {
    nodeId: {
      type: String as PropType<string>,
      default: ""
    }
  },
  setup(props: { nodeId: string }) {
    const name = ref("");
    const { findById } = useState(nodeDao);
    const { regist, isRegist } = useAlias();
    const { isActive, off } = useTogglable();
    return {
      isActive,
      name,
      isRegistered: computed(() => isRegist(name.value)),
      regist: () =>
        pipe(
          props.nodeId,
          findById,
          fold<NodeTree, void>(
            () => off(),
            node => {
              regist(name.value, node);
              off();
            }
          )
        )
    };
  }
});
</script>
