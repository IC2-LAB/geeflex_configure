<script lang="ts" setup>
import type { ColumnType } from "#/typing";

import { computed } from "vue";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { syncData } from "#/utils/request";

import CustomBoolean from "./CustomBoolean.vue";
import CustomInput from "./CustomInput.vue";
import CustomInputNumber from "./CustomInputNumber.vue";
import CustomObj from "./CustomObj.vue";

interface ArrayProps {
  table: any[];
  columns: ColumnType[];
  parentPath: string;
  caseId: string;
}

const props = defineProps<ArrayProps>();
const emit = defineEmits(["update:table"]);

// 构建数组操作的路径
const buildArrayPath = (index: number, field?: string) => {
  if (!props.parentPath) return String(index);
  // 如果有字段名，构建如 "mme_list.0.mme_addr" 的路径
  if (field) {
    return `${props.parentPath}.${index}.${field}`;
  }
  // 否则构建如 "mme_list.0" 的路径
  return `${props.parentPath}.${index}`;
};

// 格式化序号显示
const formatIndex = (index: number) => {
  return index + 1; // 显示从1开始的序号
};

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
    // 检查是否是子表更新
    if (value.childrenTable) {
      // 直接更新子表
      newTable[index] = {
        ...record,
        childrenTable: value.childrenTable,
        key: index,
        hasChild: true,
      };
      emit("update:table", newTable);
      return;
    }

    // 处理数组中对象元素的更新
    let fieldKey = null;
    if (value.path) {
      const pathParts = value.path.split(".");
      fieldKey = pathParts[pathParts.length - 1];
    }

    // 更新对象中的特定字段
    if (fieldKey && record.childrenTable) {
      const fieldToUpdate = record.childrenTable.find(
        (field: any) => field.key === fieldKey
      );
      if (fieldToUpdate) {
        // 创建新的 childrenTable 数组
        const newChildrenTable = record.childrenTable.map((item) => {
          if (item.key === fieldKey) {
            return { ...item, value: value.value };
          }
          return { ...item };
        });

        // 更新整个对象，保持完整结构
        newTable[index] = {
          ...record,
          childrenTable: newChildrenTable,
          key: index,
          hasChild: true,
        };
      }
    }

    // 发送更新事件，包含完整路径
    if (fieldKey) {
      const fullPath = buildArrayPath(index, fieldKey);
      emit("update:table", newTable, fullPath, value.type, value.value);
    } else {
      emit("update:table", newTable);
    }
  } else {
    // 直接更新值，保持完整结构
    newTable[index] = {
      ...record,
      key: index,
      type: record.type,
      value: value.value,
      hasChild: false,
    };

    // 发送基本类型的更新
    if (
      value.value !== undefined &&
      ["string", "number", "boolean"].includes(record.type)
    ) {
      const fullPath = buildArrayPath(index);
      emit("update:table", newTable, fullPath, record.type, value.value);
    }
  }
};

// 在指定位置后添加新行
const handleAdd = async (index: number) => {
  console.log("Adding new item after index:", index);
  console.log("Current parent path:", props.parentPath);

  // 创建新的数组引用以触发响应式更新
  const newTable = [...props.table];

  // 获取要复制的完整数据
  let newItem = null;

  // 检查是否有有效的父路径
  if (!props.parentPath) {
    console.error("Parent path is required for array operations");
    return;
  }

  // 构建新项的路径
  const newIndex = index === -1 ? newTable.length : index + 1;
  const newPath = buildArrayPath(newIndex);

  if (index >= 0 && newTable[index]) {
    // 完全复制上一条数据
    newItem = JSON.parse(JSON.stringify(newTable[index]));

    try {
      // 调用后端接口添加新项
      await syncData({
        path: newPath,
        type: newItem.type,
        value: newItem.value,
        operation: "add",
        caseId: props.caseId,
      });

      // 插入新项
      if (index === -1) {
        newTable.push(newItem);
      } else {
        newTable.splice(index + 1, 0, newItem);
      }

      // 重新排序并更新所有项的路径
      newTable.forEach((item, idx) => {
        // 更新每个项的 key 和 path
        item.key = idx;
        item.path = buildArrayPath(idx);

        // 如果是对象类型，更新其子项的路径
        if (item.type === "object" && item.childrenTable) {
          item.childrenTable.forEach((child: any) => {
            child.path = `${item.path}.${child.key}`;
          });
        }
      });

      // 更新前端显示
      emit("update:table", newTable);
    } catch (error) {
      console.error(`Failed to add array item at ${newPath}:`, error);
    }
  } else if (newTable.length > 0) {
    // 复制第一条数据
    newItem = JSON.parse(JSON.stringify(newTable[0]));
  }

  // 数组操作需要立即同步到后端
  if (props.parentPath) {
    const newItemPath = buildArrayPath(newIndex);
    emit(
      "update:table",
      newTable,
      newItemPath,
      newItem.type,
      newItem.value,
      "add"
    );
  }
};

