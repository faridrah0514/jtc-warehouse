import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";

export async function POST( request: Request, response: Response): Promise<Response> {
  try {
    const conn = await openDB()
    const data: DataAset = await request.json()
    await conn.run(`insert into aset (
        id_aset,
        tipe_aset,
        nama_aset,
        cabang,
        alamat,
        kota,
        status
    ) values (?,?,?,?,?,?,?)`, 
      data.id_aset, data.tipe_aset, data.nama_aset, data.cabang, data.alamat, data.kota, data.status
    )
    return Response.json({status: 200})
  } catch (e) {
    console.log(e)
    return Response.json({status: 500})
  }
}
