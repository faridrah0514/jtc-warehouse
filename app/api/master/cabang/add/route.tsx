import { openDB } from "@/helper/db";
import { DataCabang } from "@/app/types/master";

export async function POST(request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    if (value.requestType == 'edit') {
      await conn.query(`update cabang set 
          nama_perusahaan = ?,
          alamat = ?,
          kota = ?,
          no_tlp = ?,
          status = ?,
          kwh_rp = ?
        where
          id = ?
      `, [data.nama_perusahaan, data.alamat, data.kota, data.no_tlp, data.status, data.kwh_rp, data.id])

    } else {
      await conn.query('insert into cabang (nama_perusahaan, alamat, kota, no_tlp, status, kwh_rp) values (?,?,?,?,?,?)',
        [data.nama_perusahaan, data.alamat, data.kota, data.no_tlp, data.status, data.kwh_rp]
      )
    }
    conn.end()
    return Response.json({ status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}
