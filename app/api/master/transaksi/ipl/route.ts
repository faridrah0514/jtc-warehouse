import { projectRoot } from "@/app/projectRoot";
import { openDB } from "@/helper/db";
import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import { RowDataPacket } from "mysql2";
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat);

export async function GET() {
    const conn = openDB()
    const query  = `
      select ti.*, a.nama_aset, c.nama_perusahaan nama_cabang, p.nama nama_pelanggan from transaksi_ipl ti
      left join aset a on a.id = ti.id_aset
      left join cabang c on c.id = ti.id_cabang
      left join pelanggan p on p.id = ti.id_pelanggan
    `
    const [data, _]: [RowDataPacket[], any] = await conn.execute(query)
    let obj: { [key: string]: any[] } = {}; 
    data.forEach((v: any, i: number) => {
      // Assuming 'periode_pembayaran' is a string property in each object v
      if (!obj[v.periode_pembayaran]) {
        obj[v.periode_pembayaran] = []; // Initialize array if it doesn't exist
      }
      obj[v.periode_pembayaran].push(v); // Push 'aaaa' or any value you want into the array
    });
    conn.end()
    return Response.json({ rawdata: data, dataobj: obj })
}

export async function POST(request: Request) {
  try {
    const conn = openDB();
    const value = await request.json();
    const data = value.data;
    if (value.requestType == "add") {
      // get transaksi sewa
      const [dataSewa, a]: [RowDataPacket[], any] = await conn.query(`select * from transaksi_sewa`);

      // get transaksi ipl
      const [dataTransaksiIPL, b]: [RowDataPacket[], any]  = await conn.query(`select * from transaksi_ipl`)
      
      // filter data sewa berdasarkan bulan_ipl yang diinput
      const bulan_ipl = dayjs(data.bulan_ipl, 'YYYY-MM')
      const dataSewaFiltered = dataSewa.filter(record => dayjs(dayjs(record.start_date_sewa, 'DD-MM-YYYY').format("YYYY-MM"), 'YYYY-MM') <= bulan_ipl && bulan_ipl <= dayjs(dayjs(record.end_date_sewa, 'DD-MM-YYYY').format("YYYY-MM"), 'YYYY-MM'))

      // cek apakah sudah ada transaksi ipl ?
      const dataTransaksiIPLFiltered = dataTransaksiIPL.filter(record => dayjs(record.periode_pembayaran, 'YYYY-MM').isSame(bulan_ipl)) 
      const nonExist = dataSewaFiltered.filter(record => !dataTransaksiIPLFiltered.some(item => item.id_cabang == record.id_cabang && item.id_pelanggan == record.id_pelanggan && item.id_aset == record.id_aset && dayjs(item.periode_pembayaran, 'YYYY-MM').isSame(bulan_ipl)))

      if (nonExist) {
        nonExist.forEach(e => {
          conn.query(`
            insert into transaksi_ipl (periode_pembayaran, id_cabang, id_pelanggan, id_aset, status_pembayaran, ipl)
            values (?,?,?,?,?,?)
            `, [data.bulan_ipl, e.id_cabang, e.id_pelanggan, e.id_aset, 'Belum Lunas', e.ipl])
        });
       
      }
    }  else if (value.requestType == 'ubahStatusPembayaran') {
      console.log("data --=> ", data)
      await conn.query(
        `update transaksi_ipl set
          status_pembayaran = ?
          where id_pelanggan = ? and id_aset = ? and id_cabang = ? and periode_pembayaran = ?
        `, [data.status_pembayaran, data.id_pelanggan, data.id_aset, data.id_cabang, data.periode_pembayaran]
      )

    }

    // else if (value.requestType == 'edit') {
    //   await conn.query(
    //     `
    //       update transaksi_listrik set
    //       id_aset = ?, id_cabang = ?, id_pelanggan = ?, bln_thn = ?, meteran_awal = ?, meteran_akhir = ?
    //       where id = ?
    //     `,
    //     [
    //       data.id_aset,
    //       data.id_cabang,
    //       data.id_pelanggan,
    //       data.bln_thn,
    //       data.meteran_awal,
    //       data.meteran_akhir,
    //       data.id
    //     ]
    //   )
    // } else if (value.requestType == 'delete') {
    //   await conn.query(`delete from transaksi_listrik where id = ?`, [data.id])
    // }
    conn.end();
    return Response.json({ status: 200 });
  } catch (e) {
    console.log(e);
    return Response.json({ status: 500 });
  }
}