<template>
<div>
  <h3>{{title}}</h3>
  <v-layout>
    <v-text-field v-model="name" label="props"/>
    <v-text-field v-model="value" label="value"/>
    <v-btn @click="add" :disabled="isDisabled">add</v-btn>
  </v-layout>
  <v-list>
    <v-list-tile v-for="(value, props) in attrs" :key="props">
      <v-list-tile-content>
        <v-list-tile-title>{{props}}: {{value}}</v-list-tile-title>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-icon @click="remove(props)">delete</v-icon>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import clone from "lodash.clonedeep";

@Component
export default class AttributeEditor extends Vue {
  @Prop({ type: String, default: "" })
  private title!: string;

  @Prop({ type: Object, default: () => ({}) })
  private attrs!: { [id: string]: string };

  private name: string = "";
  private value: string = "";

  private get isDisabled() {
    return this.name === "" || this.value === "";
  }

  private remove(name: string) {
    const attrs = clone(this.attrs);
    delete attrs[name];
    this.$emit("update", attrs);
  }

  private add() {
    const attrs = clone(this.attrs);
    attrs[name] = attrs.value;
    this.$emit("update", attrs);

    this.name = "";
    this.value = "";
  }
}
</script>
