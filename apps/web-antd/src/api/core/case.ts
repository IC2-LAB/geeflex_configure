import type { ApiResp, Case, CaseData, SchemaData } from '#/typing'

import { baseRequestClient } from '#/api/request'

/**
 * 获取所有用例
 */
export async function getCases(): Promise<Case[]> {
  const resp = await baseRequestClient.get<ApiResp<Case[]>>('/case/case')
  if (!resp.data?.data) {
    return []
  }
  return resp.data?.data
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
  if (!resp.data?.data) {
    throw new Error('用例不存在')
  }
  return resp.data?.data
}

export async function postCase(caseName: string): Promise<string> {
  /* 
  % return: case_id in string
  */
  const data = {
    name: caseName,
  }
  const resp = await baseRequestClient.post<ApiResp<{ case_id: string }>>(
    '/case/case',
    data,
  )
  return resp.data?.data?.case_id
}

export async function patchCase(
  id: string,
  data: { data: CaseData },
): Promise<ApiResp<any>> {
  const resp = await baseRequestClient.patch<ApiResp<any>>(`/case/case/${id}`, {
    data,
  })
  return resp.data
}

export async function getEntity(): Promise<string[]> {
  const resp = await baseRequestClient.get<ApiResp<string[]>>('/case/schema')
  if (!resp.data?.data) {
    throw new Error('后台错误')
  }
  return resp.data?.data
}

export async function getSchemaList(
  entity: string,
): Promise<string[] | undefined> {
  const resp = await baseRequestClient.get<ApiResp<string[]>>(
    `/case/schema/${entity}`,
  )
  if (resp.data?.code !== 200) {
    throw new Error(`${entity}不存在！`)
  }
  return resp.data?.data
}

export async function getSchema(
  entity: string,
  schema: string,
): Promise<SchemaData> {
  const resp = await baseRequestClient.get<ApiResp<SchemaData>>(
    `/case/schema/${entity}/${schema}`,
  )
  return resp.data
}
