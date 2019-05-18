module.exports = {
  runtimeCompiler: true,
  transpileDependencies: ["vuex-module-decorators"],
  baseUrl: process.env.DEPLOY === "github" ? "/vue-webpage-builder/" : "/",
  chainWebpack: config => {
    config.module
      .rule("template")
      .test(/\.ejs$/)
      .use("raw-loader")
      .loader("raw-loader");
  }
};
