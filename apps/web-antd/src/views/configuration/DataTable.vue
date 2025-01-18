/* eslint-disable no-console */
/* eslint-disable unicorn/prefer-structured-clone */
/* eslint-disable unicorn/prefer-number-properties */
<script lang="ts" setup>
import type { ColumnType } from "#/typing";

import { onMounted, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import { parser } from "#/data/index";
import CustomObj from "#/views/_components/CustomObj.vue";

// import schemaData from '#/data/schemaData.json'
import { $t } from "#/locales";
import { useCaseStore } from "#/store";
import { API_BASE_URL } from "#/config";

const caseStore = useCaseStore();
const router = useRouter();
const caseName = router.currentRoute.value.name;
const loading = ref(false);
const fullCaseData = ref<any>(null);
const targetCase = ref<any>(null);

const columns = ref<ColumnType[]>([
  { dataIndex: "key", width: "30%" },
  { dataIndex: "value" },
]);

const tableData = ref<any[]>([]);

// 初始化数据
const initData = async () => {
  try {
    loading.value = true;
    await caseStore.fetchCases();
    const caseList = caseStore.cases;

    targetCase.value = caseList.find((item) => item.name === caseName);

    if (!targetCase.value) {
      throw new Error("Case not found in list");
    }

    await caseStore.fetchCase(targetCase.value.id);
    const caseData = caseStore.getCaseByName(caseName);

    if (!caseData || !caseData.schema || !caseData.case_data) {
      throw new Error("Invalid case data structure");
    }

    // 深拷贝数据以避免引用问题
    fullCaseData.value = {
      case_data: JSON.parse(JSON.stringify(caseData.case_data)),
      schema: JSON.parse(JSON.stringify(caseData.schema)),
    };

    // 解析数据
    const parsedData = parser(
      fullCaseData.value.schema.properties,
      fullCaseData.value.case_data
    );

    if (!Array.isArray(parsedData)) {
      throw new Error("Parser returned invalid data");
    }

    tableData.value = parsedData;
  } catch (error) {
    console.error("Failed to initialize case data:", error);
  } finally {
    loading.value = false;
  }
};

// 同步到后端
const syncToBackend = async (updateData: {
  path: string;
  value: any;
  type: string;
  operation?: string;
}) => {
  try {
    if (!targetCase.value?.id) {
      console.error("No target case id found");
      return;
    }

    const requestBody = {
      body: {
        path: updateData.path,
        value: updateData.value,
        type: updateData.type,
      },
    };

    if (updateData.operation) {
      requestBody.body.operation = updateData.operation;
    }

    await axios.patch(
      `${API_BASE_URL}/case/${targetCase.value.id}/sync`,
      requestBody
    );
  } catch (error) {
    console.error("Failed to sync:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
    });
  }
};

// 处理表格数据更新
const handleTableUpdate = async (
  newData: any[],
  path?: string,
  type?: string,
  value?: any,
  operation?: "add" | "delete"
) => {
  console.log("Handling table update:", {
    newData,
    path,
    type,
    value,
    operation,
  });

  if (!Array.isArray(newData)) {
    return;
  }

  // 处理数组操作
  if (path && type && operation) {
    try {
      // 获取数组的当前值
      const pathParts = path.split(".");
      let current = fullCaseData.value.case_data;

      // 找到要操作的数组
      const arrayPath = pathParts.slice(0, -1).join(".");
      const arrayPathParts = arrayPath.split(".");
      let arrayRef = current;
      for (const part of arrayPathParts) {
        arrayRef = arrayRef[part];
      }

      // 获取操作的索引
      const index = parseInt(pathParts[pathParts.length - 1]);

      // 根据操作类型更新数组
      if (operation === "add") {
        // 添加新元素
        arrayRef.splice(index, 0, value);
      } else if (operation === "delete") {
        // 删除元素
        arrayRef.splice(index, 1);
      }

      // 同步到后端
      await syncToBackend({
        path,
        value,
        type,
        operation,
      });

      // 重新解析数据
      const parsedData = parser(
        fullCaseData.value.schema.properties,
        fullCaseData.value.case_data
      );

      // 更新表格数据
      tableData.value = parsedData;

      // 强制更新组件
      fullCaseData.value = { ...fullCaseData.value };
    } catch (error) {
      console.error("Failed to handle array operation:", error);
    }
    return;
  }

  // 处理基本类型数据更新
  if (
    path &&
    type &&
    (value !== undefined || type === "boolean") &&
    ["string", "number", "boolean"].includes(type)
  ) {
    try {
      // 确保布尔值正确传递到后端
      const updateValue = type === "boolean" ? Boolean(value) : value;

      await syncToBackend({
        path,
        value: updateValue,
        type,
      });

      // 更新本地数据
      const pathParts = path.split(".");
      let current = fullCaseData.value.case_data;

      // 遍历路径直到倒数第二个部分
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        // 如果是数组索引
        if (!isNaN(Number(part))) {
          const index = Number(part);
          if (!Array.isArray(current)) {
            console.error(
              "Expected array at path:",
              pathParts.slice(0, i + 1).join(".")
            );
            return;
          }
          if (!current[index]) {
            current[index] = {};
          }
          current = current[index];
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }

      // 设置最终值
      const lastPart = pathParts[pathParts.length - 1];
      current[lastPart] = updateValue;

      // 重新解析数据
      const parsedData = parser(
        fullCaseData.value.schema.properties,
        fullCaseData.value.case_data
      );

      // 更新表格数据
      tableData.value = parsedData;
    } catch (error) {
      console.error("Failed to update data:", error);
    }
  }
};

// 监听数据变化
watch(
  () => tableData.value,
  (newVal) => {
    if (Array.isArray(newVal)) {
      // console.log('Table data updated:', newVal)
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <div class="configuration-container">
    <div v-if="loading" class="loading-state">Loading...</div>
    <div v-else>
      <CustomObj
        v-if="tableData.length > 0"
        :columns="columns"
        :table="tableData"
        @update:table="handleTableUpdate"
      />
      <div v-else class="no-data">No data available</div>
    </div>
  </div>
</template>

<style scoped>
.configuration-container {
  padding: 16px;
}

.loading-state {
  padding: 20px;
  text-align: center;
}

.no-data {
  padding: 20px;
  color: #999;
  text-align: center;
}
</style>
