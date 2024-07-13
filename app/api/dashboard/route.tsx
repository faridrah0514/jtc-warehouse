import { openDB } from "@/helper/db";
import dayjs from 'dayjs';
import { RowDataPacket } from "mysql2";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const dynamic = 'force-dynamic'
export async function GET() {
  console.log("--------")
  const conn = openDB()
  const today = dayjs();
  const [jumlahData, _] = await conn.execute(`
    SELECT 
      (select count(*) from cabang) as jumlahCabang,
      (select count(*) from aset) as jumlahAset,
      (select count(*) from pelanggan) as jumlahPelanggan
    `)
  const [transaksiSewa, b]: [RowDataPacket[], any] = await conn.execute(`
      SELECT * from transaksi_sewa ts
      `)
  const jumlahStatusSewa = transaksiSewa
  .map(item => {
    if (dayjs(item.start_date_sewa, "DD-MM-YYYY").isAfter(today)) {
      item.status = 'Akan Datang';
    } else if (
      dayjs(item.start_date_sewa, "DD-MM-YYYY").isBefore(today) &&
      today.isBefore(dayjs(item.end_date_sewa, "DD-MM-YYYY"))
    ) {
      item.status = 'Aktif';
    } else {
      item.status = 'Non-Aktif';
    }
    return item;
  })
  .reduce((acc, item) => {
    if (acc[item.status!]) {
      acc[item.status!]++;
    } else {
      acc[item.status!] = 1;
    }
    return acc;
  }, {} as Record<string, number>);
  console.log("transaksi_sewa: ", jumlahStatusSewa)
  conn.end()
  return Response.json({ jumlahData, jumlahStatusSewa })
}


export async function POST(request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    // const folderPath = data.id_aset.replaceAll(" ", "_")
    // const publicPath = '/upload/docs/'
    // const fullPath = path.join(projectRoot, publicPath + folderPath)

    conn.end()
    return Response.json({ status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}
