<template>
<MenuTabItem>
  <v-switch :label="isSort ? 'sort' : 'add'" :input-value="isSort" @change="setIsSort(!!$event)"></v-switch>
  <v-treeview :items="tree" :hoverable="true">
    <template slot="label" slot-scope="{ item }">
      <div
        draggable="true"
        style="cursor: move"
        @dragstart="treeDragStart(item.id)"
        @drop="treeDrop(item.id)"
        @dragover="$event.preventDefault()"
        @mouseenter="treeMouseEnter(item.id)"
        @mouseleave="treeMouseLeave(item.id)"
      >{{item.name}}</div>
    </template>
    <template slot="append" slot-scope="{ item }">
      <v-icon @click="openAttrEditor(item.id)">tune</v-icon>
      <v-icon @click="deleteNode(item.id)">delete</v-icon>
    </template>
  </v-treeview>
</MenuTabItem>
</template>

<script lang="ts">
import { Component, Vue, Watch, Emit, Prop } from "vue-property-decorator";
import { IVueNodeTree } from "@/types";
import Nodes from "@/store/modules/nodes";
import MenuTabItem from "@/application/components/atoms/MenuTabItem.vue";

@Component({
  components: {
    MenuTabItem
  }
})
export default class ComponentTree extends Vue {
  private treeDragItem: string = "";

  @Prop({ default: () => [] })
  private tree!: IVueNodeTree[];

  private created() {
    this.setIsSort(!!Nodes.isSort);
  }

  get isSort() {
    return !!Nodes.isSort;
  }

  @Emit("switch-tab")
  private switchTab(val: number): void {
    // empty
  }

  private openAttrEditor(id: string) {
    this.switchTab(2);
    Nodes.SET_EDIT_TARGET(id);
  }

  private treeDragStart(id: string) {
    this.treeDragItem = id;
  }

  private treeDrop(id: string) {
    if (id === this.treeDragItem) {
      return;
    }
    if (Nodes.isSort) {
      Nodes.MOVE_ELEMENT_TO({ eleId: this.treeDragItem, targetId: id });
    } else {
      Nodes.MOVE_ELEMENT_IN({ eleId: this.treeDragItem, targetId: id });
    }
    this.treeDragItem = "";
  }

  private treeMouseEnter(id: string) {
    Nodes.SET_HOVER_ELEMENT(id);
  }

  private treeMouseLeave(id: string) {
    Nodes.REMOVE_HOVER_ELEMENT(id);
  }

  private deleteNode(id: string) {
    Nodes.REMOVE_NODE(id);
  }

  private setIsSort(v: boolean) {
    Nodes.SET_IS_SORT(v);
  }
}
</script>
