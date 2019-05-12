/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from "@storybook/vue";
import { action } from "@storybook/addon-actions";

import Ace from "@/application/components/atoms/Ace.vue";

storiesOf("Ace Editor", module)
  .add("basic", () => ({
    components: { Ace },
    template: '<div style="width:500px;height:250px"><Ace @change="change" :code="code" /></div>',
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
