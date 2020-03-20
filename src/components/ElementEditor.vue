<template>
  <v-card>
    <v-toolbar dense>
      <v-toolbar-title>Edit Element</v-toolbar-title>
      <v-spacer />
      <v-icon @click="close">close</v-icon>
    </v-toolbar>
    <v-card-text>
      <v-container>
        {{ editNode }}
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
import { defineComponent, ref, PropType } from "@vue/composition-api";
import { Node, NodeTree } from "@/types";
import { isNone, Option, none } from "fp-ts/lib/Option";
import AttributeEditor from "./AttributeEditor.vue";
import { useState } from "@/compositions/store";
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
      })
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
      newAttr: { name: string; value: string }
    ) => {
      if (newAttr.name === "") return false;
      if (newAttr.value === "") return false;
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        try {
          node.value[key] = {
            ...node.value[key],
            [newAttr.name]: JSON.parse(newAttr.value)
          };
        } catch {
          node.value[key] = {
            ...node.value[key],
            [newAttr.name]: newAttr.value as any
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

    const remove = (k: "attributes" | "style") => (id: string, key: string) => {
      editNodeById(id, (n: NodeTree) => {
        const tmp = n.value[k];
        if (tmp === undefined) return n;
        if (tmp[key] === undefined) return n;
        delete tmp[key];
        return {
          ...n,
          value: {
            ...n.value,
            [k]: tmp
          }
        };
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
      close: () => emit("close")
    };
  }
});
</script>
