<template>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Vue Web desginer</title>
  <template v-html="style"></template>
</head>
<body>
  <div id="app-main" style="height:100%;width:100%">
  <template v-html="toString(id, nodes, true)"></template>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <template v-html="script"></template>
  <script>
    <template>{{inlineScript}}</template>
    new Vue({
      el: "#app-main"
    })
  </script>
</body>
</html>
</template>

<script>
export default {
  props: ["style", "id", "nodes", "script", "inlineScript"]
};
</script>
