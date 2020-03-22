import { Tree } from "fp-ts/lib/Tree";
import { VNodeData } from "vue";

type NodeId = string & { readonly _brand: unique symbol };
export type createNodeId = () => NodeId;

type NodeAttributes = object & { readonly _brand: unique symbol };
export type toAttributes = (attr: object) => NodeAttributes;

export interface Node {
  id: string;
  tag: string;
  text?: string;
  attributes?: {
    [name: string]: string | boolean | number;
  };
  style?: {
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

export interface NodeData {
  tag: string;
  data: VNodeData;
  children: Array<NodeData | string>;
}

export interface Resource {
  url: string;
  name: string;
}

export type RouteNodeTree = {
  [path: string]: NodeTree;
};

export type RouteNodeTreeData = {
  [path: string]: NodeData;
};
