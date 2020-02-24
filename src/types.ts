import { Tree } from "fp-ts/lib/Tree";
import { VNode } from "vue";

type NodeId = string & { readonly _brand: unique symbol };
export type createNodeId = () => NodeId;

type NodeAttributes = object & { readonly _brand: unique symbol };
export type toAttributes = (attr: object) => NodeAttributes;

export interface Node {
  id: string;
  tag: string;
  text?: string;
  attributes?: {
    [name: string]: string;
  };
  classes?: string[];
  on?: {
    [event: string]: (event: any) => void;
  };
  domProps?: {
    [name: string]: string;
  };
}

export type NodeTree = Tree<Node>;

export type toVNode = (node: Node) => VNode;
