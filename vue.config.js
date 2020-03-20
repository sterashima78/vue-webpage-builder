module.exports = {
  devServer: {
    disableHostCheck: true
  },
  publicPath:
    process.env.NODE_ENV === "production" ? "/vue-webpage-builder/" : "/",
  transpileDependencies: ["vuetify"],
  chainWebpack: config => {
    config.module
      .rule("template")
      .test(/\.ejs$/)
      .use("raw-loader")
      .loader("raw-loader");
  }
};
