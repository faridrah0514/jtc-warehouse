import { _renderCurrency } from "@/app/utils/renderCurrency";
import { openDB } from "@/helper/db";
import { c } from "tar";
import { RowDataPacket } from "mysql2";

import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const dynamic = "force-dynamic";
export async function GET() {
  const conn = openDB();
  //   const [data, _] = await conn.execute("select * from pelanggan")
  const [cabangData] = await conn.execute("select * from cabang");
  const [asetData] = await conn.execute<RowDataPacket[]>(
    "select a.* from aset a left join cabang c on a.id_cabang = c.id"
  );
  let [laporanData] = await conn.execute<RowDataPacket[]>(
    "select * from laporan"
  );

  // const []

  laporanData = laporanData.map((item) => {
    return {
      ...item,
      nama_cabang: item.nama_cabang?.join(", "),
      nama_aset: item.nama_aset?.join(", "),
      jenis_laporan: item.jenis_laporan
        .split("_") // Split the string by underscores
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(" "), // Join the words back with spaces // Join array elements with a comma and a space
      periode: dayjs(item.periode).year()
    };
  });
  conn.end();
  return Response.json({ cabangData, asetData, laporanData });
}

export async function POST(request: Request, response: Response) {
  try {
    const conn = openDB();
    const value = await request.json();
    const data = value.data;
    if (value.requestType == "add" && data) {
      await conn.query(
        `
            INSERT INTO Laporan (jenis_laporan, nama_cabang, nama_aset, periode) 
            VALUES (
                ?,?,?,?
            );
            `,
        [
          data.jenis_laporan,
          JSON.stringify(data.cabang),
          JSON.stringify(data.aset),
          JSON.stringify(data.periode),
        ]
      );
    } else if (value.requestType == "call-to-print" && data) {
      if (data.jenis_laporan.toLowerCase() == "cabang") {
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          `select 
                id, nama_perusahaan, alamat, kota, no_tlp, status Status, kwh_rp 'Rp/Kwh'
                from cabang where nama_perusahaan in (?)`,
          [data.nama_cabang.split(", ")]
        );
        // const [laporan, laporanFields] = await conn.query(`select
        //     * from cabang where nama_perusahaan in (?)`, [data.nama_cabang])
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id");
        columnNames.unshift("Nomor");

        laporan = laporan.map((item, idx) => {
          return {
            ...item,
            Nomor: idx + 1,
            "Rp/Kwh": _renderCurrency(item["Rp/Kwh"]),
          };
        });
        return Response.json({ laporan, columnNames });
      } else if (data.jenis_laporan.toLowerCase() == "aset" && data) {
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          `select c.nama_perusahaan, a.nama_aset, a.alamat, a.kota, a.no_tlp, a.luas_tanah , a.luas_bangunan  from aset a inner join cabang c 
on a.id_cabang = c.id  where a.nama_aset in (?) and c.nama_perusahaan in (?)`,
          [data.nama_aset.split(", "), data.nama_cabang.split(", ")]
        );
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id");
        columnNames.unshift("Nomor");
        laporan = laporan.map((item, idx) => {
          return {
            ...item,
            Nomor: idx + 1,
          };
        });
        return Response.json({ laporan, columnNames });
      } else if (data.jenis_laporan.toLowerCase() == "transaksi sewa") {
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          `
          SELECT 
              c.nama_perusahaan AS nama_cabang, 
              a.nama_aset, 
              p.nama AS nama_pelanggan, 
              ts.start_date_sewa AS awal_sewa, 
              ts.end_date_sewa AS akhir_sewa, 
              ts.harga AS harga_sewa, 
              ts.total_biaya_sewa AS total_harga_sewa,
              CASE 
                  WHEN ? BETWEEN YEAR(STR_TO_DATE(ts.start_date_sewa, '%d-%m-%Y')) 
                              AND YEAR(STR_TO_DATE(ts.end_date_sewa, '%d-%m-%Y')) 
                  THEN 'true'
                  ELSE 'false'
              END AS is_within_range
          FROM transaksi_sewa ts
          LEFT JOIN cabang c ON ts.id_cabang = c.id
          LEFT JOIN aset a ON ts.id_aset = a.id
          LEFT JOIN pelanggan p ON ts.id_pelanggan = p.id
          where a.nama_aset in (?) and c.nama_perusahaan in (?)
          `,
          [data.periode, data.nama_aset.split(", "), data.nama_cabang.split(", ")]
        );

        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .filter((fieldName) => fieldName != "is_within_range")
        columnNames.unshift("Nomor");
        laporan = laporan.filter(val => val.is_within_range == 'true').map((item, idx) => {
          return {
            ...item,
            Nomor: idx + 1,
            harga_sewa: _renderCurrency(item.harga_sewa),
            total_harga_sewa: _renderCurrency(item.total_harga_sewa)
          };
        });
        return Response.json({ laporan, columnNames });
      }
    } else {
      console.log("this");
    }
    conn.end();
    return Response.json({ status: 200, columnNames: [], laporan: [] });
  } catch (e) {
    console.log(e);
    return Response.json({ status: 500 });
  }
}
