<template>
  <v-layout>
    <Viewer />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import Viewer from '@/components/Viewer.vue'; // @ is an alias to /src

@Component({
  components: {
    HelloWorld,
    Viewer,
  },
})
export default class Home extends Vue {}
</script>
