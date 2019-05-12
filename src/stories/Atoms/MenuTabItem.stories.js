/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from "@storybook/vue";
import { action } from "@storybook/addon-actions";

import MenuTabItem from "@/application/components/atoms/MenuTabItem.vue";

storiesOf("MenuTabItem", module).add("basic", () => ({
  components: { MenuTabItem },
  template:
    '<MenuTabItem><div style="width:100%;height:2000px">aaa</div></MenuTabItem>',
  data() {
    return {
      code: ""
    };
  },
  methods: {
    change(v) {
      this.code = v;
      action("change");
    }
  }
}));
