<template>
  <div style="width: 100%; height: 100%;" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import * as ace from "brace";
import "brace/mode/javascript";
import "brace/theme/monokai";

@Component
export default class ExternamResource extends Vue {
  @Prop({ type: String, default: "" })
  private code!: string;
  @Prop({ type: String, default: "" })
  private lang!: string;
  @Prop({ type: String, default: "" })
  private theme!: string;

  private editor!: ace.Editor;
  private mounted() {
    const lang = this.lang || "javascript";
    const theme = this.theme || "monokai";
    this.editor = ace.edit(this.$el as HTMLElement);
    this.editor.setValue(this.code, 1);
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.setTheme("ace/theme/monokai");
    this.editor.on("change", () => {
      this.$emit("change", this.editor.getValue());
    });
  }
}
</script>
