export interface ColumnType {
  title?: string
  dataIndex: string | string[]
  key?: string
  width?: number | string
}

export type SchemaType =
  | 'array'
  | 'boolean'
  | 'enum'
  | 'integer'
  | 'number'
  | 'object'
  | 'simple_array'
  | 'string'

export interface Column {
  key: string
  type: SchemaType
  hasChild: boolean
  value?: any
  childrenTable?: Column[]
  childrenColumn?: ColumnType[]
}

export interface Case {
  id: string
  name: string
  path: string
}

export interface CaseData {
  data: object
  name: string
}

/* API types */
export interface ApplicationApiResp<T> {
  code: number
  msg?: string
  data?: T
}

export interface ApiResp<T> {
  code: number
  msg: string
  data: ApplicationApiResp<T>
}
