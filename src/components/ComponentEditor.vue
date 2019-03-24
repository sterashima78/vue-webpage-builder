<template>
  <v-card flat style="overflow-y: scroll; height: calc(100vh - 50px);">
    <v-card-text v-if="editTarget.tag">
      <div>
        <h2>{{editTarget.tag}}</h2>
      </div>
      <div>
        <h3>Class</h3>
        <v-combobox
          v-model="editTarget.attr.class"
          :items="[]"
          :search-input.sync="search"
          hide-selected
          multiple
          small-chips
          label="class"
        ></v-combobox>
      </div>
      <div>
        <h3>Style</h3>
        <v-layout>
          <v-text-field v-model="styleName" label="props"/>
          <v-text-field v-model="styleValue" label="value"/>
          <v-btn @click="addStyle" :disabled="styleName=='' || styleValue == ''">add</v-btn>
        </v-layout>
        <v-list>
          <v-list-tile v-for="(value, props) in editTarget.attr.style" :key="props">
            <v-list-tile-content>
              <v-list-tile-title>{{props}}: {{value}}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon @click="removeStyle(props)">delete</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </div>
      <div>
        <h3>Attridute</h3>
        <v-layout>
          <v-text-field v-model="attrName" label="props"/>
          <v-text-field v-model="attrValue" label="value"/>
          <v-btn @click="addAttr" :disabled="attrName=='' || attrValue == ''">add</v-btn>
        </v-layout>
        <v-list>
          <v-list-tile v-for="(value, props) in editTarget.attr.attrs" :key="props">
            <v-list-tile-content>
              <v-list-tile-title>{{props}}: {{value}}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon @click="removeAttr(props)">delete</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </div>
      <div>
        <h3>Text</h3>
        <v-text-field :value="editTargetText" label="text" @input="updateText($event)"/>
      </div>
      <div>
        <div></div>
      </div>
    </v-card-text>
    <v-card-text v-else>
      Select edit target from
      <a @click="switchTab(0)" style="cursor: pointer">layer panel</a>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Emit } from "vue-property-decorator";
import Nodes from "../store/modules/nodes";
import clone from "lodash.clonedeep";
import { editTargetSubject } from "@/observer/";
import { IVueNode } from "@/types"
@Component
export default class ComponentEditor extends Vue {
  private search = null;
  private styleName = "";
  private styleValue = "";
  private attrName = "";
  private attrValue = "";
  private editTarget: IVueNode = {
    id: "",
    attr: {
      class: [],
      style: {},
      attrs: {}
    },
    parentId: "",
    childrenId: [],
    tag: ""
  };

  private created() {
    editTargetSubject.subscribe(target => (this.editTarget = target));
  }

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

  public updateText(text: string) {
    Nodes.UPDATE_TEXT(text);
  }
  public addStyle() {
    const styles = clone(this.editTarget.attr.style);
    styles[this.styleName] = this.styleValue;
    Nodes.UPDATE_STYLE(styles);
    this.styleName = "";
    this.styleValue = "";
  }
  public removeStyle(props: string) {
    const styles = clone(this.editTarget.attr.style);
    delete styles[props];
    Nodes.UPDATE_STYLE(styles);
  }

  public addAttr() {
    const attrs = clone(this.editTarget.attr.attrs);
    attrs[this.attrName] = this.attrValue;
    Nodes.UPDATE_ATTRIBUTE(attrs);
    this.attrValue = "";
    this.attrName = "";
  }
  public removeAttr(props: string) {
    const attrs = clone(this.editTarget.attr.attrs);
    delete attrs[props];
    Nodes.UPDATE_ATTRIBUTE(attrs);
  }
  @Emit("switch-tab")
  private switchTab(val: number): void {
    // empty
  }
}
</script>
