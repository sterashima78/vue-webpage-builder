<template>
  <div
    ref="win"
    v-show="isActive"
    class="draggable-window"
    :style="position"
    @pointerup="dragend"
  >
    <div
      v-for="pos in ['tl', 'tr', 'cl', 'cr', 'bl', 'br']"
      :key="pos"
      class="handle"
      :class="[pos]"
      @pointerdown="
        resizeStart(
          $event.target,
          $event.pointerId,
          $event.clientX,
          $event.clientY,
          pos
        )
      "
      @pointerup="resizeStop($event.target, $event.pointerId)"
    />
    <v-card style="height: 100%">
      <v-toolbar class="drag-handle" @pointerdown="dragstart">
        <v-toolbar-title><slot name="title"/></v-toolbar-title>
      </v-toolbar>
      <v-card-text style="height: calc(100% - 55px);">
        <slot />
      </v-card-text>
    </v-card>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, computed } from "@vue/composition-api";
type ResizeDirection = "tl" | "tr" | "cl" | "cr" | "bl" | "br" | null;
export default defineComponent({
  props: {
    isActive: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  setup() {
    const _position = ref({ x: 20, y: 20 });
    const position = computed(() => ({
      top: `${_position.value.y}px`,
      left: `${_position.value.x}px`
    }));
    let lastExecTime = 0;
    let start = { x: 0, y: 0 };
    let before = { x: 0, y: 0 };
    const win = ref<HTMLElement | null>(null);

    const slide = (e: any) => {
      const elapsedTime = performance.now() - lastExecTime;
      if (elapsedTime > 100) {
        _position.value = {
          x: before.x + e.clientX - start.x,
          y: before.y + e.clientY - start.y
        };
        lastExecTime = performance.now();
      }
    };

    const beginSliding = (e: any) => {
      if (!win.value) return;
      const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY };
      before = { x, y };
      win.value.onpointermove = slide;
      win.value.setPointerCapture(e.pointerId);
    };

    const stopSliding = (e: any) => {
      if (!win.value) return;
      win.value.releasePointerCapture(e.pointerId);
      win.value.onpointermove = null;
    };
    let dir: ResizeDirection = null;
    const resize = (e: any) => {
      if (!win.value) return;
      const elapsedTime = performance.now() - lastExecTime;
      if (elapsedTime > 100) {
        const { x, y } = e.target.getBoundingClientRect();
        const size = { x: e.clientX - x, y: e.clientY - y };
        switch (dir) {
          case "tl":
            _position.value.x = _position.value.x + size.x;
            _position.value.y = _position.value.y + size.y;
            win.value.style.width = `${win.value.clientWidth - size.x}px`;
            win.value.style.height = `${win.value.clientHeight - size.y}px`;
            break;
          case "tr":
            _position.value.y = _position.value.y + size.y;
            win.value.style.width = `${win.value.clientWidth + size.x}px`;
            win.value.style.height = `${win.value.clientHeight - size.y}px`;
            break;
          case "cl":
            _position.value.x = _position.value.x + size.x;
            win.value.style.width = `${win.value.clientWidth - size.x}px`;
            break;
          case "cr":
            win.value.style.width = `${win.value.clientWidth + size.x}px`;
            break;
          case "bl":
            _position.value.x = _position.value.x + size.x;
            win.value.style.width = `${win.value.clientWidth - size.x}px`;
            win.value.style.height = `${win.value.clientHeight + size.y}px`;
            break;
          case "br":
            win.value.style.width = `${win.value.clientWidth + size.x}px`;
            win.value.style.height = `${win.value.clientHeight + size.y}px`;
            break;
          default:
            break;
        }
        lastExecTime = performance.now();
      }
    };
    return {
      win,
      dragstart: beginSliding,
      dragend: stopSliding,
      position,
      resizeStart: (
        ele: HTMLElement,
        pointerId: number,
        x: number,
        y: number,
        type: ResizeDirection
      ) => {
        ele.setPointerCapture(pointerId);
        dir = type;
        ele.onpointermove = resize;
      },
      resizeStop: (ele: HTMLElement, pointerId: number) => {
        ele.releasePointerCapture(pointerId);
        ele.onpointermove = null;
      }
    };
  }
});
</script>
<style lang="scss" scoped>
.drag-handle {
  cursor: move;
}
.draggable-window {
  position: absolute;
  height: 400px;
  width: 300px;
}
.handle {
  height: 10px;
  width: 10px;
  border: 1px solid black;
  position: absolute;
  background: white;
  &.tl {
    top: -10px;
    left: -10px;
    cursor: nwse-resize;
  }
  &.tr {
    top: -10px;
    right: -10px;
    cursor: nesw-resize;
  }
  &.bl {
    bottom: -10px;
    left: -10px;
    cursor: nesw-resize;
  }
  &.br {
    bottom: -10px;
    right: -10px;
    cursor: nwse-resize;
  }
  &.cl {
    top: calc(50% - 5px);
    left: -10px;
    cursor: ew-resize;
  }
  &.cr {
    top: calc(50% - 5px);
    right: -10px;
    cursor: ew-resize;
  }
}
</style>
