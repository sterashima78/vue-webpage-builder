<template>
<div>
  <v-select :items="['html', 'component']" v-model="type"/>
  <v-text-field v-model="filter" label="filter"/>
  <v-container grid-list-xl>
    <v-layout wrap>
      <ComponentPanel 
        v-for="componentName in filteredComponents" 
        :key="componentName"
        :componentName="componentName"
      />
    </v-layout>
  </v-container>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import HTMLTags from "@/domain/model/tags";
import ComponentPanel from "@/application/components/atoms/ComponentPanel.vue";

@Component({
  components: {
    ComponentPanel
  }
})
export default class ComponentSelector extends Vue {
  @Prop({ default: () => [] })
  private components!: string[];
  private filter = "";
  private type = "html";
  public get filteredComponents(): string[] {
    const re = new RegExp(this.filter, "i");
    switch (this.type) {
      case "html":
        return HTMLTags.filter(c => re.test(c)).sort();
      case "component":
        return this.components.filter(c => re.test(c)).sort();
      default:
        return [];
    }
  }
}
</script>
