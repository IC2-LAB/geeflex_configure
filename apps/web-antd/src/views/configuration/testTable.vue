<script lang="ts" setup>
import type { ColumnType } from '#/typing'

import { ref } from 'vue'

import { parser } from '#/data/index'
import originData from '#/data/originData.json'
import schemaData from '#/data/schemaData.json'
import { $t } from '#/locales'
import CustomObj from '#/views/_components/CustomObj.vue'

const columns = ref<ColumnType[]>([
  { title: $t('configuration.meta.field'), dataIndex: 'key', width: '30%' },
  { title: $t('configuration.meta.value'), dataIndex: 'value' },
])

const tableData = ref(parser(schemaData.properties, originData))

// 处理表格数据更新
const handleTableUpdate = (newData: any[]) => {
  // 直接赋值，保持引用关系
  tableData.value = newData
}

// watch(
//   tableData,
//   (newVal) => {
//     console.log("Table data updated:", newVal);
//   },
//   { deep: true }
// );
</script>

<template>
  <div class="configuration-container">
    <CustomObj
      :columns="columns"
      :table="tableData"
      @update:table="handleTableUpdate"
    />
  </div>
</template>
