import { openDB } from "@/helper/db";
import { DataCabang } from "@/app/types/master";
import { DataPelanggan } from "@/app/types/master";

export async function POST(request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    if (value.requestType == 'edit') {
      await conn.query(`
        update pelanggan set 
          nama = ?,
          alamat = ?,
          kota = ?,
          no_tlp = ?,
          contact_person = ?
        where
          id = ? 
      `, [data.nama, data.alamat, data.kota, data.no_tlp, data.nama_kontak, data.id])
    } else {
      await conn.query('insert into pelanggan (nama, alamat, kota, no_tlp, contact_person) values (?,?,?,?,?)',
        [data.nama, data.alamat, data.kota, data.no_tlp, data.nama_kontak]
      )
    }
    conn.end()
    return Response.json({ status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}
