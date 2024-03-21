import { openDB } from "@/helper/db";

export const dynamic = 'force-dynamic' 
export async function GET() {
  const conn = openDB()
  const [data, _] = await conn.execute("select * from pelanggan")
  conn.end()
  return Response.json({ data })
}
