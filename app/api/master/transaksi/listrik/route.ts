import { projectRoot } from "@/app/projectRoot";
import { openDB } from "@/helper/db";
import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import { RowDataPacket } from "mysql2";

export async function GET() {
    const conn = openDB()
    const query = `
      select tl.*, p.nama nama_pelanggan, c.nama_perusahaan nama_cabang, a.nama_aset nama_aset,
      c.alamat, c.kota, c.kwh_rp, 
      c.rek_bank_1, c.rek_norek_1, c.rek_atas_nama_1,
      c.rek_bank_2, c.rek_norek_2, c.rek_atas_nama_2
      from transaksi_listrik tl
      left join pelanggan p on tl.id_pelanggan = p.id
      left join cabang c on tl.id_cabang = c.id
      left join aset a on tl.id_aset = a.id
    `
    const [data, _] = await conn.execute(query)
    console.log("Data ----> ", data)
    conn.end()
    return Response.json({ data: data})
}

export async function POST(request: Request) {
  try {
    const conn = openDB();
    const value = await request.json();
    const data = value.data;
    console.log("Data ----> ", data)
    if (value.requestType == "add") {
      await conn.query(
        `insert into transaksi_listrik (
          id_aset, id_cabang, id_pelanggan, bln_thn, meteran_awal, meteran_akhir
        ) values (?,?,?,?,?,?)
      `,
        [
          data.id_aset,
          data.id_cabang,
          data.id_pelanggan,
          data.bln_thn,
          data.meteran_awal,
          data.meteran_akhir
        ]
      );
    } else if (value.requestType == 'edit') {
      await conn.query(
        `
          update transaksi_listrik set
          id_aset = ?, id_cabang = ?, id_pelanggan = ?, bln_thn = ?, meteran_awal = ?, meteran_akhir = ?
          where id = ?
        `,
        [
          data.id_aset,
          data.id_cabang,
          data.id_pelanggan,
          data.bln_thn,
          data.meteran_awal,
          data.meteran_akhir,
          data.id
        ]
      )
    } else if (value.requestType == 'delete') {
      await conn.query(`delete from transaksi_listrik where id = ?`, [data.id])
    }
    conn.end();
    return Response.json({ status: 200 });
  } catch (e) {
    console.log(e);
    return Response.json({ status: 500 });
  }
}