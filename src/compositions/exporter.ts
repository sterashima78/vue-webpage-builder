import ejs from "ejs/ejs.min.js";
import download from "downloadjs";
import HtmlTemplate from "./Template.ejs";
import { useState } from "./store";
import { useHtml } from "./useHtml";
import { NodeTree } from "@/types";
import pretty from "pretty";

const { node } = useState();
const { styles, scripts, inlineScript } = useHtml();
interface Resource {
  url: string;
  name: string;
}

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
    <${node.value.tag} ${attrToStr(node.value.attributes)} ${styleToStr(
    node.value.style
  )}>
      ${node.forest.map(n => treeToString(n)).join("")}
       ${node.value.text ? node.value.text : ""}
    </${node.value.tag}>`;
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
  const { nodes, styles, scripts, inlineScript } = JSON.parse(json);
  node.value = nodes;
  styles.value = styles;
  scripts.value = scripts;
  inlineScript.value = inlineScript;
};
export const exportToHtml = () => {
  const template = ejs.render(HtmlTemplate, {
    styles: styles.value,
    nodes: pretty(treeToString(node.value)),
    scripts: scripts.value,
    inlineScript: inlineScript.value
  });
  download(template, "index.html", "text/html");
};

export const exportToJson = () => {
  download(
    JSON.stringify({
      node: node.value,
      styles: styles.value,
      scripts: scripts.value,
      inlineScript: inlineScript.value
    }),
    "vue-webpage-project.json",
    "application/json"
  );
};
