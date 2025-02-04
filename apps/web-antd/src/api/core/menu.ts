import type { RouteRecordStringComponent } from '@vben/types'

import type { ApiResp } from '#/typing'

import { baseRequestClient, requestClient } from '#/api/request'

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/api/menu/all')
}

export async function getAllMenus() {
  return baseRequestClient.get<ApiResp<RouteRecordStringComponent[]>>(
    '/case/menu',
  )
}

export async function createMenu(data: RouteRecordStringComponent) {
  const name = data.name as string
  return baseRequestClient.patch<ApiResp<RouteRecordStringComponent>>(
    `/case/menu/${name}`,
    data,
  )
}

export async function deleteMenu(name: string) {
  return baseRequestClient.delete<ApiResp<any>>(`/case/menu/${name}`)
}
