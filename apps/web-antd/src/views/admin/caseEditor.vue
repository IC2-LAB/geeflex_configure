<script lang="ts" setup>
import type { SchemaData } from '#/typing'

import { h, ref } from 'vue'

import { useVbenModal } from '@vben/common-ui'
import { $t } from '@vben/locales'

import {
  CloudUploadOutlined,
  DownOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import JsonEditorVue from 'json-editor-vue'
import { JSONSchemaFaker } from 'json-schema-faker'

import { useVbenForm } from '#/adapter/form'
import { getSchema, patchCase, postCase } from '#/api'
import { useCaseStore } from '#/store'

import 'vanilla-jsoneditor/themes/jse-theme-dark.css'

const content = ref<SchemaData>()
const sample = ref<object>()

const caseStore = useCaseStore()

async function onClick({ keyPath }) {
  const entity = keyPath[0]
  const schema = keyPath[1]
  const res = await getSchema(entity, schema)
  if (res.code === 200) {
    content.value = res.data
  } else {
    notification.error({
      message: $t('caseEditor.getSchemaError'),
    })
  }
}

async function generate() {
  try {
    sample.value = await JSONSchemaFaker.resolve(content.value)
  } catch (error) {
    console.error(error)
  }
}
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  title: $t('caseEditor.submitCase'),
  footer: false,
})

const [BaseForm] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('caseEditor.inputName'),
      },
      fieldName: 'caseName',
      label: $t('caseEditor.caseName'),
    },
  ],
  submitOnEnter: true,
})
async function onSubmit(values: Record<string, any>) {
  const caseName = values.caseName
  const caseId = await postCase(caseName)
  const res = await patchCase(caseId, {
    case_data: sample.value,
    schema_data: content.value,
  })
  modalApi.close()
  if (res.code === 200) {
    notification.success({
      message: $t('caseEditor.submitSuccess'),
      description: $t('caseEditor.submitSuccessDescription'),
    })
  } else {
    notification.error({
      message: $t('caseEditor.submitError'),
      description: res.msg,
    })
  }
}
function submit() {
  modalApi.open()
  // TODO: Modify the API
  // 1. POST a new case, only need name

  // 2. PATCH the new case
}
</script>
<template>
  <div>
    <a-space wrap>
      <a-dropdown>
        <a class="ant-dropdown-link" @click.prevent>
          {{ $t('caseEditor.selectEntity') }}
          <DownOutlined />
        </a>
        <template #overlay>
          <a-menu @click="onClick">
            <a-menu-item v-for="entity in caseStore.entities" :key="entity">
              <a-sub-menu :key="entity" :title="entity">
                <a-menu-item
                  v-for="schema in caseStore.schemas[entity]"
                  :key="schema"
                >
                  {{ schema }}
                </a-menu-item>
              </a-sub-menu>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-button :icon="h(EditOutlined)" @click="generate">
        {{ $t('common.generate') }}
      </a-button>
      <a-button :icon="h(CloudUploadOutlined)" @click="submit">
        {{ $t('common.submit') }}
      </a-button>
    </a-space>
  </div>
  <a-flex gap="middle" horizontal>
    <JsonEditorVue
      v-model="content"
      class="jse-theme-dark"
      style="width: 45vw; height: 100%"
    />
    <JsonEditorVue
      v-model="sample"
      class="jse-theme-dark"
      style="width: 45vw; height: 100%"
    />
  </a-flex>
  <Modal>
    <BaseForm />
  </Modal>
</template>
