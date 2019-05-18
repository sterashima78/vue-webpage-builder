import ejs from "ejs";
import download from "downloadjs";
import HtmlTemplate from "./HtmlTemplate.ejs";
import toString from "@/util/toString";
import { IVueNode } from "@/types";
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
    const nodesStr = toString(id, nodes, true);
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
};
