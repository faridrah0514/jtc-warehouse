import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";
import fs from 'fs';
import { RowDataPacket } from 'mysql2';


export async function GET(): Promise<Response> {
  const conn = openDB()
  const [data, _] = await conn.query(`select a.id, a.id_aset, a.tipe_aset, a.nama_aset, c.nama_perusahaan cabang, a.alamat, a.kota, a.status, a.folder_path from aset a
  left join cabang c on a.id_cabang = c.id`) 
  const newData = data as RowDataPacket[]
  // console.log("newData ---> ", newData)
  for (const value of newData) {
    try {
      const listFiles = await fs.promises.readdir(value.folder_path);
      // console.log("listFiles --> ", listFiles)
      value.list_files = listFiles;
    } catch (error) {
      console.error(`Error processing data for folder '${value.folder_path}':`, error);
    }
  }

  conn.end()
  return Response.json({ data })
}
