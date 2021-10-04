<template><<%= name.paramCase %> msg="hello <%= name.pascalCase %>" /></template>

<script setup lang="ts">
import <%= name.pascalCase %> from './components/index.vue'
</script>

<style>
body {
  margin: 0;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
