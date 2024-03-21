import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";
import { projectRoot } from "@/app/projectRoot";
import fs from 'fs';
import path from "path";

export async function POST( request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const data: DataAset = await request.json()
    const folderPath = data.id_aset.replaceAll(" ", "_") + "_" + data.nama_aset.replaceAll(" ", "_") 
    const publicPath = '/public/docs/'
    const fullPath = path.join(projectRoot, publicPath + folderPath)
    if (!fs.existsSync(fullPath)){
      fs.mkdirSync(fullPath)
      console.log(`Folder '${folderPath}' created successfully under the 'public' directory.`);
    } else {
      console.log(`Folder '${folderPath}' already exists.`);
    }
    await conn.query(`insert into aset (
        id_aset,
        tipe_aset,
        nama_aset,
        id_cabang,
        alamat,
        kota,
        status,
        folder_path
    ) values (?,?,?,?,?,?,?,?)`, 
      [data.id_aset, data.tipe_aset, data.nama_aset, data.id_cabang, data.alamat, data.kota, data.status, fullPath]
    )
    conn.end()
    return Response.json({status: 200})
  } catch (e) {
    console.log(e)
    return Response.json({status: 500})
  }
}
