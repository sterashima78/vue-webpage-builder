import { VNodeData } from "vue";

export interface IVueNode {
  id: string;
  tag: string;
  attr: VNodeData;
  childrenId: string[];
  parentId: string;
}

export interface IVueNodeTree {
  id: string;
  name: string;
  children: IVueNodeTree[];
}

export interface INodesState {
  nodes: {
    [id: string]: IVueNode;
  };
}

export interface IVueNodeTree {
  id: string;
  name: string;
  children: IVueNodeTree[];
}
