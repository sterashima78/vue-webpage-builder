/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from "@storybook/vue";
import { action } from "@storybook/addon-actions";

import ComponentPanel from "@/application/components/atoms/ComponentPanel.vue";

storiesOf("ComponentPanel", module)
  .add("basic", () => ({
    components: { ComponentPanel },
    template: '<ComponentPanel componentName="hoge"/>',
    data(){
      return {
        code: ""
      }
    },
    methods: { 
      change(v) {
        this.code = v
        action("change")
      }
    }
  }))
