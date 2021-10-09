<template>
  <<%= name.paramCase %> msg="hello <%= name.pascalCase %>" />
  <p>this file generated at：<%= currentTime %></p>
</template>

<script setup lang="ts">
import <%= name.pascalCase %> from './components/index.vue'
</script>

<style lang="scss">
@import "normalize.css";

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
