module.exports = {
  devServer: {
    disableHostCheck: true
  },
  transpileDependencies: ["vuetify"],
  chainWebpack: config => {
    config.module
      .rule("template")
      .test(/\.ejs$/)
      .use("raw-loader")
      .loader("raw-loader");
  }
};
