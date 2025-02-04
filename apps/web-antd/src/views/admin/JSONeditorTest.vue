<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import JSONEditor from 'jsoneditor'

import 'jsoneditor/dist/jsoneditor.css'

const jsonEditor = ref(null)
const editor = ref(null)

onMounted(() => {
  editor.value = new JSONEditor(jsonEditor.value, {
    mode: 'tree',
    onChange: () => {
      try {
        editor.value.get()
      } catch (error) {
        console.error('Error updating JSON:', error)
      }
    },
  })
  // editor.value.set(props.value)
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div ref="jsonEditor" style="height: 400px"></div>
</template>

<style>
/* Add any custom styles here */
</style>
