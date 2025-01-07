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
  if (!Array.isArray(props.table)) {
    // console.warn("Table data is not an array");
    return
  }

  // console.log("Updating record:", record, "with value:", value);

  const updatedTable = props.table.map((item) => {
    if (item === record) {
      const newItem = { ...item, ...value }
      // console.log("Updated item:", newItem);
      return newItem
    }
    return item
  })

  // console.log("Emitting updated table:", updatedTable);
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
        <a-tooltip v-if="record.description" :title="record.description">
          <CustomField :title="record.key" />
        </a-tooltip>
        <CustomField v-else :title="record.key" />
      </template>
      <template v-else-if="column.dataIndex === 'value'">
        <template v-if="record.hasChild">
          <span class="text-secondary">{{
            record.type === 'array' ? '数组' : '对象'
          }}</span>
        </template>
        <template v-else>
          <template v-if="record.type === 'simple_array'">
            <a-input
              :value="Array.isArray(record.value) ? record.value.join(',') : ''"
              placeholder="请输入数组值，用逗号分隔"
              @update:value="
                (e) =>
                  handleValueChange(record, {
                    value: e.split(',').map((item) => Number(item.trim())),
                  })
              "
            />
          </template>
          <template v-else>
            <CustomInput
              v-if="record.type === 'string'"
              :model-value="record.value"
              @update:model-value="
                (val) => handleValueChange(record, { value: val })
              "
            />
            <CustomInputNumber
              v-else-if="record.type === 'number'"
              :model-value="record.value"
              @update:model-value="
                (val) => handleValueChange(record, { value: val })
              "
            />
            <CustomBoolean
              v-else-if="record.type === 'boolean'"
              :model-value="record.value"
              @update:model-value="
                (val) => handleValueChange(record, { value: val })
              "
            />
          </template>
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
