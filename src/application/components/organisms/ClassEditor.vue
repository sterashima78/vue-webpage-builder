<template>
<div>
  <h3>Class</h3>
  <v-combobox
    :value="value"
    @change="updateClass"
    :items="[]"
    :search-input.sync="search"
    hide-selected
    multiple
    small-chips
    label="class"
  ></v-combobox>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class Resource extends Vue {
  @Prop({ type: Array, default: () => [] })
  private value!: string[];

  private search: string = "";

  private updateClass(classes: string[]) {
    this.$emit("input", classes);
  }
}
</script>
