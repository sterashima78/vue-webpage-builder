import { Ref, computed, ref, watch } from "@vue/composition-api";
import { NodeData, RouteNodeTree, RouteNodeTreeData } from "@/types";
import { CreateElement, VNode } from "vue";
import Worker from "worker-loader!./createNodeData.worker";
import throttle from "lodash.throttle";
export const createRenderer = (
  node: Ref<RouteNodeTree>,
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>
) => {
  const renderNode = (
    h: CreateElement,
    { tag, data, children }: NodeData
  ): VNode =>
    h(
      tag,
      {
        ...data
      },
      children.map(i => (typeof i === "string" ? i : renderNode(h, i)))
    );
  const _nodeData = ref<RouteNodeTreeData>({});
  const nodeData = computed(() => _nodeData.value);
  const worker = new Worker();
  worker.onmessage = (event: any) => {
    _nodeData.value = event.data;
  };
  const sendMsg = throttle(
    () =>
      worker.postMessage({
        hoverNodeId: hoverNodeId.value,
        dropNodeId: dropNodeId.value,
        node: node.value
      }),
    16
  );
  watch(() => node.value, sendMsg);
  watch(() => hoverNodeId.value, sendMsg);
  watch(() => dropNodeId.value, sendMsg);
  return {
    renderNode,
    nodeData
  };
};
