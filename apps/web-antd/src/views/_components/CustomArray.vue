/* eslint-disable no-console */
/* eslint-disable unicorn/prefer-structured-clone */
<script lang="ts" setup>
import type { ColumnType } from "#/typing";

import { computed, watch, nextTick } from "vue";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";

import CustomBoolean from "./CustomBoolean.vue";
import CustomInput from "./CustomInput.vue";
import CustomInputNumber from "./CustomInputNumber.vue";
import CustomObj from "./CustomObj.vue";

interface ArrayProps {
  table: any[];
  columns: ColumnType[];
  parentPath?: string;
}

const props = defineProps<ArrayProps>();
const emit = defineEmits<{
  "update:table": [
    data: any[],
    path?: string,
    type?: string,
    value?: any,
    operation?: "add" | "delete"
  ];
}>();

// 处理数据更新
const handleValueChange = (record: any, index: number, value: any) => {
  console.log("CustomArray handleValueChange:", {
    record,
    index,
    value,
    currentTable: props.table,
    parentPath: props.parentPath,
  });

  // 创建新的数组引用以触发响应式更新
  const newTable = [...props.table];

  // 更新嵌套对象中的值
  if (record.type === "object" && record.childrenTable) {
    // 处理数组中对象元素的更新
    const pathParts = value.path.split(".");
    const fieldKey = pathParts[pathParts.length - 1];

    // 更新对象中的特定字段
    if (record.childrenTable) {
      const fieldToUpdate = record.childrenTable.find(
        (field: any) => field.key === fieldKey
      );
      if (fieldToUpdate) {
        fieldToUpdate.value = value.value;
        // 同时更新原始数据
        newTable[index].childrenTable = [...record.childrenTable];
      }
    }

    // 发送更新事件，包含完整路径
    emit("update:table", newTable, value.path, value.type, value.value);
  } else {
    // 直接更新值
    newTable[index].value = value.value;

    // 发送基本类型的更新
    if (
      value.value !== undefined &&
      ["string", "number", "boolean"].includes(record.type)
    ) {
      const fullPath = props.parentPath
        ? `${props.parentPath}.${index}`
        : String(index);
      emit("update:table", newTable, fullPath, record.type, value.value);
    }
  }
};

// 在指定位置后添加新行
const handleAdd = (index: number) => {
  console.log("Adding new item after index:", index);

  // 创建新的数组引用以触发响应式更新
  const newTable = [...props.table];

  // 获取要复制的数据模板
  let templateData = {};
  if (index >= 0 && newTable[index]) {
    // 如果是在现有元素后添加，复制该元素的值
    templateData = JSON.parse(JSON.stringify(newTable[index].value || {}));
  } else if (newTable.length > 0) {
    // 如果是空数组，但数组中有其他元素，复制第一个元素的值
    templateData = JSON.parse(JSON.stringify(newTable[0].value || {}));
  }

  // 创建新项，继承类型信息
  const newItem = {
    key: newTable.length,
    type: props.table[0]?.type || "string",
    value: templateData,
    path: `${props.parentPath}.${newTable.length}`,
    hasChild: false,
    childrenColumn: [
      { dataIndex: "key", width: "30%" },
      { dataIndex: "value" },
    ],
  };

  // 如果是空数组，直接添加
  if (index === -1) {
    newTable.push(newItem);
  } else {
    newTable.splice(index + 1, 0, newItem);
  }

  // 先更新前端显示
  emit("update:table", newTable);

  // 数组操作需要立即同步到后端
  if (props.parentPath) {
    const newItemPath = `${props.parentPath}.${newTable.length - 1}`;
    const newItemValue = templateData;
    emit("update:table", newTable, newItemPath, "object", newItemValue, "add");
  }
};

// 删除指定行
const handleDelete = (index: number) => {
  console.log("Deleting item at index:", index);

  // 创建新的数组引用以触发响应式更新
  const newTable = [...props.table];

  // 构造要删除的元素的路径
  const deletePath = `${props.parentPath}.${index}`;

  // 删除元素
  newTable.splice(index, 1);

  // 更新剩余项的索引和路径
  newTable.forEach((item, idx) => {
    item.key = idx;
    item.path = `${props.parentPath}.${idx}`;
  });

  // 先更新前端显示
  emit("update:table", newTable);

  // 数组操作需要立即同步到后端
  if (props.parentPath) {
    emit("update:table", newTable, deletePath, "object", undefined, "delete");
  }
};

