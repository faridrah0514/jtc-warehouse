import { openDB } from "@/helper/db";

export async function GET() {
  const conn = await openDB()
  const data = await conn.all("select * from pelanggan")
  return Response.json({ data })
}
