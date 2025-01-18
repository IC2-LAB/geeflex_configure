export interface SchemaProperty {
  type: string;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  description?: string;
}

export interface ColumnType {
  dataIndex: string;
  width?: string;
}

export interface Column {
  key: string | number;
  type: string;
  value: any;
  path?: string;
  hasChild?: boolean;
  description?: string;
  childrenColumn?: ColumnType[];
  childrenTable?: Column[];
}