// 删除指定行
const handleDelete = async (index: number) => {
  console.log("Deleting item at index:", index);

  // 创建新的数组引用以触发响应式更新
  const newTable = [...props.table];

  // 获取要删除项的已存储路径
  const itemToDelete = props.table[index];
  // 检查是否有有效的父路径和要删除的项
  if (!props.parentPath || !itemToDelete) {
    console.error("Invalid delete operation");
    return;
  }

  try {
    // 调用后端接口删除项
    await syncData({
      path: itemToDelete.path || buildArrayPath(index), // 使用存储的路径或构建新路径
      type: itemToDelete.type,
      operation: "delete",
      caseId: props.caseId,
    });

    // 删除项
    newTable.splice(index, 1);

    // 重新排序并更新所有项的路径
    newTable.forEach((item, idx) => {
      // 更新每个项的 key 和 path
      item.key = idx;
      item.path = buildArrayPath(idx);

      // 如果是对象类型，更新其子项的路径
      if (item.type === "object" && item.childrenTable) {
        item.childrenTable.forEach((child: any) => {
          child.path = `${item.path}.${child.key}`;
        });
      }
    });

    // 更新前端显示
    emit("update:table", newTable);

    console.log("Array item deleted successfully", {
      deletedPath: itemToDelete.path,
      updatedTable: newTable,
    });
  } catch (error) {
    console.error(
      `Failed to delete array item at ${
        itemToDelete.path || buildArrayPath(index)
      }:`,
      error
    );
  }
};

// 计算表格数据
const tableData = computed(() => {
  return props.table.map((item, index) => ({
    key: index, // 保持 key 为数字索引
    ...item,
  }));
});
</script>

<template>
  <div class="array-table">
    <a-table
      :columns="[
        {
          title: '序号',
          dataIndex: 'key',
          width: '80px',
          align: 'center',
          customRender: ({ index }) => index + 1, // 直接使用表格行索引加1
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
              v-if="record.hasChild"
              :table="record.childrenTable"
              :columns="record.childrenColumn"
              :case-id="props.caseId"
              @update:table="
                (val) =>
                  handleValueChange(record, index, { childrenTable: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'string'">
            <CustomInput
              :model-value="record.value"
              tooltip-title="字符串"
              type="string"
              :path="record.path"
              :case-id="props.caseId"
              @update:model-value="
                (val) => handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'number'">
            <CustomInputNumber
              :model-value="record.value"
              tooltip-title="数值"
              type="number"
              @update:model-value="
                (val) => handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else-if="record.type === 'boolean'">
            <CustomBoolean
              :model-value="record.value"
              tooltip-title="布尔值"
              type="boolean"
              @update:model-value="
                (val) => handleValueChange(record, index, { value: val })
              "
            />
          </template>
          <template v-else>
            <span>{{ record.value }}</span>
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="operation-buttons">
            <a-button class="operation-button" size="middle" type="link">
              <PlusOutlined
                style="font-size: 18px"
                @click="() => handleAdd(index)"
              />
            </a-button>
            <a-button
              class="operation-button"
              danger
              size="middle"
              type="link"
              :disabled="props.table.length <= 1"
              @click="() => handleDelete(index)"
            >
              <DeleteOutlined style="font-size: 18px" />
            </a-button>
          </div>
        </template>
      </template>
    </a-table>
    <!-- 如果数组为空，显示添加按钮 -->
    <div v-if="tableData.length === 0" class="array-actions">
      <a-button size="small" type="primary" @click="() => handleAdd(-1)">
        添加
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
