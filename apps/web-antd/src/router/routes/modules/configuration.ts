import type { RouteRecordRaw } from 'vue-router'

import { useCaseStore } from '#/store'

export const addCaseRoutes = () => {
  const caseStore = useCaseStore()

  const children: RouteRecordRaw[] = []

  for (const item of caseStore.cases) {
    const casePage = {
      name: item.name,
      path: `/${item.name}`,
      component: () => import(`#/views/configuration/DataTable.vue`),
      meta: {
        icon: 'line-md:compass-filled',
        title: item.name,
        ignoreAccess: true,
      },
    }
    children.push(casePage)
  }
  return children
}

// const routes: RouteRecordRaw[] = [
//  {
//    component: () => import('#/layouts/basic.vue'),
//    path: '',
//    name: 'Case',
//    // redirect: '/home/index',
//    meta: {
//      title: $t('page.configuration.title'),
//      icon: 'line-md:cog-filled-loop',
//    },
//    // children: addCaseRoutes(),
//    children: [
//      {
//        name: 'ConfigurationIndex',
//        path: '/test/:caseName',
//        component: () => import('#/views/configuration/testTable.vue'),
//        meta: {
//          icon: 'line-md:cog-filled-loop',
//          title: $t('page.configuration.test'),
//          keepAlive: true, // 是否缓存
//          ignoreAccess: true,
//        },
//      },
//    ],
//  },
// ]
/* [
      {
        name: 'ConfigurationIndex',
        path: '',
        component: () => import('#/views/configuration/index.vue'),
        meta: {
          icon: 'line-md:cog-filled-loop',
          title: $t('page.configuration.test'),
          keepAlive: true, // 是否缓存
          ignoreAccess: true,
        },
      },
      {
        name: 'ConfigurationTable',
        path: 'table',
        component: () => import('#/views/configuration/tableStyle.vue'),
        meta: {
          icon: 'line-md:compass-filled',
          title: $t('page.configuration.test'),
          ignoreAccess: true,
        },
      },
      {
        name: 'ConfigurationAntdTable',
        path: 'antd_table',
        component: () => import('#/views/configuration/antdTable.vue'),
        meta: {
          icon: 'svg-spinners:blocks-shuffle-3',
          title: $t('page.configuration.test'),
          ignoreAccess: true,
        },
      },
      {
        name: 'TestAntdTable',
        path: 'test',
        component: () => import('#/views/configuration/testTable.vue'),
        meta: {
          keepalive: true,
          title: '测试AntdTable',
          ignoreAccess: true,
        },
      },
    ],*/

export default []
