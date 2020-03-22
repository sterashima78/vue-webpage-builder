import { Resource } from "@/types";
import { Ref, ref, computed } from "@vue/composition-api";

const scripts: Ref<Resource[]> = ref([
  {
    name: "element-ui",
    url: "https://unpkg.com/element-ui/lib/index.js"
  }
]);
const styles: Ref<Resource[]> = ref([
  {
    name: "element-ui",
    url: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
  }
]);

const body = `<div id='main-wrapper' />`;
const inlineScript = ref(
  '/** before created vue */\n \
      console.log(window.vm);\n \
      /** Custom Component */\n \
      Vue.component("MyButton", {name: "MyButton",template: "<button>MyButton</button>"});\n \
      /** after created vue */\n \
      window.addEventListener("createdVue", ()=> console.log(window.vm));'.replace(
    /^ +|\n +/g,
    "\n"
  )
);
const stylesStr = "";

export const useHtml = () => {
  const scriptsSrc = computed(() => [
    "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.js",
    "https://unpkg.com/vue-router/dist/vue-router.js",
    ...scripts.value.map(i => i.url)
  ]);
  const cssLinks = computed(() => styles.value.map(i => i.url));
  return {
    scripts,
    styles,
    scriptsSrc,
    cssLinks,
    body,
    inlineScript,
    stylesStr
  };
};
