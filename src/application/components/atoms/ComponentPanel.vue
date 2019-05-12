<template>
<v-flex xs6>
  <v-sheet
    draggable="true"
    height="75"
    :elevation="20"
    style="word-break: break-all;cursor: move;"
    @dragstart.native.stop="dragStart(componentName)"
    @dragend.native.stop="dragEnd(componentName)"
    @dragover="$event.preventDefault()"
  >{{componentName}}</v-sheet>
</v-flex>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  name: "ComponentPanel"
})
export default class ComponentPanel extends Vue {
  @Prop({ type: String, default: "" })
  private componentName!: string;

  private dragStart(name: string) {
    this.$emit("dragStart", name);
  }

  private dragEnd(name: string) {
    this.$emit("dragEnd", name);
  }


}
</script>
