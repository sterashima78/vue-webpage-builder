import ejs from "ejs";
import HtmlTemplate from "./HtmlTemplate.ejs";

export const toHtml = (
  style: any,
  id: any,
  nodes: any,
  script: any,
  inlineScript: string
) => {
  return ejs.render(HtmlTemplate, { style, id, nodes, script, inlineScript });
};
