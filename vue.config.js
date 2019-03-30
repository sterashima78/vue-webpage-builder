module.exports = {
  runtimeCompiler: true,
  transpileDependencies: ["vuex-module-decorators"],
  baseUrl: process.env.DEPLOY === 'github'
    ? '/vue-webpage-builder/'
    : '/'
  
};
