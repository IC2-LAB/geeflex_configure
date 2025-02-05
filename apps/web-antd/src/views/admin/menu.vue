<script lang="ts" setup>
import type { RouteRecordStringComponent } from '@vben/types'

import { h, ref } from 'vue'

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons-vue'
import { Icon } from '@iconify/vue'
import { Button, Modal, notification } from 'ant-design-vue'
import { type VxeGridInstance } from 'vxe-table'

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table'
import { createMenu, deleteMenu, getMenu, updateMenu } from '#/api'
import { $t } from '#/locales'
import { useMenuStore } from '#/store'

// const gridRef = ref<Vxe>()

interface RowType {
  name: string
  path: string
  component: string
  parentId: null | string
  icon?: string
  title: string
}

const menuStore = useMenuStore()
const rows = ref<RowType[]>([])
const gridRef = ref<VxeGridInstance<RowType>>(null)

function processMenu(menus: RouteRecordStringComponent[]): RowType[] {
  for (const item of menus) {
    // const item = rows[key]
    if (item === undefined) {
      continue
    }
    const row: RowType = {
      name: item.name as string,
      path: item.path,
      component: 'BasicLayout',
      parentId: null,
      icon: item.meta?.icon as string,
      title: item.meta?.title as string,
    }
    rows.value.push(row)
    if (item.children) {
      for (const childItem of item.children) {
        // const childItem = item.children[childKey]
        const childRow: RowType = {
          name: childItem.name as string,
          path: childItem.path,
          component: childItem.component.name,
          parentId: row.name,
          icon: childItem.meta?.icon as string,
          title: childItem.meta?.title as string,
        }
        rows.value.push(childRow)
      }
    }
  }
  return rows.value
}

processMenu(menuStore.menus)

function initialRow(): RowType {
  return {
    name: 'TBD',
    path: '',
    component: 'BasicLayout',
    parentId: null,
    icon: 'svg-spinners:3-dots-move',
    title: 'TBD',
  }
}

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { type: 'seq', width: 70 },
    {
      editRender: { name: 'input' },
      title: $t('common.name'),
      field: 'name',
      treeNode: true,
    },
    { editRender: { name: 'input' }, title: $t('common.path'), field: 'path' },
    {
      editRender: { name: 'input' },
      title: $t('common.component'),
      field: 'component',
    },
    {
      editRender: { name: 'input' },
      title: $t('common.icon'),
      field: 'icon',
      slots: { default: 'icon-name' },
    },
    {
      editRender: { name: 'input' },
      title: $t('common.title'),
      field: 'title',
    },
    {
      title: $t('common.action'),
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  data: rows.value,
  align: 'center',
  pagerConfig: {
    enabled: false,
  },
  treeConfig: {
    transform: true, // 指定表格为树形表格
    parentField: 'parentId', // 父节点字段名
    rowField: 'name', // 行数据字段名
  },
  editConfig: {
    trigger: 'dblclick',
    mode: 'row',
  },
  rowConfig: {
    isHover: true,
  },
  showOverflow: true,
}

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions })

async function addEvent(row: RowType) {
  const newRow = initialRow()
  if (row.parentId !== null) {
    // This is a child node
    newRow.parentId = row.parentId
  }
  rows.value.push(newRow)
}

function menuHasChild(name: string) {
  return rows.value.some((item) => item.parentId === name)
}

function onDeleteMenu(row: RowType) {
  if (menuHasChild(row.name)) {
    Modal.warning({
      title: $t('menu.deleteMenuFailed'),
      content: $t('menu.deleteMenuFailedHasChildDesc'),
    })
    return
  }
  showConfirm(row)
}

function showConfirm(row: RowType) {
  const currentName = row.name
  Modal.confirm({
    title: $t('menu.confirmDelete'),
    content: `${$t('menu.confirmDeleteMenuDesc')}${currentName}`,
    onOk: async () => {
      // Check existence before delete
      const res = await getMenu(currentName)
      if (res.data?.code === 404) {
        // Menu does not exist
        rows.value = rows.value.splice(
          rows.value.findIndex((item) => item.name === currentName),
          1,
        )
        return
      }
      const resp = await deleteMenu(row.name)
      if (resp.data?.code === 200) {
        // menuStore.deleteMenuByName(currentName)
        rows.value = rows.value.splice(
          rows.value.findIndex((item) => item.name === currentName),
          1,
        )
      } else {
        notification.error({
          message: $t('menu.deleteMenuFailed'),
          description: resp.data?.msg,
        })
      }
    },
  })
}

function isEditting(row: RowType) {
  // Check if the given row is in edit mode
  return gridApi.grid?.isEditByRow(row)
}

async function changeMenu(row: RowType) {
  gridApi.grid?.clearEdit()
  const name = row.name
  const data = {
    name: row.name,
    path: row.path,
    component:
      typeof row.component === 'function' ? row.component.name : row.component,
    parentId: row.parentId,
    icon: row.icon,
    title: row.title,
  }
  // Check existence before update
  const res = await getMenu(name)
  if (res.data?.code === 404) {
    // Create new menu
    const createRes = await createMenu(name, data)
    if (createRes.data?.code !== 200) {
      notification.error({
        message: $t('menu.updateMenuFailed'),
        description: createRes.data?.msg,
      })
      return
    }
  }
  const uRes = await updateMenu(name, data)
  if (uRes.data?.code === 200) {
    notification.success({
      message: $t('menu.updateMenuSuccess'),
      description: uRes.data.msg,
    })
  } else {
    notification.error({
      message: $t('menu.updateMenuFailed'),
      description: uRes.data?.msg,
    })
  }
  // gridApi.grid?.setEditRow(row)
}
function cancelRowEvent() {
  gridApi.grid?.clearEdit()
}
</script>

<template>
  <Grid ref="gridRef">
    <template #icon-name="{ row }">
      <Icon :icon="row.icon" :style="{ fontSize: '24px' }" />
    </template>
    <template #action="{ row }">
      <div v-if="isEditting(row)">
        <a-tooltip>
          <template #title>{{ $t('common.confirm') }}</template>
          <Button
            :icon="h(CheckCircleOutlined)"
            shape="circle"
            size="large"
            type="text"
            @click="changeMenu(row)"
          />
        </a-tooltip>
        <a-tooltip>
          <template #title>{{ $t('common.revert') }}</template>
          <Button
            :icon="h(CloseCircleOutlined)"
            shape="circle"
            size="large"
            type="text"
            @click="cancelRowEvent"
          />
        </a-tooltip>
      </div>
      <div v-else>
        <a-tooltip>
          <template #title>{{ $t('common.add') }}</template>
          <Button
            :icon="h(PlusCircleOutlined)"
            shape="circle"
            size="large"
            type="text"
            @click="addEvent(row)"
          />
        </a-tooltip>
        <a-tooltip>
          <template #title>{{ $t('common.delete') }}</template>
          <Button
            :icon="h(MinusCircleOutlined)"
            shape="circle"
            size="large"
            type="text"
            @click="onDeleteMenu(row)"
          />
        </a-tooltip>
      </div>
    </template>
  </Grid>
</template>
