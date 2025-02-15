<script lang="ts" setup>
import { computed } from 'vue'

import { syncData } from '#/api'

interface InputProps {
  tooltipTitle?: string
  modelValue: string
  type?: string
  path?: string
  caseId?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  tooltipTitle: '字符串',
  modelValue: '',
  type: 'string',
  path: '',
  caseId: '',
})

const emit = defineEmits<{
  'update:model-value': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:model-value', val),
})

const handleBlur = async () => {
  if (props.type === 'string' && props.path && props.caseId) {
    try {
      await syncData({
        path: props.path,
        type: 'string',
        value: value.value,
        caseId: props.caseId,
      })
    } catch (error) {
      console.error(`Failed to sync string value at ${props.path}:`, error)
    }
  }
}
</script>

<template>
  <a-tooltip :title="props.tooltipTitle" placement="topLeft">
    <a-input
      :value="props.modelValue"
      @blur="handleBlur"
      @update:value="(val) => emit('update:model-value', val)"
    />
  </a-tooltip>
</template>
