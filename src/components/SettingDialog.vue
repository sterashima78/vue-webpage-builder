<template>
  <div>
    <slot name="activator" :open="on" />
    <v-dialog
      v-model="isActive"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="off">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
        </v-toolbar>
        <ExternalResource
          title="JavaScript"
          :resources="scripts"
          @add="add('script', $event)"
          @remove="remove('script', $event)"
        />

        <ExternalResource
          title="Style"
          :resources="styles"
          @add="add('style', $event)"
          @remove="remove('style', $event)"
        />
        <v-container>
          <h3>Inline Javascript</h3>
          <div style="height:500px;">
            <ace @change="update" :code="code" />
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Resource } from "@/types";
import ExternalResource from "@/components/ExternalResource.vue";
import Ace from "@/components/Ace.vue";
import { useTogglable } from "@/compositions/useTogglable";
import { defineComponent } from "@vue/composition-api";
import { PropType } from "@vue/composition-api/dist/component/componentProps";
interface Props {
  scripts: Resource[];
  styles: Resource[];
  code: string;
}
export default defineComponent({
  components: {
    ExternalResource,
    Ace
  },
  props: {
    scripts: {
      type: Array as PropType<Resource[]>,
      default: (): Resource[] => []
    },
    styles: {
      type: Array as PropType<Resource[]>,
      default: (): Resource[] => []
    },
    code: {
      type: String as PropType<string>,
      default: ""
    }
  },
  setup(_, { emit }) {
    return {
      ...useTogglable(),
      add: (type: string, resource: Resource) => emit(`add:${type}`, resource),
      remove: (type: string, name: string) => emit(`remove:${type}`, name),
      update: (code: string) => emit("update:js", code)
    };
  }
});
</script>
