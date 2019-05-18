<template>
<MenuTabItem>
  <ComponentSelector 
    :components="components" 
    @dragStart="dragStart"
    @dragEnd="dragEnd"
  />
</MenuTabItem>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import ComponentSelector from "@/application/components/molecules/ComponentSelector.vue";
import MenuTabItem from "@/application/components/atoms/MenuTabItem.vue";
@Component({
  components: {
    ComponentSelector,
    MenuTabItem
  }
})
export default class ComponentsList extends Vue {
  @Prop({ default: () => [] })
  private components!: string[];

  private dragStart(name: string) {
    this.$emit("dragStart", name);
  }

  private dragEnd(name: string) {
    this.$emit("dragEnd", name);
  }
}
</script>
