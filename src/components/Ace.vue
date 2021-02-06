<template>
  <div style="width: 100%; height: 100%;" ref="editor" />
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  onMounted,
  ref,
  PropType
} from "@vue/composition-api";
import * as ace from "brace";
import "brace/mode/javascript";
import "brace/theme/monokai";
export default defineComponent({
  props: {
    code: {
      type: String as PropType<string>,
      default: ""
    },
    lang: {
      type: String as PropType<string>,
      default: "javascript"
    },
    theme: {
      type: String as PropType<string>,
      default: "monokai"
    }
  },
  setup(props: { code: string; lang: string; theme: string }, { emit }) {
    const editor = ref<HTMLElement>();
    const init = () => {
      if (editor.value === undefined) {
        setTimeout(init, 100);
        return;
      }
      const aceEditor = ace.edit(editor.value);
      watch(
        () => props.code,
        val => {
          if (val !== aceEditor.getValue()) {
            aceEditor.setValue(val, 1);
          }
        },
        {
          immediate: true
        }
      );
      aceEditor.setValue(props.code, 1);
      aceEditor.getSession().setMode(`ace/mode/${props.lang}`);
      aceEditor.setTheme(`ace/theme/${props.theme}`);
      aceEditor.on("change", () => {
        emit("change", aceEditor.getValue());
      });
    };
    onMounted(init);
    return { editor };
  }
});
</script>
