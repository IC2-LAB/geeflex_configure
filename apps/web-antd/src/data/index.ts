export const parser = (schema: any, data: any) => {
  const resTable = []
  const basicColumn = [
    { title: '字段', dataIndex: 'key', width: '30%' },
    { title: '值', dataIndex: 'value' },
  ]

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
        res.childrenColumn = [...basicColumn]
        res.childrenTable = value.map((item: any) => {
          const itemSchema = currentSchema.items.properties
          const parsedItems = parser(itemSchema, item)
          return {
            key,
            type: 'object',
            hasChildren: true,
            child: true,
            childrenColumn: [...basicColumn],
            childrenTable: parsedItems,
          }
        })
      } else {
        // 处理简单数组
        res.type = 'simple_array'
        res.value = value.join(', ')
      }
    } else if (typeof value === 'object' && value !== null) {
      // 处理对象
      res.hasChildren = true
      res.child = true
      res.type = 'object'
      res.childrenColumn = [...basicColumn]
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
    switch (item.type) {
      case 'array': {
        result[item.key] = item.childrenTable.map((child: any) => {
          if (child.type === 'object') {
            return reverseParser(child.childrenTable)
          }
          return child.value
        })

        break
      }
      case 'object': {
        result[item.key] = reverseParser(item.childrenTable)

        break
      }
      case 'simple_array': {
        result[item.key] = item.value
          .split(',')
          .map((v: string) => Number(v.trim()))

        break
      }
      default: {
        result[item.key] = item.value
      }
    }
  })

  return result
}
