import { ref } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import { pipe } from "fp-ts/es6/pipeable";
export const useLocalVue = () => {
  const components = ref<string[]>([]);
  const init = (w: Window & { Vue?: VueConstructor<Vue> }) => {
    if (w.Vue === undefined) {
      return setTimeout(init, 100);
    }
    components.value = pipe(
      fromNullable(w.Vue as any),
      map(i => i.options),
      map(i => i.components),
      map(i => Object.keys(i)),
      getOrElse(() => [] as string[])
    );
    const vm = ref(
      new w.Vue({
        el: "#main-wrapper",
        render(h) {
          const list = [
            "default",
            "primary",
            "success",
            "info",
            "warning",
            "danger"
          ];
          return h("div", [
            h(
              "el-row",
              list.map(type => h("el-button", { attrs: { type } }, [type]))
            ),
            h(
              "el-row",
              list.map(type =>
                h("el-button", { attrs: { type, plain: true } }, [type])
              )
            ),
            h(
              "el-row",
              list.map(type =>
                h("el-button", { attrs: { type, round: true } }, [type])
              )
            )
          ]);
        }
      })
    );
  };
  return { init, components };
};
