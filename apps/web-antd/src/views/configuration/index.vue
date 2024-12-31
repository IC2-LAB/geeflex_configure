<script lang="ts" setup>
import { useVbenForm } from '#/adapter/form'
import { $t } from '#/locales'

const [BaseForm] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  showCollapseButton: true,
  collapsed: true,
  // 使用 tailwindcss grid布局
  // 提交函数
  // handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  layout: 'horizontal',
  // 水平布局，label和input在同一行
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      // componentProps: {
      //  placeholder: '请输入用户名',
      // },
      // 字段名
      fieldName: 'cell_default',
      // 界面显示的label
      label: $t('configuration.test.cell_default'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '选项1',
            value: '1',
          },
          {
            label: '选项2',
            value: '2',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      fieldName: 'fieldOptions',
      label: '下拉选',
    },
    {
      component: 'Input',
      fieldName: 'com_addr',
      label: '通信地址',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
})
</script>

<template>
  <BaseForm />
</template>
