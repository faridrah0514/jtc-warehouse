import { openDB } from "@/helper/db";


export async function GET() {
  const conn = openDB()
  const query = `
    select ts.*, ts.tanggal_akte as tanggal_akte_1, c.nama_perusahaan nama_cabang, p.nama nama_pelanggan, a.nama_aset from transaksi_sewa ts 
    left join cabang c on ts.id_cabang =  c.id
    left join pelanggan p on ts.id_pelanggan = p.id
    left join aset a on ts.id_aset = a.id
  `
  const [data, _] = await conn.execute(query)
  conn.end()
  return Response.json({ data })
}

export async function POST(request: Request) {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    // console.log("value -> ", value)
    // console.log("data: ", data)
    if (value.requestType == 'delete') {
      await conn.query(`delete from transaksi_sewa where id = ?`, [data.id])
      conn.end()
      return Response.json({ status: 200 })
    } else if (value.requestType == 'edit') {
      await conn.query(
        `update transaksi_sewa set 
        no_akte = ?, 
        tanggal_akte = ?, 
        notaris = ?,
        id_cabang = ?, 
        id_pelanggan = ?, 
        id_aset = ?, 
        periode_pembayaran = ?,
        start_date_sewa = ? , 
        end_date_sewa = ? ,
        harga =? , 
        total_biaya_sewa= ? 
        where
          id = ?    
        `,
        [
          data.no_akte, data.tanggal_akte, data.notaris,
          data.id_cabang, data.id_pelanggan, data.id_aset, data.periode_pembayaran,
          data.start_date_sewa, data.end_date_sewa,
          data.harga, data.total_biaya_sewa, data.id
        ]
      )
    } else {
      await conn.query(`
      insert into transaksi_sewa (
        no_akte, tanggal_akte, notaris,
        id_cabang, id_pelanggan, id_aset, periode_pembayaran,
        start_date_sewa, end_date_sewa,
        harga, total_biaya_sewa
      ) values (?,?,?,?,?,?,?,?,?,?,?)
    `, [
      data.no_akte, data.tanggal_akte, data.notaris,
      data.id_cabang, data.id_pelanggan, data.id_aset, data.periode_pembayaran,
      data.start_date_sewa, data.end_date_sewa,
      data.harga, data.total_biaya_sewa
    ])
      conn.end()
      return Response.json({ status: 200 })
    }

  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}