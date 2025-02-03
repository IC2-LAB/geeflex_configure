<script lang="ts" setup>
import type { RouteRecordStringComponent } from '@vben/types'

import { computed, h, ref } from 'vue'

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons-vue'
import { Icon } from '@iconify/vue'
import { Button } from 'ant-design-vue'

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table'
import { $t } from '#/locales'
import { useMenuStore } from '#/store'

// const gridRef = ref<Vxe>()

interface RowType {
  name: string
  path: string
  component: string
  parentId: null | string
  icon?: string
}

const menuStore = useMenuStore()

const rows = ref<RowType[]>([])

function initialRow(): RowType {
  return {
    name: 'TBD',
    path: '',
    component: 'BasicLayout',
    parentId: null,
    icon: 'svg-spinners:3-dots-move',
  }
}

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
    }
    rows.value.push(row)
    if (item.children) {
      for (const childItem of item.children) {
        // const childItem = item.children[childKey]
        const childRow: RowType = {
          name: childItem.name as string,
          path: childItem.path,
          component: childItem.component,
          parentId: row.name,
          icon: childItem.meta?.icon as string,
        }
        rows.value.push(childRow)
      }
    }
  }
  return rows.value
}

const tableData = computed(() => {
  return processMenu(menuStore.menus)
})

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
      title: $t('common.action'),
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  data: tableData.value,
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

function isEditting(row: RowType) {
  // Check if the given row is in edit mode
  return gridApi.grid?.isEditByRow(row)
}

function changeMenu(_row: RowType) {
  // gridApi.grid?.setEditRow(row)
}
</script>

<template>
  <Grid>
    <template #icon-name="{ row }">
      <Icon :icon="row.icon" :style="{ fontSize: '24px' }" />
    </template>
    <template #action="{ row }">
      <div v-if="isEditting(row)">
        <a-tooltip>
          <template #title>{{ $t('common.edit') }}</template>
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
            @click="changeMenu(row)"
          />
        </a-tooltip>
      </div>
      <a-tooltip v-else>
        <template #title>{{ $t('common.add') }}</template>
        <Button
          :icon="h(PlusCircleOutlined)"
          shape="circle"
          size="large"
          type="text"
          @click="addEvent(row)"
        />
      </a-tooltip>
    </template>
  </Grid>
</template>
