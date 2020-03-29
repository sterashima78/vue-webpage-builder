<template>
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
</template>
<script lang="ts">
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
import { defineComponent, ref, watch, computed } from "@vue/composition-api";
export default defineComponent({
  setup(_, { emit }) {
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
    watch(wrapperStyle, (v: any) => emit("update", v));
    return {
      scaleList,
      currentDevice,
      devices,
      currentScale,
      isLandscape
    };
  }
});
</script>
