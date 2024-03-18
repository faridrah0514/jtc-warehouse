import { openDB } from "@/helper/db";
import { DataCabang } from "@/app/types/master";
import { Database, Statement } from "sqlite3";

export async function GET(): Promise<Response> {
  const conn  = await openDB()
  const data: DataCabang = await conn.all("select * from cabang")
  return Response.json({ data })
}
