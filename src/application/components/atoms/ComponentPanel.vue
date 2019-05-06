<template>
<v-flex xs6>
  <v-sheet
    draggable="true"
    height="75"
    :elevation="20"
    style="word-break: break-all;cursor: move;"
    @dragstart.native.stop="cmpDragStart(componentName)"
    @dragend.native.stop="cmpDragEnd(componentName)"
    @dragover="$event.preventDefault()"
  >{{componentName}}</v-sheet>
</v-flex>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Nodes from "@/store/modules/nodes";

@Component({
  name: "ComponentPanel"
})
export default class ComponentPanel extends Vue {
  @Prop({ type: String, default: "" })
  private componentName!: string;

  public cmpDragStart(name: string) {
    Nodes.SET_NEW_COMPONENT_NAME(name);
  }

  public cmpDragEnd(name: string) {
    Nodes.REMOVE_NEW_COMPONENT_NAME(name);
  }
}
</script>
