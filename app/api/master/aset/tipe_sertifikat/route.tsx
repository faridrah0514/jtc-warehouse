import { openDB } from "@/helper/db";

export const dynamic = 'force-dynamic'
export async function POST(request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    if (value.requestType == 'edit') {
      await conn.query(
        `update sertifikat set  
          tipe_sertifikat = ?,
        where
          id = ?    
        `,
        [data.tipe_sertifikat, data.id_sertifikat]
      )
    } else {
      console.log("data: ", data)
      await conn.query(`insert into tipe_sertifikat (tipe_sertifikat, masa_sertifikat) values (?,?)`,
        [data.tipe_sertifikat, data.masa_berlaku]
      )
    }
    conn.end()
    return Response.json({ status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ status: 500, message: e })
  }
}

export async function GET(): Promise<Response> {
  const conn = openDB()
  const [data, a] = await conn.query(`select * from tipe_sertifikat`)
  conn.end()
  return Response.json({ data })
}
