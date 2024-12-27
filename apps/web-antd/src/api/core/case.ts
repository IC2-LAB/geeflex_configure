import { requestClient } from '#/api/request'

type Case = {
  id: string
  name: string
  path: string
}

type CaseData = {
  data: object
  name: string
}

/**
 * 获取所有用例
 */
export async function getCases(): Promise<Case[]> {
  return requestClient.get<Case[]>('/case/case')
}

/**
 * 获取用例
 * @param id 用例id
 * @returns
 * @example
 */
export async function getCase(id: string): Promise<CaseData> {
  return requestClient.get<CaseData>(`/case/case/${id}`)
}
