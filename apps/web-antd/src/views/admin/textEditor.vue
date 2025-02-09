<script lang="ts" setup>
import { ref } from 'vue'

import { QuillEditor } from '@vueup/vue-quill'

import '@vueup/vue-quill/dist/vue-quill.snow.css'

const quill = ref(null)

// function submit() {
//  console.log(quill.value.getContents())
// }
</script>

<template>
  <QuillEditor ref="quill" theme="snow" toolbar="#my-toolbar">
    <template #toolbar>
      <div id="my-toolbar">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-strike"></button>
        <button class="ql-blockquote"></button>
        <button class="ql-code-block"></button>
        <button class="ql-header" value="1"></button>
        <button class="ql-header" value="2"></button>
        <button class="ql-list" value="ordered"></button>
        <button class="ql-list" value="bullet"></button>
        <button class="ql-script" value="sub"></button>
        <button class="ql-script" value="super"></button>
        <button class="ql-link"></button>
        <button class="ql-image"></button>
        <button class="ql-video"></button>
        <button class="ql-formula"></button>
      </div>
    </template>
  </QuillEditor>
</template>
