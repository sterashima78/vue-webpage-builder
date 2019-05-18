import { VueNode } from "./VueNode";
export class Page {
  private name: string;
  private nodes: VueNode[];
  private constructor(name: string, nodes: VueNode[]) {
    this.name = name;
    this.nodes = nodes;
  }
}
