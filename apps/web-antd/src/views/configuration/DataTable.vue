<script lang="ts" setup>
import type { ColumnType } from '#/typing'

import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { parser } from '#/data/index'
import CustomObj from '#/views/_components/CustomObj.vue'

// import schemaData from '#/data/schemaData.json'
import { $t } from '#/locales'
import { useCaseStore } from '#/store'

const caseStore = useCaseStore()
const router = useRouter()
const caseName = router.currentRoute.value.name
const loading = ref(false)
const fullCaseData = ref<any>(null)

const columns = ref<ColumnType[]>([
  { title: $t('configuration.meta.field'), dataIndex: 'key', width: '30%' },
  { title: $t('configuration.meta.value'), dataIndex: 'value' },
])

const tableData = ref<any[]>([])

// 初始化数据
const initData = async () => {
  try {
    loading.value = true
    await caseStore.fetchCases()
    const caseList = caseStore.cases
    // console.log('Case list:', caseList)

    const targetCase = caseList.find((item) => item.name === caseName)
    // console.log('Target case:', targetCase)

    if (!targetCase) {
      throw new Error('Case not found in list')
    }

    await caseStore.fetchCase(targetCase.id)
    const caseData = caseStore.getCaseByName(caseName)

    // 详细记录数据结构
    // console.log('Raw case data:', {
    //   br_coverage_levels: {
    //     inSchema: caseData?.schema?.properties?.br_coverage_levels,
    //     inData: caseData?.case_data?.br_coverage_levels,
    //     dataType: typeof caseData?.case_data?.br_coverage_levels,
    //     isArray: Array.isArray(caseData?.case_data?.br_coverage_levels),
    //     length: caseData?.case_data?.br_coverage_levels?.length,
    //   },
    // })

    if (!caseData || !caseData.schema || !caseData.case_data) {
      // console.error('Invalid case data:', caseData)
      throw new Error('Invalid case data structure')
    }

    // 保存完整数据前检查数据结构
    const fullData = {
      case_data: { ...caseData.case_data },
      schema: { ...caseData.schema },
    }
    // console.log('Full data structure check:', {
    //   hasBrCoverageLevels: 'br_coverage_levels' in fullData.case_data,
    //   brCoverageLevelsData: fullData.case_data.br_coverage_levels,
    //   schemaDefinition: fullData.schema.properties?.br_coverage_levels,
    // })

    fullCaseData.value = fullData

    // 解析数据
    const parsedData = parser(caseData.schema.properties, caseData.case_data)
    // console.log('Parsed data:', parsedData)

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      // console.error('Invalid or empty parsed data')
      throw new Error('Parser returned invalid data')
    }

    tableData.value = parsedData
    // console.log('Table data set:', tableData.value)
  } catch {
    // console.error('Failed to initialize case data:', error)
    // message.error('Failed to load case data')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 处理表格数据更新
const handleTableUpdate = (newData: any[]) => {
  if (!Array.isArray(newData)) {
    // console.warn('Invalid table data update: expected array')
    return
  }
  // console.log('Updating table data:', newData)
  tableData.value = [...newData]
}

// 监听数据变化
watch(
  () => tableData.value,
  (newVal) => {
    if (Array.isArray(newVal)) {
      // console.log('Table data updated:', newVal)
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
    <div v-if="loading" class="loading-state">Loading...</div>
    <div v-else>
      <CustomObj
        v-if="tableData.length > 0"
        :columns="columns"
        :table="tableData"
        @update:table="handleTableUpdate"
      />
      <div v-else class="no-data">No data available</div>
    </div>
  </div>
</template>

<style scoped>
.configuration-container {
  padding: 16px;
}

.loading-state {
  padding: 20px;
  text-align: center;
}

.no-data {
  padding: 20px;
  color: #999;
  text-align: center;
}
</style>
