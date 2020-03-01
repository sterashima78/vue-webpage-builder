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
            :data="editNode.attributes"
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
import {
  PropType,
  PropOptions
} from "@vue/composition-api/dist/component/componentProps";

import { defineComponent, ref } from "@vue/composition-api";
import { Node, NodeTree } from "@/types";
import { isNone, Option } from "fp-ts/lib/Option";
import AttributeEditor from "./AttributeEditor.vue";
export default defineComponent({
  name: "ElementEditor",
  components: {
    AttributeEditor
  },
  props: {
    editNode: {
      type: Object,
      default: () => ({
        id: "default",
        tag: "div"
      })
    } as PropOptions<Node>,
    findById: {
      type: Function
    } as PropOptions<(id: string) => Option<NodeTree>>,
    editNodeById: {
      type: Function
    } as PropOptions<
      (id: string, modifier: (node: NodeTree) => NodeTree) => void
    >
  },
  setup(
    props: {
      editNode: Node;
      findById: (id: string) => Option<NodeTree>;
      editNodeById: (
        id: string,
        modifier: (node: NodeTree) => NodeTree
      ) => void;
    },
    { emit }
  ) {
    const findById = props.findById;
    const editNodeById = props.editNodeById;
    if (!findById) {
      throw new Error("findById is required");
    }
    if (!editNodeById) {
      throw new Error("editNodeById is required");
    }
    const addAttr = (id: string, newAttr: { name: string; value: string }) => {
      if (newAttr.name === "") return false;
      if (newAttr.value === "") return false;
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.attributes = node.value.attributes || {};
        try {
          node.value.attributes[newAttr.name] = JSON.parse(newAttr.value);
        } catch {
          node.value.attributes[newAttr.name] = newAttr.value;
        }
        return node;
      });
      emit("update");
    };
    const updateText = (id: string, text: string) => {
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.text = text;
        return node;
      });
    };

    const updateAttr = (
      id: string,
      { name, value }: { name: string; value: string }
    ) => {
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.attributes = node.value.attributes || {};
        node.value.attributes[name] = value;
        return node;
      });
    };

    const removeAttr = (id: string, key: string) => {
      editNodeById(id, (n: NodeTree) => {
        if (!n.value.attributes) return n;
        delete n.value.attributes[key];
        return n;
      });
      emit("update");
    };

    const updateStyle = (
      id: string,
      { name, value }: { name: string; value: string }
    ) => {
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.style = node.value.style || {};
        node.value.style[name] = value;
        return node;
      });
    };

    const removeStyle = (id: string, key: string) => {
      editNodeById(id, (n: NodeTree) => {
        if (!n.value.style) return n;
        delete n.value.style[key];
        return n;
      });
      emit("update");
    };
    const addStyle = (id: string, newAttr: { name: string; value: string }) => {
      if (newAttr.name === "") return false;
      if (newAttr.value === "") return false;
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.style = node.value.style || {};
        try {
          node.value.style[newAttr.name] = JSON.parse(newAttr.value);
        } catch {
          node.value.style[newAttr.name] = newAttr.value;
        }
        return node;
      });
      emit("update");
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
