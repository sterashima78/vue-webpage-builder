import Optional from "typescript-optional";
import Nodes from "@/store/modules/nodes";

interface VueWebBuilderElement extends HTMLElement {
  __VUE_WEB_BUILDER_ID__: string;
  parentElement: VueWebBuilderElement;
}

export const targetNodeIdEqualsTo = (
  target: VueWebBuilderElement,
  id: string
): boolean => {
  return getNodeId(target) === id;
};

export const getNodeId = (target: VueWebBuilderElement | null): string => {
  const ele = getNode(target);
  if (ele === null) {
    return "";
  }
  return ele.__VUE_WEB_BUILDER_ID__;
};

export const getNode = (
  target: VueWebBuilderElement | null
): VueWebBuilderElement | null => {
  if (target === null) {
    return null;
  }
  if (target.__VUE_WEB_BUILDER_ID__ !== undefined) {
    return target;
  }

  if (target.parentElement === null) {
    return null;
  }
  if (target.parentElement.__VUE_WEB_BUILDER_ID__ === undefined) {
    return getNode(target.parentElement);
  }
  return target.parentElement;
};

export const dragStart = (event: DragEvent): void => {
  event.stopPropagation();

  if (
    targetNodeIdEqualsTo(event.target as VueWebBuilderElement, Nodes.draggingId)
  ) {
    return;
  }
  Nodes.DRAG_START(getNodeId(event.target as VueWebBuilderElement));
  Optional.ofNullable(event.dataTransfer).ifPresent(transfer => {
    const id = getNodeId(event.target as VueWebBuilderElement);
    transfer.setData("text/plain", id);
  });
};

export const dragEnd = (event: DragEvent) => {
  event.stopPropagation();
  Optional.ofNullable(event.dataTransfer).ifPresent(transfer => {
    transfer.setData("text/plain", "");
  });
  Nodes.DRAG_END();
};

export const dragEnter = (event: DragEvent) => {
  Optional.ofNullable(
    getNodeId(event.target as VueWebBuilderElement)
  ).ifPresent((id: string) => {
    event.stopPropagation();
    Nodes.SET_DROP_TARGET(id);
  });
};

export const dragLeave = (event: DragEvent) => {
  Optional.ofNullable(
    getNodeId(event.target as VueWebBuilderElement)
  ).ifPresent((id: string) => {
    event.stopPropagation();
    Nodes.REMOVE_DROP_TARGET(id);
  });
};

export const mouseEnter = (event: MouseEvent) => {
  Optional.ofNullable(
    getNodeId(event.target as VueWebBuilderElement)
  ).ifPresent((id: string) => {
    event.stopPropagation();
    Nodes.SET_HOVER_ELEMENT(id);
  });
};

export const mouseLeave = (event: MouseEvent) => {
  Optional.ofNullable(
    getNodeId(event.target as VueWebBuilderElement)
  ).ifPresent((id: string) => {
    event.stopPropagation();
    Nodes.REMOVE_HOVER_ELEMENT(id);
  });
};

export const drop = (event: DragEvent) => {
  event.stopPropagation();
  if (Nodes.draggingId !== "") {
    dropFromCanvas(event);
    return;
  }

  if (Nodes.newCmpName !== "") {
    dropFromTab(event);
    return;
  }
};

const dropFromTab = (event: DragEvent) => {
  Optional.ofNullable(
    getNodeId(event.target as VueWebBuilderElement)
  ).ifPresent((id: string) => {
    Nodes.CREATE_ELEMENT_IN(id);
    Nodes.REMOVE_DROP_TARGET(id);
  });
};

const dropFromCanvas = (event: DragEvent) => {
  Optional.ofNullable(
    getNodeId(event.target as VueWebBuilderElement)
  ).ifPresent((id: string) => {
    Nodes.REMOVE_DROP_TARGET(id);
  });
  Optional.ofNullable(event.dataTransfer)
    .map(transfer => {
      return transfer.getData("text/plain");
    })
    .ifPresent((nodeId: string) => {
      const node = Nodes.nodes[nodeId];
      const id = getNodeId(event.target as VueWebBuilderElement);
      if (node.parentId === "") {
        Nodes.MOVE_ELEMENT_IN({ eleId: node.id, targetId: id });
      } else {
        if (Nodes.isSort) {
          Nodes.MOVE_ELEMENT_TO({ eleId: node.id, targetId: id });
        } else {
          Nodes.MOVE_ELEMENT_IN({ eleId: node.id, targetId: id });
        }
      }
    });
};
