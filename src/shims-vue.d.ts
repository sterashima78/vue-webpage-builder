declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "*.ejs" {
  const value: any;
  export default value;
}

declare module "ejs/ejs.min.js" {
  import ejs from "ejs";
  export default ejs;
}

declare module "vue-iframe-sandbox";
declare module "vue-draggable-resizable";
