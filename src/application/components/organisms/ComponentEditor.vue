<template>
<MenuTabItem>
  <div v-if="editTarget.tag">
    <h2>{{editTarget.tag}}</h2>
    <ClassEditor v-model="editTarget.attr.class"/>
    <AttrEditor 
      title="Styles"
      :attrs="styles"
      @update="updateStyles"
    />
    <AttrEditor 
      title="Attribute"
      :attrs="attrs"
      @update="updateAttrs"
    />
    <div>
      <h3>Text</h3>
      <v-text-field :value="editTargetText" label="text" @input="updateText($event)"/>
    </div>
  </div>
  <div v-else>
    Select edit target from
    <a @click="switchTab(0)" style="cursor: pointer">layer panel</a>
  </div>
</MenuTabItem>
</template>

<script lang="ts">
import { Component, Vue, Emit, Prop } from "vue-property-decorator";
import AttrEditor from "@/application/components/molecules/AttributeEditor.vue";
import ClassEditor from "@/application/components/organisms/ClassEditor.vue";
import MenuTabItem from "@/application/components/atoms/MenuTabItem.vue";
import Nodes from "@/store/modules/nodes";
import clone from "lodash.clonedeep";
import { IVueNode } from "@/types";

@Component({
  components: {
    AttrEditor,
    ClassEditor,
    MenuTabItem
  }
})
export default class ComponentEditor extends Vue {
  @Prop({ default: () => ({}) })
  private editTarget!: IVueNode;

  get editTargetText() {
    const c = this.editTarget.childrenId.filter(
      i => undefined === Nodes.nodes[i]
    );
    return c.length === 0 ? "" : c[0];
  }

  get editTargetAttr() {
    const a = this.editTarget.attr;
    return a === undefined ? {} : a;
  }

  private get attrs() {
    const a = this.editTargetAttr.attrs;
    return a === undefined ? {} : a;
  }

  private get styles() {
    const a = this.editTargetAttr.style;
    return a === undefined ? {} : a;
  }

  public updateText(text: string) {
    Nodes.UPDATE_TEXT(text);
  }

  private updateStyles(styles: { [id: string]: string }) {
    Nodes.UPDATE_STYLE(styles);
  }

  private updateAttrs(attrs: { [id: string]: string }) {
    Nodes.UPDATE_ATTRIBUTE(attrs);
  }

  @Emit("switch-tab")
  private switchTab(val: number): void {
    // empty
  }
}
</script>
