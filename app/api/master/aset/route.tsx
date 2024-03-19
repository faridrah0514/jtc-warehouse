import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";

export async function GET(): Promise<Response> {
  const conn  =  openDB()
  const [data, _] = await conn.query(`select a.id, a.id_aset, a.tipe_aset, a.nama_aset, c.nama_perusahaan cabang, a.alamat, a.kota, a.status from aset a
  left join cabang c on a.id_cabang = c.id`)
  conn.end()
  return Response.json({ data })
}
