import type { SchemaProperty } from '../typing'

interface SchemaContext {
  path: string[]
  parentKey?: string
  rootData: any
}

// 创建默认上下文的工厂函数
const _createDefaultContext = (data: any): SchemaContext => ({
  path: [],
  rootData: data,
})

// 创建调试工具函数，使用 import.meta.env 替代 process.env
const _createDebugger =
  (enabled: boolean) =>
    (message: string, ...args: any[]) => {
      if (enabled) {
        // eslint-disable-next-line no-console
        console.log(message, ...args)
      }
    }

export function parser(schema: any, data: any, parentPath = '') {
  const result = [];

  for (const key in schema) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const schemaItem = schema[key];
    const value = data[key];

    // 确保数据存在
    if (!schemaItem) {
      console.warn(`Schema missing for key: ${key}`);
      continue;
    }

    const item = {
      key,
      type: schemaItem.type,
      value,
      path: currentPath,
      hasChild: schemaItem.type === 'object' || schemaItem.type === 'array',
      description: schemaItem.description,
      childrenColumn: [
        { dataIndex: 'key', width: '30%' },
        { dataIndex: 'value' }
      ]
    };

    if (item.hasChild) {
      if (schemaItem.type === 'object') {
        // 确保对象类型数据的正确处理
        const properties = schemaItem.properties || {};
        const objValue = value || {};
        item.childrenTable = parser(
          properties,
          objValue,
          currentPath
        );
      } else if (schemaItem.type === 'array') {
        // 处理数组类型
        const arrayValue = Array.isArray(value) ? value : [];
        item.childrenTable = arrayValue.map((arrayItem: any, index: number) => {
          return schemaItem.items?.type === 'object'
            ? {
              key: index,
              type: 'object',
              value: arrayItem,
              path: `${currentPath}.${index}`,
              hasChild: true,
              childrenColumn: [
                { dataIndex: 'key', width: '30%' },
                { dataIndex: 'value' }
              ],
              childrenTable: parser(
                schemaItem.items.properties || {},
                arrayItem,
                `${currentPath}.${index}`
              )
            }
            : {
              key: index,
              type: schemaItem.items?.type || 'string',
              value: arrayItem,
              path: `${currentPath}.${index}`,
              hasChild: false
            };
        });
      }
    }

    result.push(item);
  }

  return result;
}

export const reverseParser = (parsedData: any[]): any => {
  const result: any = {}

  parsedData.forEach((item) => {
    if (item.type === 'array' && item.childrenTable) {
      // 处理数组类型
      result[item.key] = item.childrenTable.map((child: any) => {
        if (child.type === 'object' && child.childrenTable) {
          // 处理对象数组项
          return reverseParser(child.childrenTable)
        }
        // 处理基本类型数组项
        return child.value
      })
    } else if (item.type === 'object' && item.childrenTable) {
      // 处理对象类型
      result[item.key] = reverseParser(item.childrenTable)
    } else {
      // 处理基本类型
      result[item.key] = item.value
    }
  })

  return result
}
