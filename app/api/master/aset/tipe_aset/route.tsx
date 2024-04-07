import { openDB } from "@/helper/db";

export const dynamic = 'force-dynamic'
export async function POST(request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    if (value.requestType == 'edit') {
      await conn.query(
        `update tipe_aset set  
          tipe_aset = ?,
        where
          id = ?    
        `,
        [data.tipe_aset, data.id_aset]
      )
    } else {
      await conn.query(`insert into tipe_aset (tipe_aset) values (?)`,
      [data.tipe_aset]
    )
    }
    conn.end()
    return Response.json({ status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}

export async function GET(): Promise<Response> {
  const conn = openDB()
  const [data, a] = await conn.query(`select * from tipe_aset`)
  conn.end()
  return Response.json({ data })
}
