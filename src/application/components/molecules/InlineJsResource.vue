<template>
<div>
  <h3>Inline JavaScript</h3>
  <v-layout>
    <v-btn @click="isOpen = true">Open Editor</v-btn>
  </v-layout>
  <EditorDialog 
    v-model="isOpen" 
    :code="code" 
    @update:script="update"
  />
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import EditorDialog from "@/application/components/molecules/JsEditorDialog.vue";
@Component({
  components: {
    EditorDialog
  }
})
export default class InlineJsResource extends Vue {
  @Prop({ default: "" })
  private code!: string;
  private isOpen: boolean = false;
  private update(code: string) {
    this.$emit("update", code);
  }
}
</script>
