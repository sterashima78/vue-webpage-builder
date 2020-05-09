import ejs from "ejs/ejs.min.js";
import download from "downloadjs";
import HtmlTemplate from "./Template.ejs";
import { useState } from "./useNodeState";
import { useHtml } from "./useHtml";
import { NodeTree } from "@/types";
import pretty from "pretty";
import { nodeDao } from "@/infrastructure/nodes";

const { nodeTree } = useState(nodeDao);
const { styles, scripts, inlineScript } = useHtml();

const attrToStr = (
  attr: { [name: string]: string | boolean | number } | undefined
) => {
  if (!attr) return "";
  if (Object.keys(attr).length == 0) return "";
  return Object.keys(attr)
    .map(key => `:${key}='${JSON.stringify(attr[key])}'`)
    .join(" ");
};

const styleToStr = (style: { [name: string]: string } | undefined) => {
  if (!style) return "";
  if (Object.keys(style).length == 0) return "";
  return (
    `style="` +
    Object.keys(style)
      .map(key => `${key}:${style[key]}`)
      .join(";") +
    `"`
  );
};
const treeToString = (node: NodeTree): string => {
  return `
    <${node.value.tag
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase()} ${attrToStr(node.value.attributes)} ${styleToStr(
    node.value.style
  )} ${node.value.slot ? ["slot=", '"', node.value.slot, '"'].join("") : ""}>
      ${node.forest.map(n => treeToString(n)).join("")}
       ${node.value.text ? node.value.text : ""}
    </${node.value.tag.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}>`;
};
const selectFile = (): Promise<File> =>
  new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json, application/json";
    input.addEventListener("change", (event: any) => {
      if (event.target.files === null) throw new Error("File not Selected");
      resolve(event.target.files[0] as File);
    });
    input.click();
  });
const readAsText = (file: File): Promise<string> =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
  });
export const importProject = async () => {
  const file = await selectFile();
  const json = await readAsText(file);
  const { node: n, styles: st, scripts: sc, inlineScript: inline } = JSON.parse(
    json
  );
  nodeTree.value = n;
  styles.value = st;
  scripts.value = sc;
  inlineScript.value = inline;
};

export const toHtmlOptions = () => ({
  styles: styles.value,
  nodes: Object.entries(nodeTree.value)
    .map(([path, node]) => [
      `vue-component${path.replace("/", "-")}`,
      treeToString(node)
    ])
    .map(
      ([
        id,
        html
      ]) => `<script type="text/x-template" id="${id}">${html}</script>
    `
    )
    .join(""),
  scripts: scripts.value,
  inlineScript: inlineScript.value,
  path: JSON.stringify(
    Object.keys(nodeTree.value)
      .map(path => [path, `#vue-component${path.replace("/", "-")}`])
      .map(([path, id]) => ({
        path,
        component: { template: id }
      }))
  )
});
export const exportToHtml = () =>
  download(
    pretty(ejs.render(HtmlTemplate, toHtmlOptions())),
    "index.html",
    "text/html"
  );

export const exportToJson = () => {
  download(
    JSON.stringify({
      node: nodeTree.value,
      styles: styles.value,
      scripts: scripts.value,
      inlineScript: inlineScript.value
    }),
    "vue-webpage-project.json",
    "application/json"
  );
};
