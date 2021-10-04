<template>
  <button class="<%= name.paramCase %>" @click="handler">
    {{ msg }}
  </button>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'

interface Props {
  msg?: string
}

const props = withDefaults(defineProps<Props>(), {
  msg: 'hello world'
})

const emit = defineEmits<{
  (e: 'tap', msg: string): void
}>()

const counter: Ref<number> = ref(0)

const handler = () => {
  counter.value++
  emit('tap', props.msg)
}

defineExpose({
  counter
})
</script>

<style lang="scss">
@import './style';
</style>
