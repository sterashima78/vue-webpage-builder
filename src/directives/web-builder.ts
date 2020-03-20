import { VueConstructor } from "vue";
import { Ref, watch } from "@vue/composition-api";
import { NodeTree, Node } from "@/types";
import { tree } from "fp-ts/lib/Tree";
import { fromNullable, map, Option, fold } from "fp-ts/es6/Option";
import { pipe } from "fp-ts/lib/pipeable";

const stopEvent = (e: MouseEvent) => {
  e.stopPropagation();
  return e;
};

const eventToHtmlTarget = (e: MouseEvent): Option<HTMLElement> =>
  fromNullable(e.target as HTMLElement | undefined);

const getId = (ele: HTMLElement) => ele.id;

const getEventTargetId = ($event: MouseEvent): Option<string> =>
  pipe($event, stopEvent, eventToHtmlTarget, map(getId));

const updateEventTargetId = (updateTo: Ref<string>) => ($event: MouseEvent) =>
  pipe(
    $event,
    getEventTargetId,
    fold(
      () => console.log("id is none"),
      id => {
        updateTo.value = id;
      }
    )
  );
const clearEventTargetId = (clearTo: Ref<string>) => ($event: MouseEvent) =>
  pipe(
    $event,
    getEventTargetId,
    fold(
      () => console.log("id is none"),
      id => {
        if (clearTo.value === id || "root" === id) clearTo.value = "";
      }
    )
  );

const cancelEvent = ($event: MouseEvent) => {
  $event.stopPropagation();
  $event.preventDefault();
};

const mouseOver = updateEventTargetId;
const mouseLeave = clearEventTargetId;

const dragEnter = updateEventTargetId;
const dragLeave = clearEventTargetId;

const dragStart = updateEventTargetId;
const dragEnd = clearEventTargetId;

const drop = (
  dragTag: Ref<string>,
  dragNodeId: Ref<string>,
  dropNodeId: Ref<string>,
  addNodeTo: (to: string, target: NodeTree) => void,
  moveNodeTo: (to: string, target: string) => void
) => ($event: MouseEvent) => {
  $event.stopPropagation();
  if (dragTag.value !== "") {
    addNodeTo(
      dropNodeId.value,
      tree.of<Node>({
        tag: dragTag.value,
        id: Math.random().toString(32),
        text: "default"
      })
    );
    dragTag.value = "";
  }
  if (dragNodeId.value !== "") {
    moveNodeTo(dropNodeId.value, dragNodeId.value);
    dragNodeId.value = "";
  }
  dropNodeId.value = "";
};

export const registerDirective = (
  hoverId: Ref<string>,
  dragId: Ref<string>,
  dragTag: Ref<string>,
  dropId: Ref<string>,
  addNodeTo: (to: string, target: NodeTree) => void,
  moveNodeTo: (to: string, target: string) => void,
  vue: VueConstructor
) => {
  const mouseover = mouseOver(hoverId);
  const mouseenter = cancelEvent;
  const mouseleave = mouseLeave(hoverId);
  const dragenter = dragEnter(dropId);
  const dragleave = dragLeave(dropId);
  const dragover = cancelEvent;
  const dragstart = dragStart(dragId);
  const dragend = dragEnd(dragId);
  const _drop = drop(dragTag, dragId, dropId, addNodeTo, moveNodeTo);
  watch(
    () => dragId.value,
    v => `dropId = ${v}`
  );
  vue.directive("web-builder", {
    bind(el: HTMLElement) {
      el.addEventListener("mouseover", mouseover);
      el.addEventListener("mouseenter", mouseenter);
      el.addEventListener("mouseleave", mouseleave);
      el.addEventListener("dragenter", dragenter);
      el.addEventListener("dragleave", dragleave);
      el.addEventListener("dragover", dragover);
      el.addEventListener("dragstart", dragstart);
      el.addEventListener("dragend", dragend);
      el.addEventListener("drop", _drop);
    },
    unbind(el: HTMLElement) {
      el.removeEventListener("mouseover", mouseover);
      el.removeEventListener("mouseenter", mouseenter);
      el.removeEventListener("mouseleave", mouseleave);
      el.removeEventListener("dragenter", dragenter);
      el.removeEventListener("dragleave", dragleave);
      el.removeEventListener("dragover", dragover);
      el.removeEventListener("dragstart", dragstart);
      el.removeEventListener("dragend", dragend);
      el.removeEventListener("drop", _drop);
    }
  });
};
