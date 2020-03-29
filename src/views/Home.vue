<template>
  <div style="height: 100%">
    <v-app-bar color="deep-purple accent-4" dense dark>
      <v-toolbar-title>Vue Webpage Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <ComponentTreeDialog />
      <ComponentSelectorDialog
        :components="components"
        @select="dragTag = $event"
      />
      <SettingDialog />
      <PageMenu
        :addRoute="addLocalRoute"
        :currentRoute="currentRoute"
        :routing="routing"
      />
      <v-menu offset-y :close-on-content-click="false">
        <template #activator="{ on }">
          <slot name="activator" :on="on">
            <v-btn icon v-on="on">
              <v-icon>mdi-devices</v-icon>
            </v-btn>
          </slot>
        </template>
        <v-list>
          <v-list-item
            v-for="device in devices"
            :key="device.name"
            :disabled="currentDevice.name === device.name"
            @click="currentDevice = device"
          >
            <v-list-item-content>
              <v-list-item-title v-text="device.name" />
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-switch v-model="isLandscape" label="Landscape" />
          </v-list-item>
          <v-list-item>
            <v-select label="scale" v-model="currentScale" :items="scaleList" />
          </v-list-item>
        </v-list>
      </v-menu>
      <FileMenu />
    </v-app-bar>
    <div class="canvas-wrapper">
      <div :style="wrapperStyle" style="background: white;">
        <VueCanvas @loaded="loaded" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ElementEditor from "@/components/ElementEditor.vue";
import PageMenu from "@/components/PageMenu.vue";
import ComponentSelectorDialog from "@/components/ComponentSelectorDialog.vue";
import SettingDialog from "@/components/SettingDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import VueCanvas from "@/components/VueCanvas.vue";
import ComponentTreeDialog from "@/components/ComponentTreeDialog.vue";
import { defineComponent, ref, Ref, computed } from "@vue/composition-api";
import { useLocalVue, IframeWindow } from "@/compositions/useLocalVue/";
import { useState } from "@/compositions/useNodeState/";

type Device = {
  name: string;
  height: string;
  width: string;
};
const deviceList: Device[] = [
  { name: "Default", width: "100%", height: "100%" },
  { name: "iPhone 6", width: "375px", height: "667px" },
  { name: "iPhone 6 Plus", width: "414px", height: "736px" },
  { name: "iPad", width: "768px", height: "1024px" }
];
export default defineComponent({
  name: "Home",
  components: {
    PageMenu,
    ElementEditor,
    ComponentSelectorDialog,
    SettingDialog,
    FileMenu,
    VueCanvas,
    ComponentTreeDialog
  },
  setup() {
    const scaleList = ref([
      {
        text: "25%",
        value: 0.25
      },
      {
        text: "50%",
        value: 0.5
      },
      {
        text: "75%",
        value: 0.75
      },
      {
        text: "100%",
        value: 1.0
      }
    ]);
    const devices = ref(deviceList);
    const currentDevice = ref(deviceList[0]);
    const currentScale = ref(0.5);
    const isLandscape = ref(false);
    const wrapperStyle = computed(() =>
      currentDevice.value.name === "Default"
        ? {
            height: isLandscape.value
              ? currentDevice.value.width
              : currentDevice.value.height,
            width: isLandscape.value
              ? currentDevice.value.height
              : currentDevice.value.width
          }
        : {
            height: isLandscape.value
              ? currentDevice.value.width
              : currentDevice.value.height,
            width: isLandscape.value
              ? currentDevice.value.height
              : currentDevice.value.width,
            transform: `scale(${currentScale.value}, ${currentScale.value})`,
            border: "solid black 3px"
          }
    );
    const { init } = useLocalVue();
    const { dragTag, currentRoute } = useState();
    const components = ref<string[]>([]);
    const routing: any = ref({
      push() {
        console.log("not init");
      }
    });
    const addLocalRoute: Ref<(path: string) => void> = ref(() => console.log());
    return {
      isLandscape,
      scaleList,
      currentScale,
      devices,
      currentDevice,
      currentRoute,
      addLocalRoute,
      routing,
      wrapperStyle,
      loaded: async (w: IframeWindow) => {
        const { components: c, router, addRoute } = await init(w);
        console.log("reload");
        components.value = c;
        routing.value = router;
        addLocalRoute.value = addRoute;
      },
      components,
      dragTag
    };
  }
});
</script>
<style lang="scss" scoped>
.canvas-wrapper {
  background: #eee;
  display: flex;
  width: 100%;
  height: calc(100% - 50px);
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
