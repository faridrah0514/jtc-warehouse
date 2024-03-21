import { openDB } from "@/helper/db";
import { DataCabang } from "@/app/types/master";
import { Database, Statement } from "sqlite3";

export const dynamic = 'force-dynamic' 
export async function GET(): Promise<Response> {
  const conn = openDB()
  const [data, _]= await conn.query("select * from cabang")
  conn.end()
  return Response.json({ data })
}
