<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <slot name="activator" :on="on">
        <v-btn icon v-on="on">
          <v-icon>mdi-text-box-multiple-outline</v-icon>
        </v-btn>
      </slot>
    </template>
    <v-list>
      <v-list-item
        v-for="route in allRoute"
        :key="route"
        :style="{ background: currentRoute === route ? '#eee' : '' }"
        :disabled="currentRoute === route"
        @click="routing.push({ path: route })"
      >
        <v-list-item-content>
          <v-list-item-title v-text="route" />
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-dialog width="500">
        <template v-slot:activator="{ on }">
          <v-list-item v-on="on">New Page</v-list-item>
        </template>

        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>
            New Page
          </v-card-title>

          <v-card-text>
            <v-text-field
              label="Page path"
              placeholder="/path/to/new/page"
              v-model="newPath"
            ></v-text-field>
            <v-btn @click="createRoute">Create</v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-list>
  </v-menu>
</template>
<script lang="ts">
import { defineComponent, ref, PropType } from "@vue/composition-api";
import { useState } from "@/compositions/useNodeState";
import { nodeDao } from "@/infrastructure/nodes";
import { aliasDao } from "@/infrastructure/alias";

export default defineComponent({
  props: {
    addRoute: {
      type: Function,
      default: () => console.log("not init")
    },
    currentRoute: {
      type: String
    },
    routing: {
      type: Object as PropType<{ push: (option: { path: string }) => void }>,
      default: () => ({ push: (opt: any) => console.log(opt) })
    }
  },
  setup(props: { addRoute: (path: string) => void }) {
    const { addNewPath, allRoute } = useState(nodeDao, aliasDao);
    const newPath = ref("");
    const createRoute = () => {
      addNewPath(newPath.value);
      props.addRoute(newPath.value);
      newPath.value = "";
    };
    return {
      newPath,
      addNewPath,
      allRoute,
      createRoute
    };
  }
});
</script>
