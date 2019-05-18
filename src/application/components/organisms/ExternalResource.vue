<template>
<MenuTabItem>
  <InlineScript @update="scriptUpdate" :code="inlineScript"/>

  <Resource 
    title="JavaScript"
    :resources="scripts"
    @add="addScript"
    @remove="removeScript"
  />
  
  <Resource 
    title="Style"
    :resources="styles"
    @add="addStyle"
    @remove="removeStyle"
  />
</MenuTabItem>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import clone from "lodash.clonedeep";
import Resource from "@/application/components/molecules/Resource.vue";
import InlineScript from "@/application/components/molecules/InlineJsResource.vue";
import MenuTabItem from "@/application/components/atoms/MenuTabItem.vue";
@Component({
  components: {
    Resource,
    InlineScript,
    MenuTabItem
  }
})
export default class ExternamResource extends Vue {
  @Prop({ type: Object, default: () => ({}) })
  private styles!: { [id: string]: string };

  @Prop({ type: Object, default: () => ({}) })
  private scripts!: { [id: string]: string };

  @Prop({ default: "" })
  private inlineScript!: string;
  private scriptUpdate(code: string) {
    this.$emit("updateInlineScript", code);
  }

  private removeScript(id: string) {
    this.$emit("removeStript", id);
  }

  private addScript(resource: { url: string; name: string }) {
    this.$emit("addScript", resource);
  }

  private removeStyle(id: string) {
    this.$emit("removeStyle", id);
  }

  private addStyle(resource: { url: string; name: string }) {
    this.$emit("addStyle", resource);
  }
}
</script>
