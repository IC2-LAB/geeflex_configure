<script lang="ts" setup>
import type { ColumnType } from '#/typing'

import { computed } from 'vue'

import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'

import CustomBoolean from './CustomBoolean.vue'
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

// 获取默认值
const getDefaultValue = (type: string) => {
  switch (type) {
    case 'array': {
      return []
    }
    case 'boolean': {
      return false
    }
    case 'number': {
      return 0
    }
    case 'string': {
      return ''
    }
    default: {
      return null
    }
  }
}

// 添加新行
const handleAddRow = (record: any, index: number) => {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  const newRow = JSON.parse(JSON.stringify(record))

  // 重置值，但保持数据结构
  const resetValue = (obj: any) => {
    if (obj.childrenTable) {
      obj.childrenTable = obj.childrenTable.map((child: any) => {
        const newChild = { ...child }
        if (child.type === 'object') {
          resetValue(newChild)
        } else if (child.type === 'array') {
          newChild.childrenTable = [] // 重置数组为空
        } else {
          newChild.value = getDefaultValue(child.type)
        }
        return newChild
      })
    } else {
      obj.value = getDefaultValue(obj.type)
    }
    return obj
  }

  // 重置新行的值
  resetValue(newRow)

  // 在当前行后插入新行
  const updatedTable = [...props.table]
  updatedTable.splice(index + 1, 0, newRow)
  emit('update:table', updatedTable)
}

// 为数组项生成列定义
const arrayColumns = computed(() => {
  if (props.table.length === 0) return []

  const firstItem = props.table[0]
  if (!firstItem.childrenTable) return []

  const columns = firstItem.childrenTable.map((field: any) => ({
    title: field.key,
    dataIndex: field.key,
    key: field.key,
  }))

  return [
    ...columns,
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 120,
    },
  ]
})

// 转换数据为表格所需格式
const tableData = computed(() => {
  return props.table.map((item, index) => {
    const rowData: any = {
      key: index,
      _original: item,
    }

    if (item.childrenTable) {
      item.childrenTable.forEach((field: any) => {
        rowData[field.key] = field
      })
    }

    return rowData
  })
})
</script>

<template>
  <div class="array-table">
    <a-table
      :columns="arrayColumns"
      :data-source="tableData"
      :pagination="false"
      bordered
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <div class="operation-buttons">
            <a-button
              type="link"
              @click="handleAddRow(record._original, tableData.indexOf(record))"
            >
              <PlusCircleOutlined />
            </a-button>
            <a-button
              type="link"
              @click="handleDeleteRow(tableData.indexOf(record))"
            >
              <DeleteOutlined />
            </a-button>
          </div>
        </template>
        <template v-else>
          <template v-if="record[column.key]">
            <template v-if="!record[column.key].hasChildren">
              <component
                :is="
                  record[column.key].type === 'string'
                    ? CustomInput
                    : record[column.key].type === 'number'
                      ? CustomInputNumber
                      : record[column.key].type === 'boolean'
                        ? CustomBoolean
                        : null
                "
                v-model:input="record[column.key].value"
                @update:input="
                  (val) =>
                    handleValueChange(
                      { value: val },
                      record[column.key],
                      'value',
                    )
                "
              />
            </template>
            <template v-else>
              <template v-if="record[column.key].type === 'array'">
                <CustomArray
                  :columns="record[column.key].childrenColumn"
                  :table="record[column.key].childrenTable"
                  @update:table="
                    (val) =>
                      handleValueChange(
                        { childrenTable: val },
                        record[column.key],
                        'childrenTable',
                      )
                  "
                />
              </template>
              <template v-else-if="record[column.key].type === 'object'">
                <CustomObj
                  :columns="record[column.key].childrenColumn"
                  :table="record[column.key].childrenTable"
                  @update:table="
                    (val) =>
                      handleValueChange(
                        { childrenTable: val },
                        record[column.key],
                        'childrenTable',
                      )
                  "
                />
              </template>
            </template>
          </template>
        </template>
      </template>
    </a-table>
  </div>
</template>

<style scoped>
.array-table {
  width: 100%;
}

:deep(.ant-table-cell) {
  padding: 8px !important;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.ant-btn-link) {
  height: auto;
  padding: 0;
}
</style>
