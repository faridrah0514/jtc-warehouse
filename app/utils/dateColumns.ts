// utils/dateColumns.ts
import dayjs from 'dayjs';
import { ColumnType } from 'antd/es/table';

export const getTanggalEntriColumn = (width?: number): ColumnType<any> => {
  const column: ColumnType<any> = {
    title: "Tanggal Entri",
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text: string) => dayjs(text).format('DD-MM-YYYY'), // Format the date
  };

  // Only add the width property if it's provided
  if (width) {
    column.width = width;
  }

  return column;
};
