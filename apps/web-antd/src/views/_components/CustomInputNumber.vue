<script lang="ts" setup>
interface InputNumberProps {
  tooltipTitle?: string
  max?: number
  min?: number
  modelValue: number
  type?: string
}

const props = withDefaults(defineProps<InputNumberProps>(), {
  tooltipTitle: '数值',
  max: 10,
  min: 0,
  modelValue: 0,
  type: 'number',
})

const emit = defineEmits<{
  'update:model-value': [value: number]
}>()
</script>

<template>
  <a-tooltip :title="props.tooltipTitle" placement="topLeft">
    <a-input-number
      :max="props.max"
      :min="props.min"
      :value="props.modelValue"
      @update:value="(val) => emit('update:model-value', val)"
    />
  </a-tooltip>
</template>
