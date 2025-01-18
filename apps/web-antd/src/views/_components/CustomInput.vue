<script lang="ts" setup>
interface InputProps {
  modelValue: string;
  path?: string;
  type?: string;
}

const props = defineProps<InputProps>();
const emit = defineEmits<{
  "update:model-value": [value: string, path?: string, type?: string];
}>();

let tempValue = props.modelValue;

const handleChange = (val: string) => {
  tempValue = val;
  // 只更新本地显示，不触发后端同步
  emit("update:model-value", val, undefined, undefined);
};

const handleBlur = () => {
  // 失焦时才触发带路径的更新，进而触发后端同步
  if (tempValue !== props.modelValue) {
    emit("update:model-value", tempValue, props.path, props.type);
  }
};
</script>

<template>
  <a-input
    :value="modelValue"
    @update:value="handleChange"
    @blur="handleBlur"
  />
</template>
