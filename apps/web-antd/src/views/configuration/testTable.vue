<script lang="ts" setup>
import type { ColumnType } from '#/typing'

import { ref } from 'vue'

import { parser } from '#/data/index'
// import schemaData from '#/data/schemaData.json'
import { $t } from '#/locales'
import { useCaseStore } from '#/store'
import CustomObj from '#/views/_components/CustomObj.vue'

const caseStore = useCaseStore()
// const caseName = route.params.caseName as string
const caseName = 'ENB-LTE-NB'
const caseData = caseStore.getCaseByName(caseName)
const columns = ref<ColumnType[]>([
  { title: $t('configuration.meta.field'), dataIndex: 'key', width: '30%' },
  { title: $t('configuration.meta.value'), dataIndex: 'value' },
])

if (!caseData) {
  throw new Error('Case not found')
}
const tableData = ref(parser(caseData.schema.properties, caseData.case_data))

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
