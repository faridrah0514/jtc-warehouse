import { openDB } from "@/helper/db";

export const dynamic = 'force-dynamic' 
export async function GET() {
  // const conn = await openDB()
  // const data = await conn.query("select * from utility")
  return Response.json({ dummy: "dummy" })
}
