import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types'

import { generateAccessible } from '@vben/access'
import { preferences } from '@vben/preferences'

import { message } from 'ant-design-vue'

import { BasicLayout, IFrameView } from '#/layouts'
import { $t } from '#/locales'
// import { getAllMenus } from '#/api'
import { useMenuStore } from '#/store'

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue')

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue')

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  }

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: $t('common.loadingMenu'),
        duration: 1.5,
      })
      const menuStore = useMenuStore()
      return menuStore.menus
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  })
}

export { generateAccess }
