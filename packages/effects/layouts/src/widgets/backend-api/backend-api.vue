<script lang="ts" setup>
import { ref } from 'vue'

import { ApiIcon } from '@vben/icons'

const apiLink = ref('http://localhost:10009') // TODO: get from config
function onClick() {
  window.open(apiLink.value, '_blank')
}
</script>

<template>
  <VbenIconButton
    class="flex-col-center size-8 cursor-pointer rounded-l-lg rounded-r-none border-none bg-none"
    @click="onClick"
  >
    <ApiIcon class="size-5" />
  </VbenIconButton>
</template>
