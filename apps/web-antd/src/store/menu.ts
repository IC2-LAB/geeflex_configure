import type { RouteRecordStringComponent } from '@vben/types'

import { ref } from 'vue'

import { defineStore } from 'pinia'

import { getAllMenus } from '#/api'

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<RouteRecordStringComponent[]>([])
  const setAllMenu = (outerMenus: RouteRecordStringComponent[]) => {
    menus.value = outerMenus
  }
  async function $reset() {
    const resp = await getAllMenus()
    if (resp.data.data) {
      menus.value = resp.data.data
    }
  }

  const deleteMenuByName = (name: string) => {
    const index = menus.value.findIndex((item) => item.name === name)
    if (index !== -1) {
      menus.value.splice(index, 1)
    }
  }

  return {
    menus,
    setAllMenu,
    $reset,
    deleteMenuByName,
  }
})
