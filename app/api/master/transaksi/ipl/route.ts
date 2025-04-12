import { projectRoot } from "@/app/projectRoot";
import { openDB } from "@/helper/db";
import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import { RowDataPacket } from "mysql2";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export async function GET() {
  const conn = openDB();
  const query = `
    SELECT ti.*, a.nama_aset, c.nama_perusahaan AS nama_cabang, p.nama AS nama_pelanggan, 
    case 
      when
        ti.ipl is not null then ti.ipl
      else
        ts.ipl
    end AS ipl,    
    p.alamat as alamat_pelanggan 
    FROM transaksi_ipl ti
    LEFT JOIN aset a ON a.id = ti.id_aset
    LEFT JOIN cabang c ON c.id = ti.id_cabang
    LEFT JOIN pelanggan p ON p.id = ti.id_pelanggan
    LEFT JOIN transaksi_sewa ts ON ts.id_cabang = ti.id_cabang 
        AND ts.id_aset = ti.id_aset 
        AND ts.id_pelanggan = ti.id_pelanggan
    WHERE 
      STR_TO_DATE(CONCAT(ti.periode_pembayaran, '-01'), '%Y-%m-%d') 
      BETWEEN STR_TO_DATE(ts.start_date_sewa, '%d-%m-%Y') 
      AND STR_TO_DATE(ts.end_date_sewa, '%d-%m-%Y')
      AND ts.ipl != 0
    ORDER BY ti.periode_pembayaran ASC
  `;
  const [data, _]: [RowDataPacket[], any] = await conn.execute(query);

  let obj: { [key: string]: any[] } = {};
  data.forEach((v: any, i: number) => {
    if (!obj[v.periode_pembayaran]) {
      obj[v.periode_pembayaran] = [];
    }
    obj[v.periode_pembayaran].push(v);
  });

  conn.end();
  return Response.json({ rawdata: data, dataobj: obj });
}

export async function POST(request: Request, response: Response) {
  try {
    const conn = openDB();
    const value = await request.json();
    const data = value.data;
    if (value.requestType == "add") {
      // get transaksi sewa
      const [dataSewa, a]: [RowDataPacket[], any] = await conn.query(
        `select * from transaksi_sewa`
      );

      // get transaksi ipl
      const [dataTransaksiIPL, b]: [RowDataPacket[], any] = await conn.query(
        `select * from transaksi_ipl`
      );

      // filter data sewa berdasarkan bulan_ipl yang diinput
      const bulan_ipl = dayjs(data.bulan_ipl, "YYYY-MM");
      const dataSewaFiltered = dataSewa.filter(
        (record) =>
          dayjs(
            dayjs(record.start_date_sewa, "DD-MM-YYYY").format("YYYY-MM"),
            "YYYY-MM"
          ) <= bulan_ipl &&
          bulan_ipl <=
            dayjs(
              dayjs(record.end_date_sewa, "DD-MM-YYYY").format("YYYY-MM"),
              "YYYY-MM"
            )
      );

      // cek apakah sudah ada transaksi ipl ?
      const dataTransaksiIPLFiltered = dataTransaksiIPL.filter((record) =>
        dayjs(record.periode_pembayaran, "YYYY-MM").isSame(bulan_ipl)
      );
      const nonExist = dataSewaFiltered.filter(
        (record) =>
          !dataTransaksiIPLFiltered.some(
            (item) =>
              item.id_cabang == record.id_cabang &&
              item.id_pelanggan == record.id_pelanggan &&
              item.id_aset == record.id_aset &&
              dayjs(item.periode_pembayaran, "YYYY-MM").isSame(bulan_ipl)
          )
      );
      if (nonExist.length > 0) {
        nonExist.forEach((e) => {
          conn.query(
            `
            insert into transaksi_ipl (periode_pembayaran, id_cabang, id_pelanggan, id_aset, status_pembayaran, ipl)
            values (?,?,?,?,?,?)
            `,
            [
              data.bulan_ipl,
              e.id_cabang,
              e.id_pelanggan,
              e.id_aset,
              "Belum Lunas",
              e.ipl
            ]
          );
        });
        conn.end();
        return Response.json({ status: 200 });
      } else {
        conn.end();
        return Response.json({ status: 204, message: 'Tidak ada aset yang disewa pada bulan ' + dayjs(data.bulan_ipl, "YYYY-MM").format("MM-YYYY")});
      }
    } else if (value.requestType == "ubahStatusPembayaran") {
      await conn.query(
        `update transaksi_ipl set
          status_pembayaran = ?,
          tanggal_pembayaran = ?
          where id_pelanggan = ? and id_aset = ? and id_cabang = ? and periode_pembayaran = ?
        `,
        [
          data.status_pembayaran,
          data.tanggal_pembayaran,
          data.id_pelanggan,
          data.id_aset,
          data.id_cabang,
          data.periode_pembayaran,
        ]
      );
      conn.end();
      return Response.json({ status: 200 });
    } else if (value.requestType == "delete_period") {
      await conn.query(
        `delete from transaksi_ipl 
        where periode_pembayaran = ?
        `,
        [data.periode_pembayaran]
      );
      conn.end();
      return Response.json({ status: 200 });
    }

  } catch (e) {
    console.log(e);
    return Response.json({ status: 500 });
  }
}