// 计算表格数据
const tableData = computed(() => {
  console.log("Computing tableData:", props.table);
  return props.table.map((item, index) => {
    // 处理嵌套对象
    if (item.type === "object" && item.childrenTable) {
      return {
        ...item,
        key: index,
        index,
        childrenTable: item.childrenTable.map((child: any) => ({
          ...child,
          path: `${props.parentPath}.${index}.${child.key}`,
          value: child.value,
        })),
      };
    }
    return {
      key: index,
      index,
      ...item,
    };
  });
});

// 监听 props.table 的变化
watch(
  () => props.table,
  (newVal, oldVal) => {
    console.log("props.table changed:", {
      oldValue: oldVal,
      newValue: newVal,
      valueChanged: JSON.stringify(oldVal) !== JSON.stringify(newVal),
    });
    // 强制更新表格数据
    tableData.value = computed(() => props.table).value;
  },
  { deep: true }
);
</script>

<template>
  <div class="array-table">
    <a-table
      :columns="[
        {
          title: '序号',
          dataIndex: 'index',
          width: '80px',
          align: 'center',
          customRender: ({ text }) => text + 1,
        },
        { title: '值', dataIndex: 'value', width: 'auto' },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '120px',
          align: 'center',
        },
      ]"
      :data-source="tableData"
      :pagination="false"
      bordered
      size="small"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'value'">
          <template v-if="record.type === 'object'">
            <CustomObj
              :columns="record.childrenColumn || []"
              :table="record.childrenTable || []"
              :parent-path="`${props.parentPath}.${index}`"
              @update:table="
                (val, path, type, value, operation) =>
                  emit('update:table', val, path, type, value, operation)
              "
            />
          </template>
          <template v-else-if="record.type === 'string'">
            <CustomInput
              :model-value="record.value"
              :path="`${props.parentPath}.${index}`"
              :type="record.type"
              @update:model-value="
                (val, path, type) =>
                  handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'number'">
            <CustomInputNumber
              :model-value="record.value"
              :path="`${props.parentPath}.${index}`"
              :type="record.type"
              @update:model-value="
                (val, path, type) =>
                  handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'boolean'">
            <CustomBoolean
              :model-value="record.value"
              :path="
                record.path ||
                (props.parentPath
                  ? `${props.parentPath}.${index}`
                  : String(index))
              "
              :type="record.type"
              @update:model-value="
                (val, path, type) => {
                  console.log('CustomArray received boolean update:', {
                    val,
                    path,
                    type,
                    record,
                    index,
                    recordPath: record.path,
                    parentPath: props.parentPath,
                    actualPath:
                      record.path ||
                      (props.parentPath
                        ? `${props.parentPath}.${index}`
                        : String(index)),
                    parentPathExists: Boolean(props.parentPath),
                  });

                  handleValueChange(
                    record,
                    index,
                    { value: val },
                    record.path ||
                      (props.parentPath
                        ? `${props.parentPath}.${index}`
                        : String(index))
                  );
                }
              "
            />
          </template>
          <template v-else>
            <span>{{ record.value }}</span>
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="operation-buttons">
            <a-button
              type="link"
              class="operation-button"
              @click="handleAdd(index)"
            >
              <PlusOutlined />
            </a-button>
            <a-button
              type="link"
              danger
              class="operation-button"
              @click="handleDelete(index)"
              :disabled="props.table.length <= 1"
            >
              <DeleteOutlined />
            </a-button>
          </div>
        </template>
      </template>
    </a-table>
    <div class="array-actions" v-if="props.table.length === 0">
      <a-button type="primary" size="small" @click="handleAdd(-1)">
        添加项
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.array-table {
  width: 100%;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.ant-table-cell) {
  padding: 8px !important;
}

:deep(.ant-table-row-level-0 > .ant-table-cell:nth-child(2)) {
  padding-left: 8px !important;
}

:deep(.ant-table-cell .ant-table-wrapper) {
  margin-left: -8px;
  margin-right: -8px;
}

:deep(.operation-button) {
  height: auto;
  padding: 4px 8px;
  line-height: 1;
}

:deep(.operation-button:hover) {
  background-color: rgb(0 0 0 / 4%);
  border-radius: 4px;
}

:deep(.operation-button .anticon) {
  font-size: 18px;
}

.array-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
