<template>
<v-card flat style="overflow-y: scroll; height: calc(100vh - 50px);">
  <v-card-text>
    <InlineScript 
      @update="scriptUpdate"
    />

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
  </v-card-text>
</v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Resource from "@/application/components/molecules/Resource.vue";
import InlineScript from "@/application/components/molecules/InlineJsResource.vue";
@Component({
  components: {
    Resource,
    InlineScript
  }
})
export default class ExternamResource extends Vue {
  @Prop({ type: Object, default: () => ({}) })
  private styles!: { [id: string]: string };

  @Prop({ type: Object, default: () => ({}) })
  private scripts!: { [id: string]: string };

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
