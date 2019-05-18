import { VueNode } from "./VueNode";
export class Component {
  private name: string;
  private nodes: VueNode[];
  private constructor(name: string, nodes: VueNode[]) {
    this.name = name;
    this.nodes = nodes;
  }
}
