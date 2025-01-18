<script lang="ts" setup>
interface BooleanProps {
  modelValue: boolean;
  path?: string;
  type?: string;
}

const props = defineProps<BooleanProps>();
const emit = defineEmits<{
  "update:model-value": [value: boolean, path?: string, type?: string];
}>();

const handleChange = (val: boolean) => {
  // 对于布尔值，由于是点击切换，可以直接触发后端同步
  emit("update:model-value", val, props.path, props.type);
};
</script>

<template>
  <a-tooltip :title="tooltipTitle">
    <a-switch :checked="modelValue" @update:checked="handleChange" />
  </a-tooltip>
</template>
