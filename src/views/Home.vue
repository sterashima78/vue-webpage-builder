<template>
  <v-layout>
    <Viewer />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Viewer from '@/components/Viewer.vue'; // @ is an alias to /src

@Component({
  components: {
    Viewer,
  },
})
export default class Home extends Vue {}
</script>
