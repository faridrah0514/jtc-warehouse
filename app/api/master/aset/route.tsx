import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";
import fs from 'fs';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic'
export async function GET(): Promise<Response> {
  const conn = openDB()
  const [data, a] = await conn.query(`select a.*, c.nama_perusahaan cabang, ta.tipe_aset tipe_aset, ts.tipe_sertifikat tipe_sertifikat  from aset a
  left join cabang c on a.id_cabang = c.id
  left join tipe_aset ta on a.id_tipe_aset = ta.id
  left join tipe_sertifikat ts on a.id_tipe_sertifikat = ts.id
  `)
  await conn.query(`ANALYZE TABLE ${process.env.MYSQL_DATABASE}.aset;`)
  const [maxId, b] = await conn.query(`SELECT AUTO_INCREMENT + 1 as max_id
  FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}' 
  AND TABLE_NAME = 'aset';`)
  const [tipe_aset, _] = await conn.query(`select * from tipe_aset`)
  const newData = data as RowDataPacket[]
  for (const value of newData) {
    try {
      const listDir = await fs.promises.readdir(value.folder_path);
      value.list_dir = listDir;
      value.list_files = listDir;
      value.list_dir_files = await Promise.all(value.list_dir.map(async (list_dir: string) => {
        try {
          const list_files = await fs.promises.readdir(value.folder_path + "/" + list_dir);
          return { [list_dir]: list_files };
        } catch (error) {
          console.error("Error reading directory:", error);
          return { [list_dir]: [] }; // Return an empty array if readdir fails
        }
      }));
    } catch (error) {
      console.error(`Error processing data for folder '${value.folder_path}':`, error);
    }
  }

  conn.end()
  return Response.json({ data: data, maxId, tipe_aset })
}
