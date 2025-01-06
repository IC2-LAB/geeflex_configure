<script lang="ts" setup>
import type { ColumnType } from '#/typing'

import { computed } from 'vue'

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'

import CustomBoolean from './CustomBoolean.vue'
import CustomInput from './CustomInput.vue'
import CustomInputNumber from './CustomInputNumber.vue'
import CustomObj from './CustomObj.vue'

interface ArrayProps {
  table: any[]
  columns: ColumnType[]
}

const props = defineProps<ArrayProps>()
const emit = defineEmits(['update:table'])

// 处理数据更新
const handleValueChange = (record: any, index: number, value: any) => {
  const newTable = [...props.table]
  newTable[index] = { ...newTable[index], ...value }
  emit('update:table', newTable)
}

// 在指定位置后添加新行
const handleAdd = (index: number) => {
  const newTable = [...props.table]
  const currentItem = newTable[index]
  const newItem = currentItem
    ? { ...currentItem, value: undefined }
    : { value: undefined }
  newTable.splice(index + 1, 0, newItem)
  emit('update:table', newTable)
}

// 删除指定行
const handleDelete = (index: number) => {
  const newTable = [...props.table]
  newTable.splice(index, 1)
  emit('update:table', newTable)
}

// 计算表格数据
const tableData = computed(() => {
  return props.table.map((item, index) => ({
    key: index,
    index,
    ...item,
  }))
})
</script>

<template>
  <div class="array-table">
    <a-table
      :columns="[
        {
          title: '序号',
          dataIndex: 'index',
          width: '80px',
          align: 'center',
          customRender: ({ text }) => text,
        },
        { title: '值', dataIndex: 'value', width: 'auto' },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '120px',
          align: 'center',
        },
      ]"
      :data-source="tableData"
      :pagination="false"
      bordered
      size="small"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'value'">
          <template v-if="record.type === 'object'">
            <CustomObj
              :columns="record.childrenColumn || []"
              :table="record.childrenTable || []"
              @update:table="
                (val) =>
                  handleValueChange(record, index, { childrenTable: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'string'">
            <CustomInput
              :model-value="record.value"
              tooltip-title="字符串"
              type="string"
              @update:model-value="
                (val) => handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'number'">
            <CustomInputNumber
              :model-value="record.value"
              tooltip-title="数值"
              type="number"
              @update:model-value="
                (val) => handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'boolean'">
            <CustomBoolean
              :model-value="record.value"
              tooltip-title="布尔值"
              type="boolean"
              @update:model-value="
                (val) => handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else>
            <span>{{ record.value }}</span>
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="operation-buttons">
            <a-button class="operation-button" size="middle" type="link">
              <PlusOutlined
                style="font-size: 18px"
                @click="() => handleAdd(index)"
              />
            </a-button>
            <a-button class="operation-button" danger size="middle" type="link">
              <DeleteOutlined
                style="font-size: 18px"
                @click="() => handleDelete(index)"
              />
            </a-button>
          </div>
        </template>
      </template>
    </a-table>
    <!-- 如果数组为空，显示添加按钮 -->
    <div v-if="tableData.length === 0" class="array-actions">
      <a-button size="small" type="primary" @click="() => handleAdd(-1)">
        添加
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.array-table {
  width: 100%;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.ant-table-cell) {
  padding: 8px !important;
}

:deep(.operation-button) {
  height: auto;
  padding: 4px 8px;
  line-height: 1;
}

:deep(.operation-button:hover) {
  background-color: rgb(0 0 0 / 4%);
  border-radius: 4px;
}

:deep(.operation-button .anticon) {
  font-size: 18px;
}

.array-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
