<script lang="ts" setup>
import { ref } from 'vue'

import JsonEditorVue from 'json-editor-vue'

import 'vanilla-jsoneditor/themes/jse-theme-dark.css'

const content = ref({
  array: [1, 2, 3],
  boolean: true,
  null: null,
  number: 123,
  object: { a: 'b', c: 'd' },
  string: 'Hello World',
})
</script>

<template>
  <JsonEditorVue v-model="content" class="jse-theme-dark" />
</template>

<style>
/* Add any custom styles here */
</style>
