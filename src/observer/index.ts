import { Subject } from "rxjs";
import { IVueNode, IVueNodeTree } from "@/types";

export const nodeSubject: Subject<{ [id: string]: IVueNode }> = new Subject();
export const mouseSubject: Subject<{
  hoverId: string;
  draggingId: string;
  dropTargetId: string;
}> = new Subject();
export const editTargetSubject: Subject<IVueNode> = new Subject();
export const treeSubject: Subject<IVueNodeTree[]> = new Subject();

nodeSubject.subscribe(nodes => {
  const tree = Object.keys(nodes)
    .filter((id: string) => nodes[id].parentId === "")
    .map((id: string) => nodes[id])
    .map(node => buildTree(node, nodes))
    .filter(n => n.id !== "");
  treeSubject.next(tree);
});

const buildTree = (
  node: IVueNode,
  allNodes: { [id: string]: IVueNode }
): IVueNodeTree => {
  return {
    id: node.id,
    name: node.tag,
    children: node.childrenId.reduce(
      (arr: IVueNodeTree[], id: string): IVueNodeTree[] => {
        if (!allNodes[id]) {
          return arr;
        }
        arr.push(buildTree(allNodes[id], allNodes));
        return arr;
      },
      []
    )
  };
};
