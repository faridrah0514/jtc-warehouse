import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";
import fs from 'fs';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic'
export async function GET(): Promise<Response> {
  const conn = openDB()
  const [data, _] = await conn.query(`select a.id, a.id_aset, a.tipe_aset, a.nama_aset, c.nama_perusahaan cabang, a.alamat, a.kota, a.status, a.folder_path from aset a
  left join cabang c on a.id_cabang = c.id`)
  const newData = data as RowDataPacket[]
  for (const value of newData) {
    try {
      const listDir = await fs.promises.readdir(value.folder_path);
      value.list_dir = listDir;
      value.list_files = listDir;
      console.log("value.list_dir", value.list_dir)
      // value.list_dir_files = await value.list_dir.map(
      //   async (list_dir: string, idx: number) => {
      //     console.log("aaaaa --->", value.folder_path + "/" + list_dir)
      //     const list_files = await fs.promises.readdir(value.folder_path + "/" + list_dir)
      //     console.log("list_files", list_files)
      //     // return { list_dir:  list_files}
      //     // const obj: { key: string[] } = {};
      //     // obj[list_dir] = list_files
      //     // return  obj
      //     if (list_files)
      //       return { [list_dir]: list_files }
      //     else {
      //       return { as: ""}
      //     }
      //   }
      //     // const a = {
      //     //   {value} : 
      //     // }


      // )
      value.list_dir_files = await Promise.all(value.list_dir.map(async (list_dir: string) => {
        try {
          const list_files = await fs.promises.readdir(value.folder_path + "/" + list_dir);
          return { [list_dir]: list_files };
        } catch (error) {
          console.error("Error reading directory:", error);
          return { [list_dir]: [] }; // Return an empty array if readdir fails
        }
      }));
      // console.log("value.list_dir_files -> ", value)
      // value.list_dir_files.forEach(
      //   (a) => console.log("bbbb -> ", a)
      // )
    } catch (error) {
      console.error(`Error processing data for folder '${value.folder_path}':`, error);
    }
  }

  conn.end()
  return Response.json({ data })
}
