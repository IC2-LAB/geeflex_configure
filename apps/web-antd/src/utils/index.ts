import { $t } from '#/locales'
/*
Schema Example:

{
  "type": "object",
  "properties": {
    "<field_name>": {
      "type": "string"
    },
    "<field_name>": {
      "type": "number"
    },
    "<field_name>": {
      "type": "object",
      "properties": {
        "<child_field_name>": {

        },
      }
    },
    "<field_name>": {
      "type": "array",
      "items": {
        "type": "number"
      }
    },
    "<field_name>": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "<child_field_name>": {}
        }
      }
    }
  }
*/

type JSONSchemaStringFormat =
  | 'date'
  | 'date-time'
  | 'duration'
  | 'email'
  | 'hostname'
  | 'ipv4'
  | 'ipv6'
  | 'time'
  | 'uri'
  | 'uuid'

type BasicStringType = 'string'
type BasicNumericType = 'integer' | 'number'
type BasicValueType = BasicNumericType | BasicStringType

type BasicSchema = {
  description?: string
}

type StringSchema = {
  format?: JSONSchemaStringFormat
  pattern?: string
  type: BasicStringType
} & BasicSchema

type NumberSchema = {
  exclusiveMaximum?: boolean
  exclusiveMinimum?: boolean
  maximum?: number
  minimum?: number
  type: BasicNumericType
} & BasicSchema

type BasicEnumSchema<T> = {
  enum: T[]
  type: BasicValueType
} & BasicSchema

/* 
{
  "type": "array",
  "item": {
    "type": "string"
  }
}
*/

type EnumSchema = BasicEnumSchema<number> | BasicEnumSchema<string>

type BasicSchemaType = EnumSchema | NumberSchema | StringSchema

type SimpleArraySchema = {
  item: BasicSchemaType
  type: 'array'
} & BasicSchema

type ObjectSchema = {
  properties: {
    [key: string]: BasicSchemaType | ObjectSchema | SimpleArraySchema
  }
  type: 'object'
} & BasicSchema

type ObjectArraySchema = {
  item: ObjectSchema
  type: 'array'
} & BasicSchema

type FullObjectSchema = {
  properties: {
    [key: string]:
      | BasicSchemaType
      | ObjectArraySchema
      | ObjectSchema
      | SimpleArraySchema
  }
  type: 'object'
} & BasicSchema

type FullSchemaType = FullObjectSchema | ObjectArraySchema | SimpleArraySchema

interface ColumnType {
  title?: string
  dataIndex: string | string[]
  key?: string
  width?: number | string
}

/*
child: false
type: 'array'
value: number[] | string[]
*/
type TableType = {
  child: boolean
  childColumn?: ColumnType[]
  key: string
  title: string
  tooltip?: string
  type: 'array' | 'object' | BasicValueType
  value: number | number[] | string | string[]
}

type ArrayTableType = {
  [key: string]: TableType
}

type FullTableType = {
  childTable?: ArrayTableType[] | TableType
} & TableType

interface Parser {
  (
    schema: FullSchemaType,
    data: { [key: string]: any },
  ): {
    column?: ColumnType[]
    table: FullTableType
  }
}

export const parser = function (schema, data) {
  const res = {}
  const resTable = []
  // const basicColumn = [
  //  {
  //    title: $t('configuration.meta.field'),
  //    key: 'key',
  //    dataIndex: 'key',
  //    width: '30%',
  //  },
  //  { title: $t('configuration.meta.value'), key: 'value', dataIndex: 'value' },
  // ]
  for (const key in data) {
    const currentSchema = schema[key]
    res.key = key
    res.title = key
    if ('description' in currentSchema) {
      res.description = currentSchema.description
    }
    res.type = currentSchema.type
    if (currentSchema.type === 'object') {
      res.child = true
      const { column, table } = parser(currentSchema.properties, data[key])
      res.childTable = table
      res.childColumn = column
    } else if (currentSchema.type === 'array') {
      if (currentSchema.items.type === 'object') {
        res.child = true
        const arrayColumn: ColumnType[] = []
        const arrayTable = []
        const innerSchema = currentSchema.items.properties
        for (const arrayKey in innerSchema) {
          const tempColumn = {
            title: arrayKey,
            dataIndex: [key, arrayKey],
            key: arrayKey,
          }
          arrayColumn.push(tempColumn)
        }
        res.childColumn = arrayColumn
        for (const arrayVal of data[key]) {
          const arrayItem = {}
          for (const tempKey in arrayVal) {
            arrayItem[tempKey] = parser(innerSchema[tempKey], arrayVal[tempKey])
          }
          arrayTable.push(arrayItem)
        }
        res.childTable = arrayTable
      } else {
        res.child = false
        res.value = data[key]
      }
    } else {
      res.child = false
      res.value = data[key]
    }
    resTable.push(res)
  }
  return resTable
}

export const basicParser: Parser = function (schema, data) {
  const schemaProperties = schema
  const res: FullTableType = {
    key: '',
    title: '',
    value: 0,
    type: 'string',
    child: false,
  }
  const column: ColumnType[] = [
    {
      title: $t('configuration.meta.field'),
      key: 'key',
      dataIndex: 'key',
      width: '30%',
    },
    { title: $t('configuration.meta.value'), key: 'value', dataIndex: 'value' },
  ]
  for (const key in data) {
    const currentSchema = schemaProperties
    const currentValue = data[key]
    if (currentSchema === undefined || currentValue === undefined) {
      return res
    }
    res.key = key
    res.title = key // $t(`configuration/test/${key}`)
    res.type = currentSchema.type
    if ('description' in currentSchema) {
      res.tooltip = currentSchema.description
    }
    switch (currentSchema.type) {
      case 'array': {
        const arrayRes = basicParser(currentSchema.item, currentValue)
        res.child = true
        res.childTable = arrayRes.table
        res.childColumn = arrayRes.column
        break
      }
      case 'object': {
        const objRes = basicParser(currentSchema.properties, currentValue)
        res.child = true
        res.childTable = objRes.table
        res.childColumn = column
        break
      }
      default: {
        res.value = currentValue
        break
      }
    }
  }
  return {
    column,
    table: res,
  }
}

// export function data2table: Data2Table (schema, data) {
//  for (const key in )
//
// }
