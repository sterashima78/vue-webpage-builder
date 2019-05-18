
// tslint:disable-next-line:no-var-requires
const Case = require("to-case");
import ejs from "ejs/ejs.min.js";
import download from "downloadjs";
import HtmlTemplate from "./HtmlTemplate.ejs";
import { IVueNode } from "@/types";
import Optional from "typescript-optional";
import pretty from "pretty";

export const ExporterService = class {
  public downloadHtml(
    nodes: { [id: string]: IVueNode },
    style: { [id: string]: { name: string; url: string } },
    script: { [id: string]: { name: string; url: string } },
    inlineScript: string
  ) {
    const id = Object.keys(nodes)
      .filter(i => nodes[i].parentId === "")
      .map(i => nodes[i].id)[0];
    const nodesStr = this.toString(id, nodes, true);
    const template = ejs.render(HtmlTemplate, {
      style,
      nodes: nodesStr,
      script,
      inlineScript
    });
    download(template, "index.html", "text/html");
  }

  public downloadJson(
    nodes: { [id: string]: IVueNode },
    styles: { [id: string]: { name: string; url: string } },
    scripts: { [id: string]: { name: string; url: string } },
    inlineScript: string
  ) {
    download(
      JSON.stringify({
        nodes,
        styles,
        scripts,
        inlineScript
      }),
      "project.json",
      "application/json"
    );
  }

  public toString(
    rootId: string,
    nodes: { [id: string]: IVueNode },
    isFormat: boolean = false
  ) {
    const node = nodes[rootId];
    return isFormat
      ? pretty(this.genNode(node, nodes))
      : this.genNode(node, nodes);
  }

  private genNode(node: IVueNode, nodes: { [id: string]: IVueNode }): string {
    const tag = node.tag;
    const a = this.genAttrs(node.attr.attrs as { [prop: string]: string });
    const c = this.genClasses(node.attr.class);
    const s = this.genStyles(node.attr.style as { [prop: string]: string });
    const attrs = [Case.slug(tag), a, c, s]
      .filter(i => i.length !== 0)
      .join(" ");
    const tagOpen = `<${attrs}>`;
    const tagClose = `</${Case.slug(tag)}>`;
    const content = this.genChildren(node.childrenId, nodes);
    return `${tagOpen}${content}${tagClose}`;
  }

  private genChildren(children: string[], nodes: { [id: string]: IVueNode }) {
    const contents = children
      .map(key => {
        return nodes[key] ? this.genNode(nodes[key], nodes) : key;
      })
      .join(" ");
    return contents;
  }

  private genStyles(styles: { [prop: string]: string } | undefined) {
    return Optional.ofNullable(styles)
      .map(s => {
        return Object.keys(s)
          .sort()
          .map(prop => `${prop}:${s[prop]};`)
          .join("");
      })
      .map(p => (p.length === 0 ? "" : `style="${p}"`))
      .orElse("");
  }

  private genClasses(classes: string[] | undefined) {
    return Optional.ofNullable(classes)
      .map(c => c.sort().join(" "))
      .map(p => (p.length === 0 ? "" : `class="${p}"`))
      .orElse("");
  }

  private genAttrs(attrs: { [prop: string]: string } | undefined) {
    return Optional.ofNullable(attrs)
      .map(s => {
        return Object.keys(s)
          .sort()
          .map(prop => `${prop}="${s[prop]}"`)
          .join(" ");
      })
      .orElse("");
  }
};
