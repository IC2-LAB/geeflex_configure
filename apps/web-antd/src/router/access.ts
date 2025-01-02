import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types'
import type { RouteRecordRaw } from 'vue-router'

import { generateAccessible, useAccess } from '@vben/access'
import { preferences } from '@vben/preferences'

import { message } from 'ant-design-vue'

import { BasicLayout, IFrameView } from '#/layouts'
import { $t } from '#/locales'
import { useCaseStore } from '#/store'

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue')

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue')

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  }
  const { toggleAccessMode } = useAccess()
  await toggleAccessMode()
  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      })
      const caseStore = useCaseStore()
      const children: RouteRecordRaw[] = []

      for (const item of caseStore.cases) {
        const casePage = {
          name: item.name,
          path: `/test/${item.name}`,
          component: 'configuration/testTable.vue',
          meta: {
            icon: 'line-md:compass-filled',
            title: item.name,
            ignoreAccess: true,
          },
        }
        children.push(casePage)
      }
      // return menus
      const testCaseMenu = [
        {
          component: 'BasicLayout',
          path: '/test',
          name: 'Case',
          // redirect: '/home/index',
          meta: {
            title: $t('page.configuration.title'),
            icon: 'line-md:cog-filled-loop',
          },
          children,
        },
        {
          component: 'BasicLayout',
          path: '/sat',
          name: 'SAT',
          meta: {
            title: 'SAT',
            icon: 'line-md:compass-filled',
          },
          children: [
            {
              name: 'SAT-child',
              path: '/sat/index',
              component: 'satellite/sat.vue',
            },
          ],
        },
      ]
      return testCaseMenu
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  })
}

export { generateAccess }
