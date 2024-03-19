import { openDB } from "@/helper/db";

export async function GET() {
  const conn = openDB()
  const [rows, fields] = await conn.query('select * from cabang')
  return Response.json({ data: rows })
}
