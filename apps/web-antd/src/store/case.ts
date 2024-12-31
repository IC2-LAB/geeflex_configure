import type { Case, CaseData } from '#/typing'

import { ref } from 'vue'

import { defineStore } from 'pinia'

import { getCase, getCases } from '#/api/core/case'

export const useCaseStore = defineStore('case', () => {
  const cases = ref<Case[]>([])
  const caseData = ref<{ [key: string]: CaseData }>({})

  /**
   * 获取所有用例
   */
  async function fetchCases() {
    cases.value = await getCases()
  }

  /**
   * 获取用例
   * @param id 用例id
   */
  async function fetchCase(id: string) {
    caseData.value[id] = await getCase(id)
  }

  /**
   * 根据名称获取用例
   */
  function getCaseByName(name: string): CaseData | null {
    for (const item of cases.value) {
      if (item.name === name) {
        return caseData.value[item.id]
      }
    }
    return null
  }

  const $reset = async () => {
    cases.value = []
    caseData.value = {}
    await fetchCases()
    for (const item of cases.value) {
      await fetchCase(item.id)
    }
  }

  return {
    cases,
    caseData,
    fetchCases,
    fetchCase,
    getCaseByName,
    $reset,
  }
})
