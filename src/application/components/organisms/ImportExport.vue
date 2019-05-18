<template>
<MenuTabItem>
  <p>
    <v-btn @click="downloadHtml">Download</v-btn>
  </p>
  <p>
    <v-btn @click="exportJson">Export</v-btn>
  </p>
  <p>
    <label>
      <span>Import: </span>
      <input 
        type="file" 
        @change="importJson($event.target.files)" 
        accept='application/json'
      />
    </label>
  </p>
</MenuTabItem>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import clone from "lodash.clonedeep";
import MenuTabItem from "@/application/components/atoms/MenuTabItem.vue";
import download from "downloadjs";
@Component({
  components: {
    MenuTabItem
  }
})
export default class ImportExport extends Vue {
  private downloadHtml() {
    this.$emit("download");
  }

  private exportJson() {
    this.$emit("export");
  }

  private importJson(file: FileList) {
    const reader = new FileReader();
    reader.onload = event => {
      // @ts-ignore
      const json = event.target.result;
      try {
        this.$emit("import", JSON.parse(json));
      } catch (e) {
        alert("インポートに失敗しました");
      }
    };
    reader.readAsText(file[0]);
  }
}
</script>
