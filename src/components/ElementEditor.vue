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
          <v-container>
            <h2>Attributes</h2>
            <v-row v-for="(val, key) in editNode.attributes || {}" :key="key">
              <v-text-field
                :value="val"
                :label="key"
                @input="updateAttr(editNode.id, key, $event)"
              >
                <template #append>
                  <v-icon @click="removeAttr(editNode.id, key)">delete</v-icon>
                </template>
              </v-text-field>
            </v-row>
            <v-row>
              <v-text-field label="attribute" v-model="newAttr.name" />
              <v-text-field label="value" v-model="newAttr.value" />
              <v-btn @click="addAttr(editNode.id)">add attibute</v-btn>
            </v-row>
          </v-container>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { PropType } from "vue";
import { defineComponent, ref } from "@vue/composition-api";
import { Node, NodeTree } from "@/types";
import { isNone, Option } from "fp-ts/lib/Option";

export default defineComponent({
  name: "ElementEditor",
  props: {
    editNode: {
      type: Object as PropType<Node>,
      default: () => ({
        id: "default",
        tag: "div"
      })
    },
    findById: {
      type: Function as PropType<(id: string) => Option<NodeTree>>
    },
    editNodeById: {
      type: Function as PropType<
        (id: string, modifier: (node: NodeTree) => NodeTree) => void
      >
    }
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
    const newAttr = ref<{ name: string; value: string }>({
      name: "",
      value: ""
    });
    const addAttr = (id: string) => {
      if (newAttr.value.name === "") return false;
      if (newAttr.value.value === "") return false;
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.attributes = node.value.attributes || {};
        node.value.attributes[newAttr.value.name] = JSON.parse(
          newAttr.value.value
        );
        return node;
      });
      newAttr.value.name = "";
      newAttr.value.value = "";
      emit("update");
    };
    const updateText = (id: string, text: string) => {
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.text = text;
        return node;
      });
    };

    const updateAttr = (id: string, key: string, text: string) => {
      if (isNone(findById(id))) return false;
      editNodeById(id, (node: NodeTree) => {
        node.value.attributes = node.value.attributes || {};
        node.value.attributes[key] = text;
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
    return {
      newAttr,
      removeAttr,
      updateAttr,
      updateText,
      addAttr,
      editNode: props.editNode,
      close: () => emit("close")
    };
  }
});
</script>
