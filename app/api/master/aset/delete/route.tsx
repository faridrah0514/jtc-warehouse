import { openDB } from "@/helper/db";
import { DataCabang } from "@/app/types/master";
import { rimraf } from "rimraf";
import path from "path";
import { projectRoot } from "@/app/projectRoot";

export async function POST( request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const data = await request.json()
    const folderPath = path.join(projectRoot, "/public/docs/" + data.id_aset.replaceAll(" ", "_") + "_" + data.nama_aset.replaceAll(" ", "_"))
    await conn.query('delete from aset where id = ?', 
      [data.id]
    )
    conn.end()
    rimraf(folderPath).then((result) => {
      console.log(`Folder '${folderPath}' deleted successfully.`);
    }).catch((e) => {
      console.error(`Error deleting folder '${folderPath}':`, e);
    });
    return Response.json({status: 200})
  } catch (e) {
    console.log(e)
    return Response.json({status: 500})
  }
}
