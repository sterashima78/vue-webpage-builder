import ejs from "ejs/ejs.min.js";
import download from "downloadjs";
import HtmlTemplate from "./Template.ejs";
import { useState } from "./useNodeState";
import { useHtml } from "./useHtml";
import { NodeTree } from "@/types";
import pretty from "pretty";

const { nodeTree } = useState();
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
  )}>
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
export const exportToHtml = () => {
  const path = JSON.stringify(
    Object.keys(nodeTree.value).map(path => ({
      path,
      component: {
        template: `#vue-component${path.replace("/", "-")}`
      }
    }))
  );
  const template = ejs.render(HtmlTemplate, {
    styles: styles.value,
    nodes: pretty(
      Object.keys(nodeTree.value)
        .map(
          path => `
      <script type="text/x-template" id="vue-component${path.replace(
        "/",
        "-"
      )}">
        ${treeToString(nodeTree.value[path])}
      </script>
    `
        )
        .join("")
    ),
    scripts: scripts.value,
    inlineScript: inlineScript.value,
    path
  });
  download(pretty(template), "index.html", "text/html");
};

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
