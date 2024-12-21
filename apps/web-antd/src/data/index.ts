export const parser = (schema: any, data: any) => {
  const resTable = []

  Object.entries(data).forEach(([key, value]) => {
    const currentSchema = schema[key]
    if (!currentSchema) return

    const res: any = {
      key,
      type: currentSchema.type,
      hasChildren: false,
      child: false,
    }

    if (Array.isArray(value)) {
      if (currentSchema.items && currentSchema.items.type === 'object') {
        // 处理对象数组
        res.hasChildren = true
        res.child = true
        res.type = 'array'
        res.childrenColumn = [
          { title: '字段', dataIndex: 'key', width: '30%' },
          { title: '值', dataIndex: 'value' },
        ]
        res.childrenTable = value.map((item: any) => {
          const itemSchema = currentSchema.items.properties
          const parsedItems = parser(itemSchema, item)
          return {
            type: 'object',
            hasChildren: true,
            child: true,
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
      res.hasChildren = true
      res.child = true
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
  })

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
