import type { Column } from '#/typing'

export const parser = (schema: object, data: object) => {
  const resTable: Column[] = []

  for (const key in data) {
    const value = data[key]
    const currentSchema = schema[key]
    if (!currentSchema) return

    const res: Column = {
      key,
      type: currentSchema.type,
      hasChild: false,
    }

    if (Array.isArray(value)) {
      if (currentSchema.items && currentSchema.items.type === 'object') {
        // 处理对象数组
        res.hasChild = true
        res.type = 'array'
        res.childrenColumn = [
          { title: '字段', dataIndex: 'key', width: '30%' },
          { title: '值', dataIndex: 'value' },
        ]
        res.childrenTable = value.map((item: object): Column => {
          const itemSchema = currentSchema.items.properties
          const parsedItems = parser(itemSchema, item)
          return {
            key: currentSchema.items,
            type: 'object',
            hasChild: true,
            childrenColumn: [
              { title: '字段', dataIndex: 'key', width: '30%' },
              { title: '值', dataIndex: 'value' },
            ],
            childrenTable: parsedItems,
          }
        })
      } else if (currentSchema.items && typeof value[0] === 'number') {
        // 处理简单数组
        res.type = 'simple_array'
        res.value = value
      } else {
        // 处理其他类型数组
        res.type = 'array'
        res.value = value
      }
    } else if (typeof value === 'object' && value !== null) {
      // 处理对象
      res.hasChild = true
      res.type = 'object'
      res.childrenColumn = [
        { title: '字段', dataIndex: 'key', width: '30%' },
        { title: '值', dataIndex: 'value' },
      ]
      res.childrenTable = parser(currentSchema.properties, value)
    } else {
      // 处理基本类型
      res.value = value
    }
    resTable.push(res)
  }
  return resTable
}

export const reverseParser = (parsedData: any[]): any => {
  const result: any = {}

  parsedData.forEach((item) => {
    if (item.type === 'array' && item.childrenTable) {
      result[item.key] = item.childrenTable.map((child: any) => {
        if (child.type === 'object') {
          return reverseParser(child.childrenTable)
        }
        return child.value
      })
    } else if (item.type === 'object') {
      result[item.key] = reverseParser(item.childrenTable)
    } else if (item.type === 'simple_array') {
      result[item.key] = Array.isArray(item.value) ? item.value : []
    } else {
      result[item.key] = item.value
    }
  })

  return result
}
