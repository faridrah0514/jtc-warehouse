import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";

export async function GET(): Promise<Response> {
  const conn  = await openDB()
  const data: DataAset = await conn.all("select * from aset")
  // const allCabang: string[] = await conn.all("select nama_perusahaan from cabang")
  return Response.json({ data })
}
