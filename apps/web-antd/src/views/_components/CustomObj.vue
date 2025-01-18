/* eslint-disable no-console */
<script lang="ts" setup>
import type { Column, ColumnType } from "#/typing";

import { h } from "vue";

import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";

import CustomArray from "./CustomArray.vue";
import CustomBoolean from "./CustomBoolean.vue";
import CustomField from "./CustomField.vue";
import CustomInput from "./CustomInput.vue";
import CustomInputNumber from "./CustomInputNumber.vue";

interface TableProps {
  table: Column[];
  columns: ColumnType[];
  parentPath?: string;
}

const props = defineProps<TableProps>();
const emit = defineEmits<{
  "update:table": [
    data: any[],
    path?: string,
    type?: string,
    value?: any,
    operation?: "add" | "delete"
  ];
}>();

// 处理值变化
const handleValueChange = (
  record: any,
  value: any,
  path?: string,
  type?: string,
  operation?: "add" | "delete"
) => {
  console.log("CustomObj handleValueChange:", {
    record,
    value,
    path,
    type,
    operation,
    currentTable: props.table,
  });

  if (!Array.isArray(props.table)) {
    return;
  }

  // 创建新的数组引用以触发响应式更新
  const updatedTable = [...props.table];

  // 找到要更新的记录索引
  const index = updatedTable.findIndex((item) => item === record);
  if (index !== -1) {
    // 处理其他类型的更新
    if (typeof value === "boolean") {
      updatedTable[index].value = value;
    } else if ("value" in value) {
      if (record.type === "object" && record.childrenTable) {
        const fieldToUpdate = record.childrenTable.find(
          (field: any) => field.key === path
        );
        if (fieldToUpdate) {
          fieldToUpdate.value = value.value;
        }
      } else {
        updatedTable[index].value = value.value;
      }
    }
  }

  // 如果有路径和类型信息，发送更新
  if (path && type) {
    emit(
      "update:table",
      updatedTable,
      path,
      type,
      typeof value === "boolean" ? value : value.value
    );
  } else {
    // 否则只更新本地数据，但确保传递正确的路径和类型
    emit(
      "update:table",
      updatedTable,
      record.path,
      record.type,
      typeof value === "boolean" ? value : value.value
    );
  }
};

// 展开图标
const expandIcon = (propsval: any) => {
  if (propsval.record?.hasChild) {
    return h(
      "span",
      {
        class: "expand-icon-wrapper",
        onClick: (e: Event) => {
          e.stopPropagation();
          propsval.onExpand?.(propsval.record, e);
        },
      },
      [
        h(propsval.expanded ? CaretDownOutlined : CaretRightOutlined, {
          class: "expand-icon",
        }),
      ]
    );
  }
  return null;
};
</script>

<template>
  <a-table
    :columns="props.columns"
    :data-source="props.table"
    :pagination="false"
    :expand-icon="expandIcon"
    bordered
    size="small"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'key'">
        <a-tooltip v-if="record.description" :title="record.description">
          <CustomField :title="record.key" />
        </a-tooltip>
        <CustomField v-else :title="record.key" />
      </template>
      <template v-else-if="column.dataIndex === 'value'">
        <template v-if="record.hasChild">
          <span class="text-secondary">{{
            record.type === "array" ? "数组" : "对象"
          }}</span>
        </template>
        <template v-else>
          <CustomInput
            v-if="record.type === 'string'"
            :model-value="record.value"
            :path="record.path"
            :type="record.type"
            @update:model-value="
              (val, path, type) => {
                if (path && type) {
                  handleValueChange(record, { value: val }, path, type);
                } else {
                  // 本地更新，确保传递正确的路径和类型
                  handleValueChange(
                    record,
                    { value: val },
                    record.path,
                    record.type
                  );
                }
              }
            "
          />
          <CustomInputNumber
            v-else-if="record.type === 'number'"
            :model-value="record.value"
            :path="record.path"
            :type="record.type"
            @update:model-value="
              (val, path, type) => {
                if (path && type) {
                  handleValueChange(record, { value: val }, path, type);
                } else {
                  // 本地更新
                  handleValueChange(record, { value: val });
                }
              }
            "
          />
          <CustomBoolean
            v-else-if="record.type === 'boolean'"
            :model-value="record.value"
            :path="record.path"
            :type="record.type"
            @update:model-value="
              (val, path, type) => handleValueChange(record, val, path, type)
            "
          />
        </template>
      </template>
    </template>

    <template #expandedRowRender="{ record }">
      <div class="nested-content">
        <template v-if="record.type === 'array'">
          <CustomArray
            :columns="record.childrenColumn"
            :table="record.childrenTable"
            :parent-path="record.path"
            @update:table="
              (val, path, type, value, operation) => {
                // 更新本地数据
                record.childrenTable = val;

                // 如果是数组操作或有路径信息，传递到上层
                if (operation || (path && type)) {
                  emit(
                    'update:table',
                    props.table,
                    path,
                    type,
                    value,
                    operation
                  );
                  return;
                }

                // 其他情况，更新对象的值
                handleValueChange(record, { value: val });
              }
            "
          />
        </template>
        <template v-else-if="record.type === 'object'">
          <CustomObj
            :columns="record.childrenColumn"
            :table="record.childrenTable"
            :parent-path="record.path"
            @update:table="
              (val, path, type, value, operation) => {
                if (operation || (path && type)) {
                  // 处理嵌套对象中的操作
                  emit(
                    'update:table',
                    props.table,
                    path,
                    type,
                    value,
                    operation
                  );
                  return;
                }
                handleValueChange(record, { value });
              }
            "
          />
        </template>
      </div>
    </template>
  </a-table>
</template>

<style scoped>
.expand-icon-wrapper {
  padding: 0 4px;
  cursor: pointer;
}

.expand-icon {
  font-size: 12px;
}

:deep(.ant-table-cell) {
  padding: 8px !important;
}

:deep(.ant-table-row-level-0 > .ant-table-cell:nth-child(2)) {
  padding-left: 8px !important;
}

:deep(.nested-content) {
  margin-left: -8px;
  margin-right: -8px;
  padding: 0 !important;
}

.text-secondary {
  font-style: italic;
  color: rgb(0 0 0 / 45%);
}

:deep(.ant-table) {
  margin: 8px 0;
}

:deep(.ant-table-wrapper) {
  margin: 0;
}
</style>
