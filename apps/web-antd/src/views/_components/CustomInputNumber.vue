<script lang="ts" setup>
interface InputNumberProps {
  modelValue: number;
  path?: string;
  type?: string;
}

const props = defineProps<InputNumberProps>();
const emit = defineEmits<{
  "update:model-value": [value: number, path?: string, type?: string];
}>();

let tempValue = props.modelValue;

const handleChange = (val: number | null) => {
  tempValue = val ?? props.modelValue;
  // 只更新本地显示，不触发后端同步
  emit("update:model-value", tempValue);
};

const handleBlur = () => {
  // 失焦时才触发带路径的更新，进而触发后端同步
  if (tempValue !== props.modelValue) {
    emit("update:model-value", tempValue, props.path, props.type);
  }
};
</script>

<template>
  <a-input-number
    :value="modelValue"
    @update:value="handleChange"
    @blur="handleBlur"
  />
</template>
