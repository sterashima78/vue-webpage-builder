<template>
<v-dialog :value="value" @input="updateIsOpen" scrollable>
  <v-card>
    <v-card-title>Inline JavaScript</v-card-title>
    <v-divider></v-divider>
    <v-card-text style="height: 500px;">
      <Editor :code="code" @change="updateScript"/>
    </v-card-text>
  </v-card>
</v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Editor from "@/application/components/atoms/Ace.vue";

@Component({
  components: {
    Editor
  }
})
export default class JsEditorDialog extends Vue {
  @Prop({ default: "" })
  private code!: string;

  @Prop({ default: false })
  private value!: boolean;

  private updateIsOpen(isOpen: boolean) {
    this.$emit("input", isOpen);
  }
  private updateScript(code: string) {
    this.$emit("update:script", code);
  }
}
</script>
