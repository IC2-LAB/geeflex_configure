<script lang="ts" setup>
interface InputProps {
  tooltipTitle?: string
  modelValue: string
  type?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  tooltipTitle: '字符串',
  modelValue: '',
  type: 'string',
})

const emit = defineEmits<{
  'update:model-value': [value: string]
}>()
</script>

<template>
  <a-tooltip :title="props.tooltipTitle" placement="topLeft">
    <a-input
      :value="props.modelValue"
      @update:value="(val) => emit('update:model-value', val)"
    />
  </a-tooltip>
</template>
