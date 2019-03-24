import { IVueNodeTree, IVueNode } from "@/types";
import Optional from "typescript-optional";
import pretty from "pretty";
const toString = (
  rootId: string,
  nodes: { [id: string]: IVueNode },
  isFormat = false
) => {
  const node = nodes[rootId];
  return isFormat ? pretty(genNode(node, nodes)) : genNode(node, nodes);
};

const genNode = (node: IVueNode, nodes: { [id: string]: IVueNode }): string => {
  const tag = node.tag;
  const a = genAttrs(node.attr.attrs as { [prop: string]: string });
  const c = genClasses(node.attr.class);
  const s = genStyles(node.attr.style as { [prop: string]: string });
  const attrs = [tag, a, c, s].filter(i => i.length !== 0).join(" ");
  const tagOpen = `<${attrs}>`;
  const tagClose = `</${tag}>`;
  const content = genChildren(node.childrenId, nodes);
  return `${tagOpen}${content}${tagClose}`;
};
const genChildren = (children: string[], nodes: { [id: string]: IVueNode }) => {
  const contents = children
    .map(key => {
      return nodes[key] ? genNode(nodes[key], nodes) : key;
    })
    .join(" ");
  return contents;
};

const genStyles = (styles: { [prop: string]: string } | undefined) => {
  return Optional.ofNullable(styles)
    .map(s => {
      return Object.keys(s)
        .sort()
        .map(prop => `${prop}:${s[prop]};`)
        .join("");
    })
    .map(p => (p.length === 0 ? "" : `style="${p}"`))
    .orElse("");
};

const genClasses = (classes: string[] | undefined) => {
  return Optional.ofNullable(classes)
    .map(c => c.sort().join(" "))
    .map(p => (p.length === 0 ? "" : `class="${p}"`))
    .orElse("");
};

const genAttrs = (attrs: { [prop: string]: string } | undefined) => {
  return Optional.ofNullable(attrs)
    .map(s => {
      return Object.keys(s)
        .sort()
        .map(prop => `${prop}="${s[prop]}"`)
        .join(" ");
    })
    .orElse("");
};

export default toString;
