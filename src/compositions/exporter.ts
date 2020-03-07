import ejs from "ejs/ejs.min.js";
import download from "downloadjs";
import HtmlTemplate from "./Template.ejs";
import { NodeTree } from "@/types";
import pretty from "pretty";

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
  return JSON.parse(json);
};
export const exportToHtml = (
  node: NodeTree,
  style: Resource[],
  script: Resource[],
  inlineScript: string
) => {
  const template = ejs.render(HtmlTemplate, {
    style,
    nodes: pretty(treeToString(node)),
    script,
    inlineScript
  });
  download(template, "index.html", "text/html");
};

export const exportToJson = (
  node: NodeTree,
  style: Resource[],
  script: Resource[],
  inlineScript: string
) => {
  download(
    JSON.stringify({
      node,
      style,
      script,
      inlineScript
    }),
    "vue-webpage-project.json",
    "application/json"
  );
};
