import { Resource } from "@/types";
import { Ref, ref, computed } from "@vue/composition-api";

const scripts: Ref<Resource[]> = ref([
  {
    name: "element-ui",
    url: "https://unpkg.com/element-ui@2.15.0/lib/index.js"
  }
]);
const styles: Ref<Resource[]> = ref([
  {
    name: "element-ui",
    url: "https://unpkg.com/element-ui@2.15.0/lib/theme-chalk/index.css"
  }
]);

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

const store = {
  scripts,
  styles
};

export const add = (state: typeof store, resource: "styles" | "scripts") => (
  item: Resource
) => {
  state[resource].value.push(item);
};

export const remove = (state: typeof store, resource: "styles" | "scripts") => (
  key: string
) => {
  state[resource].value = state[resource].value.filter(
    ({ name }) => name !== key
  );
};

export const toUrlList = (list: Ref<Resource[]>, urls: string[]) => () => [
  ...urls,
  ...list.value.map(i => i.url)
];

export const useHtml = () => {
  return {
    scripts,
    styles,
    scriptsSrc: computed(
      toUrlList(scripts, [
        "https://unpkg.com/vue@2.6.12/dist/vue.js",
        "https://unpkg.com/vue-router@3.5.1/dist/vue-router.js"
      ])
    ),
    cssLinks: computed(toUrlList(styles, [])),
    inlineScript,
    stylesStr,
    addScript: add(store, "scripts"),
    addStyle: add(store, "styles"),
    removeScript: remove(store, "scripts"),
    removeStyle: remove(store, "styles")
  };
};
