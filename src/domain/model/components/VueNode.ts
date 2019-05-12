import { VNodeData } from "vue";

export class VueNode {
  public static of(
    id: string,
    tag: string,
    data: VNodeData,
    childrenId: string[],
    parentId: string
  ) {
    return new VueNode(id, tag, data, childrenId, parentId);
  }

  public static merge(original: VueNode, opt: Partial<VueNode>) {
    return Object.assign({}, original, opt);
  }

  private id: string = "";
  private tag: string = "";
  private data: VNodeData = {};
  private childrenId: string[] = [];
  private parentId: string = "";

  private constructor(
    id: string,
    tag: string,
    data: VNodeData,
    childrenId: string[],
    parentId: string
  ) {
    this.id = id;
    this.tag = tag;
    this.data = data;
    this.childrenId = childrenId;
    this.parentId = parentId;
  }
}
