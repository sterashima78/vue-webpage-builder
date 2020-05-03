import { VueConstructor } from "vue";
import { Ref } from "@vue/composition-api";
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

const drop = (dropElement: () => void) => ($event: MouseEvent) => {
  $event.stopPropagation();
  dropElement();
};

export const registerDirective = (
  hoverId: Ref<string>,
  dragId: Ref<string>,
  dropId: Ref<string>,
  dropElement: () => void,
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
  const _drop = drop(dropElement);
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
