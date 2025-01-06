<script lang="ts" setup>
interface BooleanProps {
  tooltipTitle?: string
  modelValue: boolean
  type?: string
}

const props = withDefaults(defineProps<BooleanProps>(), {
  tooltipTitle: '布尔值',
  modelValue: false,
  type: 'boolean',
})

const emit = defineEmits<{
  'update:model-value': [value: boolean]
}>()
</script>

<template>
  <a-tooltip :title="props.tooltipTitle" placement="topLeft">
    <a-switch
      :checked="props.modelValue"
      @update:checked="(val) => emit('update:model-value', val)"
    />
  </a-tooltip>
</template>
