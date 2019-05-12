import Vue from "vue";
import Render from "vue-server-renderer";
import HtmlTemplate from "./HtmlTemplate.vue";

const renderer = Render.createRenderer();

export const toHtml = (style, id, nodes, script, inlineScript) => {
  const app = new Vue({
    template: "<HtmlTemplate style, id, nodes, script, inlineScript />",
    components: {
      HtmlTemplate
    },
    data: {
      style,
      id,
      nodes,
      script,
      inlineScript
    }
  });
  return renderer.renderToString(app);
};
