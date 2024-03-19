import { openDB } from "@/helper/db";
import { DataCabang } from "@/app/types/master";

export async function POST( request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const data = await request.json()
    await conn.query('delete from aset where id = ?', 
      [data.id]
    )
    conn.end()
    return Response.json({status: 200})
  } catch (e) {
    console.log(e)
    return Response.json({status: 500})
  }
}
