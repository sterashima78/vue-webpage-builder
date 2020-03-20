<template>
  <v-card>
    <v-toolbar dense>
      <v-toolbar-title>Edit Element</v-toolbar-title>
      <v-spacer />
      <v-icon @click="close">close</v-icon>
    </v-toolbar>
    <v-card-text>
      <v-container>
        <v-row>
          <v-text-field
            :value="editNode.tag"
            label="Element name"
            disabled
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
            :value="editNode.text || ''"
            label="Text"
            @input="updateText(editNode.id, $event)"
          ></v-text-field>
        </v-row>
        <v-row>
          <AttributeEditor
            :data="editNode.attributes"
            @add="addAttr(editNode.id, $event)"
            @update="addAttr(editNode.id, $event)"
            @remove="removeAttr(editNode.id, $event)"
          >
            <template #title>
              <h2>Attributes</h2>
            </template>
          </AttributeEditor>
        </v-row>
        <v-row>
          <AttributeEditor
            :data="editNode.style"
            @add="addStyle(editNode.id, $event)"
            @update="addStyle(editNode.id, $event)"
            @remove="removeStyle(editNode.id, $event)"
          >
            <template #title>
              <h2>Style</h2>
            </template>
          </AttributeEditor>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { defineComponent, PropType, computed } from "@vue/composition-api";
import { Node, NodeTree } from "@/types";
import { isNone } from "fp-ts/lib/Option";
import AttributeEditor from "./AttributeEditor.vue";
import { useState } from "@/compositions/useNodeState";
export default defineComponent({
  name: "ElementEditor",
  components: {
    AttributeEditor
  },
  props: {
    editNode: {
      type: Object as PropType<Node>,
      default: () => ({
        id: "default",
        tag: "div",
        text: "",
        style: {},
        attributes: {}
      }),
      required: true
    }
  },
  setup(
    props: {
      editNode: Node;
    },
    { emit }
  ) {
    const { findById, editNode: editNodeById } = useState();
    const add = (key: "attributes" | "style") => (
      id: string,
      newAttr: { name: string; val: string }
    ) => {
      if (newAttr.name === "") return false;
      if (newAttr.val === "") return false;
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        try {
          node.value[key] = {
            ...node.value[key],
            [newAttr.name]: JSON.parse(newAttr.val)
          };
        } catch {
          node.value[key] = {
            ...node.value[key],
            [newAttr.name]: newAttr.val as any
          };
        }
        return node;
      });
      emit("update");
    };
    const update = (key: "attributes" | "style") => (
      id: string,
      { name, value }: { name: string; value: string }
    ) => {
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value[key] = {
          ...node.value[key],
          [name]: value as any
        };
        return node;
      });
    };
    const removeByKey = (vals: { [name: string]: any }, keys: string[]) => {
      if (keys.length === 1) {
        delete vals[keys[0]];
        return;
      }

      if (keys[0] in vals) {
        removeByKey(vals[keys[0]], keys.slice(1));
      }
    };
    const remove = (k: "attributes" | "style") => (id: string, key: string) => {
      editNodeById(id, (n: NodeTree) => {
        removeByKey(n.value, [k, key]);
        return n;
      });
      emit("update");
    };

    const addAttr = add("attributes");
    const updateAttr = update("attributes");
    const removeAttr = remove("attributes");
    const addStyle = add("style");
    const updateStyle = update("style");
    const removeStyle = remove("style");

    const updateText = (id: string, text: string) => {
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.text = text;
        return node;
      });
    };

    return {
      removeAttr,
      updateAttr,
      addAttr,
      removeStyle,
      updateStyle,
      addStyle,
      updateText,
      target: computed(() => props.editNode),
      close: () => emit("close")
    };
  }
});
</script>
