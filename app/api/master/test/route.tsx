import { openDB } from "@/helper/db";
import { NextRequest } from "next/server";


export async function handler(req: NextRequest) {
//   const conn = await openDB()
//   const query = `
//     select ts.id, c.nama_perusahaan nama_cabang, p.nama nama_pelanggan, a.nama_aset, ts.start_date_sewa, ts.end_date_sewa, ts.harga from transaksi_sewa ts 
//     left join cabang c on ts.id_cabang =  c.id
//     left join pelanggan p on ts.id_pelanggan = p.id
//     left join aset a on ts.id_aset = a.id
//   `
//   const data = await conn.all(query)
  console.log(req.nextUrl.pathname)
  if (req.nextUrl.pathname === '/a') {
    return Response.json({ satu: req.nextUrl.pathname })
  }
  return Response.json({ satu: "dua" })
}
