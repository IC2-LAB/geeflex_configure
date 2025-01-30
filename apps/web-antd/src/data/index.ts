import type { Column } from '#/typing'

interface SchemaProperty {
  type: string
  properties?: Record<string, SchemaProperty>
  items?: SchemaProperty
  description?: string
}

interface SchemaContext {
  path: string[]
  parentKey?: string
  rootData: any
}

// 创建默认上下文的工厂函数
const createDefaultContext = (data: any): SchemaContext => ({
  path: [],
  rootData: data,
})

// 创建调试工具函数，使用 import.meta.env 替代 process.env
const createDebugger =
  (enabled: boolean) =>
  // (message: string, ...args: any[]) => {
  () => {
    if (enabled) {
      // console.log(message, ...args)
    }
  }

export const parser = (
  schema: Record<string, SchemaProperty>,
  data: any,
  context = createDefaultContext(data),
): Column[] => {
  // 使用 import.meta.env 替代 process.env
  const debug = createDebugger(import.meta.env.DEV)

  // 在根数据中查找字段的所有实例及其路径
  const findFieldInData = (
    rootData: any,
    targetKey: string,
    currentPath: string[] = [],
  ): Array<{ path: string[]; value: any }> => {
    const results: Array<{ path: string[]; value: any }> = []

    const search = (obj: any, path: string[]) => {
      if (!obj || typeof obj !== 'object') return

      if (targetKey in obj) {
        results.push({ value: obj[targetKey], path: [...path, targetKey] })
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          search(item, [...path, index.toString()])
        })
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          search(value, [...path, key])
        })
      }
    }

    search(rootData, currentPath)
    return results
  }

  // 根据 Schema 获取字段的预期路径
  const getSchemaPath = (
    schema: any,
    targetKey: string,
    currentPath: string[] = [],
  ): null | string[] => {
    for (const [key, value] of Object.entries(schema)) {
      const newPath = [...currentPath, key]

      if (key === targetKey) {
        return newPath
      }

      if (value.properties) {
        const found = getSchemaPath(value.properties, targetKey, newPath)
        if (found) return found
      }

      if (value.items?.properties) {
        const found = getSchemaPath(value.items.properties, targetKey, [
          ...newPath,
          'items',
        ])
        if (found) return found
      }
    }
    return null
  }

  return Object.entries(schema).map(([key, schemaValue]) => {
    // 1. 获取字段在 Schema 中定义的路径
    const schemaPath = getSchemaPath(schema, key) || []

    // 2. 在整个数据中查找该字段的所有实例
    const foundInstances = findFieldInData(context.rootData, key)
    debug(`Found instances for "${key}":`, foundInstances)

    // 3. 选择最合适的值
    let currentData: any
    if (foundInstances.length > 0) {
      // 如果在当前路径下找到了值，优先使用
      const currentPathStr = context.path.join('.')
      const matchingInstance = foundInstances.find((instance) =>
        instance.path.join('.').startsWith(currentPathStr),
      )
      currentData = matchingInstance
        ? matchingInstance.value
        : foundInstances[0].value
    }

    debug(`Processing "${key}" at path ${context.path.join('.')}:`, {
      schemaType: schemaValue.type,
      value: currentData,
      schemaPath,
    })

    // 打印每个数据项的路径信息
    // console.log('Parsing item:', {
    //   key,
    //   schemaPath: schemaPath.join('.'),
    //   parentPath: context.path.join('.'),
    //   fullPath: `${context.path.join('.')}.${key}`,
    // })

    // 基本结构
    const baseItem: Column = {
      key,
      description: schemaValue.description,
      type: schemaValue.type,
      hasChild: false,
      value: currentData,
      path: context.path.length > 0 ? `${context.path.join('.')}.${key}` : key,
    }

    // 对象类型处理
    if (schemaValue.type === 'object' && schemaValue.properties) {
      const objectData =
        currentData && typeof currentData === 'object' ? currentData : {}
      return {
        ...baseItem,
        hasChild: true,
        childrenTable: parser(schemaValue.properties, objectData, {
          path: [...context.path, key],
          parentKey: key,
          rootData: context.rootData,
        }),
        childrenColumn: [
          { title: '字段', dataIndex: 'key', width: '30%' },
          { title: '值', dataIndex: 'value' },
        ],
      }
    }

    // 数组类型处理
    if (schemaValue.type === 'array' && schemaValue.items) {
      const arrayData = Array.isArray(currentData) ? currentData : []

      // 处理对象数组
      if (schemaValue.items.type === 'object' && schemaValue.items.properties) {
        const itemProperties = schemaValue.items.properties
        const processedItems = arrayData.map((item, index) => {
          const itemData = typeof item === 'object' && item !== null ? item : {}

          return {
            key: index,
            type: 'object',
            hasChild: true,
            childrenTable: parser(itemProperties, itemData, {
              path: [...context.path, key, index.toString()],
              parentKey: key,
              rootData: context.rootData,
            }),
            childrenColumn: [
              { title: '字段', dataIndex: 'key', width: '30%' },
              { title: '值', dataIndex: 'value' },
            ],
          }
        })

        return {
          ...baseItem,
          hasChild: true,
          childrenTable: processedItems,
          childrenColumn: [
            { title: '序号', dataIndex: 'key', width: '80px' },
            { title: '值', dataIndex: 'value' },
          ],
        }
      }

      // 处理基本类型数组
      return {
        ...baseItem,
        hasChild: true,
        childrenTable: arrayData.map((item, index) => ({
          key: index,
          type: typeof item,
          value: item,
          hasChild: false,
        })),
        childrenColumn: [
          { title: '序号', dataIndex: 'key', width: '80px' },
          { title: '值', dataIndex: 'value' },
        ],
      }
    }

    return baseItem
  })
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
