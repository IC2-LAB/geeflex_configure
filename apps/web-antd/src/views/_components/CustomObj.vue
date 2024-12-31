<script lang="ts" setup>
import type { Column, ColumnType } from '#/typing'

import { h } from 'vue'

import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons-vue'

import CustomArray from './CustomArray.vue'
import CustomBoolean from './CustomBoolean.vue'
import CustomField from './CustomField.vue'
import CustomInput from './CustomInput.vue'
import CustomInputNumber from './CustomInputNumber.vue'

interface TableProps {
  table: Column[]
  columns: ColumnType[]
}

const props = defineProps<TableProps>()
const emit = defineEmits(['update:table'])

// 处理值变化
const handleValueChange = (record: any, value: any) => {
  const updatedTable = props.table.map((item) =>
    item === record ? { ...item, ...value } : item,
  )
  emit('update:table', updatedTable)
}

// 展开图标
const expandIcon = (propsval: any) => {
  if (propsval.record?.hasChild) {
    return h(
      'span',
      {
        class: 'expand-icon-wrapper',
        onClick: (e: Event) => {
          e.stopPropagation()
          propsval.onExpand?.(propsval.record, e)
        },
      },
      [
        h(propsval.expanded ? CaretDownOutlined : CaretRightOutlined, {
          class: 'expand-icon',
        }),
      ],
    )
  }
  return null
}
</script>

<template>
  <a-table
    :columns="props.columns"
    :data-source="props.table"
    :default-expand-all-rows="false"
    :expand-icon="expandIcon"
    :pagination="false"
    bordered
    class="components-table-demo-nested"
    size="small"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'key'">
        <CustomField :title="record.key" />
      </template>
      <template v-else-if="column.dataIndex === 'value'">
        <template v-if="!record.hasChildren">
          <template v-if="record.type === 'simple_array'">
            <a-input
              v-model:value="record.value"
              placeholder="请输入数组值，用逗号分隔"
              @change="
                (e) =>
                  handleValueChange(record, {
                    value: e.target.value
                      .split(',')
                      .map((item) => Number(item.trim())),
                  })
              "
            />
          </template>
          <component
            :is="
              record.type === 'string'
                ? CustomInput
                : record.type === 'number'
                  ? CustomInputNumber
                  : record.type === 'boolean'
                    ? CustomBoolean
                    : null
            "
            v-else
            v-model:input="record.value"
            @update:input="(val) => handleValueChange(record, { value: val })"
          />
        </template>
        <template v-else>
          <span class="text-secondary">{{
            record.type === 'array' ? '数组' : '对象'
          }}</span>
        </template>
      </template>
    </template>

    <template #expandedRowRender="{ record }">
      <div class="nested-content">
        <template v-if="record.type === 'array'">
          <CustomArray
            :columns="record.childrenColumn"
            :table="record.childrenTable"
            @update:table="
              (val) => handleValueChange(record, { childrenTable: val })
            "
          />
        </template>
        <template v-else-if="record.type === 'object'">
          <CustomObj
            :columns="record.childrenColumn"
            :table="record.childrenTable"
            @update:table="
              (val) => handleValueChange(record, { childrenTable: val })
            "
          />
        </template>
      </div>
    </template>
  </a-table>
</template>

<style scoped>
.expand-icon-wrapper {
  padding: 0 4px;
  cursor: pointer;
}

.expand-icon {
  font-size: 12px;
}

:deep(.ant-table-cell) {
  padding: 8px !important;
}

.text-secondary {
  font-style: italic;
  color: rgb(0 0 0 / 45%);
}

.nested-content {
  padding: 0 16px;
}

:deep(.ant-table) {
  margin: 8px 0;
}

:deep(.ant-table-wrapper) {
  margin: 0;
}
</style>
