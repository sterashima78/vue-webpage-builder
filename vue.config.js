module.exports = {
  runtimeCompiler: true,
  transpileDependencies: ["vuex-module-decorators"],
  baseUrl: process.env.NODE_ENV === 'production:github'
    ? '/vue-webpage-builder/'
    : '/'
  
};
