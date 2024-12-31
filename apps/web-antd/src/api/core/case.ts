import type { ApiResp, Case, CaseData } from '#/typing'

import { baseRequestClient } from '#/api/request'

/**
 * 获取所有用例
 */
export async function getCases(): Promise<Case[]> {
  const resp = await baseRequestClient.get<ApiResp<Case[]>>('/case/case')
  if (!resp.data.data) {
    return []
  }
  return resp.data.data
}

/**
 * 获取用例
 * @param id 用例id
 * @returns
 * @example
 */
export async function getCase(id: string): Promise<CaseData> {
  const resp = await baseRequestClient.get<ApiResp<CaseData>>(
    `/case/case/${id}`,
  )
  if (!resp.data.data) {
    throw new Error('用例不存在')
  }
  return resp.data.data
}
