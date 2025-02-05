<script lang="ts" setup>
import type { SchemaData } from '#/typing'

import { h, ref } from 'vue'

import { $t } from '@vben/locales'

import { DownOutlined, EditOutlined } from '@ant-design/icons-vue'
import JsonEditorVue from 'json-editor-vue'
import { JSONSchemaFaker } from 'json-schema-faker'

import { getSchema } from '#/api'
import { useCaseStore } from '#/store'

import 'vanilla-jsoneditor/themes/jse-theme-dark.css'

const content = ref<SchemaData>()
const sample = ref<object>()

const caseStore = useCaseStore()

async function onClick({ keyPath }) {
  const entity = keyPath[0]
  const schema = keyPath[1]
  content.value = await getSchema(entity, schema)
}

async function generate() {
  try {
    sample.value = await JSONSchemaFaker.resolve(content.value)
  } catch (error) {
    console.error(error)
  }
}
</script>
<template>
  <div>
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
</template>
