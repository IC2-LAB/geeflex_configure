<script lang="ts" setup>
import type { ColumnType } from '#/typing'

import { onMounted, ref } from 'vue'

import { parser } from '#/data/index'
import { $t } from '#/locales'
import { useCaseStore } from '#/store'
import CustomObj from '#/views/_components/CustomObj.vue'

const caseStore = useCaseStore()
const caseName = 'ENB-LTE-NB'
const columns = ref<ColumnType[]>([
  { title: $t('configuration.meta.field'), dataIndex: 'key', width: '30%' },
  { title: $t('configuration.meta.value'), dataIndex: 'value' },
])

const tableData = ref<any[]>([])

// 初始化数据
const initData = async () => {
  try {
    await caseStore.fetchCases()
    const caseList = caseStore.cases
    const targetCase = caseList.find((item) => item.name === caseName)

    if (!targetCase) {
      throw new Error('Case not found in list')
    }

    await caseStore.fetchCase(targetCase.id)
    const caseData = caseStore.getCaseByName(caseName)

    if (!caseData) {
      throw new Error('Case data not found')
    }

    const parsedData = parser(caseData.schema.properties, caseData.case_data)
    tableData.value = Array.isArray(parsedData) ? parsedData : []
  } catch (error) {
    console.error('Failed to initialize case data:', error)
    tableData.value = []
  }
}

// 处理表格数据更新
const handleTableUpdate = (newData: any[]) => {
  if (!Array.isArray(newData)) {
    console.warn('Invalid table data update: expected array')
    return
  }
  tableData.value = [...newData]
}

watch(
  () => tableData.value,
  (newVal) => {
    if (Array.isArray(newVal)) {
      // 使用更合适的日志记录方式或完全移除
      // console.log("Table data updated:", newVal);
    }
  },
  { deep: true },
)

onMounted(() => {
  initData()
})
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
