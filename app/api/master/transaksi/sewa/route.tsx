import { openDB } from "@/helper/db";


export async function GET() {
  const conn = await openDB()
  const query = `
    select ts.id, c.nama_perusahaan nama_cabang, p.nama nama_pelanggan, a.nama_aset, ts.start_date_sewa, ts.end_date_sewa, ts.harga from transaksi_sewa ts 
    left join cabang c on ts.id_cabang =  c.id
    left join pelanggan p on ts.id_pelanggan = p.id
    left join aset a on ts.id_aset = a.id
  `
  const data = await conn.all(query)
  return Response.json({ data })
}

export async function POST(request: Request) {
  try {
    const conn = await openDB()
    const data = await request.json()
    if (data.requestType == 'delete') {
      await conn.run(`delete from transaksi_sewa where id = ?`, data.data.id)
      return Response.json({status: 200})
    } else {
      await conn.run(`
      insert into transaksi_sewa (
        id_cabang, id_pelanggan, id_aset,
        start_date_sewa, end_date_sewa,
        harga
      ) values (?,?,?,?,?,?)
    `, data.id_cabang, data.id_pelanggan, data.id_aset, data.start_date_sewa, data.end_date_sewa, data.harga)
    return Response.json({status: 200})
    }

  } catch (e) {
    console.log(e)
    return Response.json({status: 500})
  }
}