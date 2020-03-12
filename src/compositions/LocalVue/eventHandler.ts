import { ref, Ref, computed } from "@vue/composition-api";
import { NodeTree, Node, NodeData } from "@/types";
import { make, tree, duplicate, flatten, reduce, chain } from "fp-ts/lib/Tree";
import { fromNullable, map, getOrElse, Option, fold } from "fp-ts/es6/Option";
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
      id => (updateTo.value = id)
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

export const cancelEvent = ($event: MouseEvent) => {
  $event.stopPropagation();
  $event.preventDefault();
};

export const mouseOver = updateEventTargetId;
export const mouseLeave = clearEventTargetId;

export const dragEnter = updateEventTargetId;
export const dragLeave = clearEventTargetId;

export const dragStart = updateEventTargetId;
export const dragEnd = clearEventTargetId;

export const drop = (
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

export const createEvents = (
  hoverId: Ref<string>,
  dragId: Ref<string>,
  dragTag: Ref<string>,
  dropId: Ref<string>,
  addNodeTo: (to: string, target: NodeTree) => void,
  moveNodeTo: (to: string, target: string) => void
) => ({
  mouseover: mouseOver(hoverId),
  mouseenter: cancelEvent,
  mouseleave: mouseLeave(hoverId),
  dragenter: dragEnter(dropId),
  dragleave: dragLeave(dropId),
  dragover: cancelEvent,
  dragstart: dragStart(dragId),
  dragend: dragEnd(dragId),
  drop: drop(dragTag, dragId, dropId, addNodeTo, moveNodeTo)
});
