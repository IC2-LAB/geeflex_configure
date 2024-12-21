<script lang="ts" setup>
import type { ColumnType } from '#/typing'

import { computed, h } from 'vue'

import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons-vue'

import CustomBoolean from './CustomBoolean.vue'
import CustomField from './CustomField.vue'
import CustomInput from './CustomInput.vue'
import CustomInputNumber from './CustomInputNumber.vue'
import CustomObj from './CustomObj.vue'

interface ArrayProps {
  columns: ColumnType[]
  table: any[]
}

const props = defineProps<ArrayProps>()
const emit = defineEmits(['update:table'])

// 处理值变化
const handleValueChange = (value: any, record: any, field: string) => {
  const updatedTable = props.table.map((item) =>
    item === record ? { ...item, [field]: value } : item,
  )
  emit('update:table', [...updatedTable])
}

// 删除行
const handleDeleteRow = (index: number) => {
  const updatedTable = [...props.table]
  updatedTable.splice(index, 1)
  emit('update:table', updatedTable)
}

// 添加新行
const handleAddRow = (record: any, index: number) => {
  // 深拷贝当前行的数据结构
  const newRow = JSON.parse(JSON.stringify(record)) // eslint-disable-line unicorn/prefer-structured-clone

  // 重置值，但保持数据结构
  switch (record.type) {
    case 'array': {
      newRow.childrenTable = []
      break
    }
    case 'boolean': {
      newRow.value = false
      break
    }
    case 'number': {
      newRow.value = 0
      break
    }
    case 'object': {
      newRow.childrenTable = []
      break
    }
    default: {
      newRow.value = ''
    }
  }

  // 在当前行后插入新行
  const updatedTable = [...props.table]
  updatedTable.splice(index + 1, 0, newRow)
  emit('update:table', updatedTable)
}

// 扩展列定义，添加操作列
const extendedColumns = computed(() => [
  ...props.columns,
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 120,
    customRender: ({ record, index }) =>
      h('div', { style: 'display: flex; gap: 8px;' }, [
        h(
          'a',
          {
            onClick: () => handleAddRow(record, index),
          },
          [h(PlusCircleOutlined)],
        ),
        h(
          'a',
          {
            onClick: () => handleDeleteRow(index),
          },
          [h(DeleteOutlined)],
        ),
      ]),
  },
])

// 展开图标
const expandIcon = (propsval: any) => {
  if (propsval.record.hasChildren) {
    return h(
      'span',
      {
        class: 'expand-icon-wrapper',
        onClick: (e) => {
          propsval.onExpand(propsval.record, e)
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
    :columns="extendedColumns"
    :data-source="props.table"
    :default-expand-all-rows="false"
    :expand-icon="expandIcon"
    :pagination="false"
    :scroll="{ x: '100%' }"
    bordered
    class="components-table-demo-nested"
    size="small"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'key'">
        <CustomField :title="record.key" />
      </template>
      <template v-else-if="column.dataIndex === 'value'">
        <component
          :is="
            record.type === 'string'
              ? CustomInput
              : record.type === 'number'
                ? CustomInputNumber
                : record.type === 'boolean'
                  ? CustomBoolean
                  : record.type === 'object'
                    ? CustomObj
                    : null
          "
          v-if="record.type !== 'object' && record.type !== 'array'"
          v-model:input="record.value"
          @update:input="(val) => handleValueChange(val, record, 'value')"
        />
        <CustomObj
          v-else-if="record.type === 'object'"
          :columns="record.childrenColumn"
          :table="record.childrenTable"
          @update:table="
            (val) =>
              handleValueChange({ childrenTable: val }, record, 'childrenTable')
          "
        />
        <CustomArray
          v-else
          :columns="record.childrenColumn"
          :table="record.childrenTable"
          @update:table="
            (val) =>
              handleValueChange({ childrenTable: val }, record, 'childrenTable')
          "
        />
      </template>
    </template>
  </a-table>
</template>

<style scoped>
:deep(.ant-table-cell) {
  padding: 8px !important;
}

:deep(.ant-table-body) {
  overflow-x: auto;
}

.expand-icon-wrapper {
  padding: 0 4px;
  cursor: pointer;
}

.expand-icon {
  font-size: 12px;
}
</style>
