<script lang="ts" setup>
interface FieldProps {
  title: string
}

defineProps<FieldProps>()
</script>

<template>
  <span>{{ title }}</span>
</template>
