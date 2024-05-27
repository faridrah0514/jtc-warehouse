import { projectRoot } from "@/app/projectRoot";
import { openDB } from "@/helper/db";
import fs from 'fs';
import path from "path";
import { rimraf } from "rimraf";
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const conn = openDB()
  const txsPath = '/upload/txs'
  const query = `
    select ts.*, ts.tanggal_akte as tanggal_akte_1, c.nama_perusahaan nama_cabang, p.nama nama_pelanggan, a.nama_aset nama_aset from transaksi_sewa ts 
    left join cabang c on ts.id_cabang =  c.id
    left join pelanggan p on ts.id_pelanggan = p.id
    left join aset a on ts.id_aset = a.id
  `
  await conn.query(`ANALYZE TABLE ${process.env.MYSQL_DATABASE}.transaksi_sewa;`)
  const [maxId, b] = await conn.query(`SELECT AUTO_INCREMENT + 1 as max_id
  FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}' 
  AND TABLE_NAME = 'transaksi_sewa';`)
  const [data, _] = await conn.execute(query)
  const newData = data as RowDataPacket[]
  for (const value of newData) {
    try {
      value.list_files = await fs.promises.readdir(path.join(projectRoot, txsPath, value.id_transaksi));
    //   const listDir = await fs.promises.readdir(path.join(projectRoot, txsPath, value.id_transaksi));
    //   value.list_dir = listDir;
    //   value.list_files = listDir;
    //   value.list_dir_files = await Promise.all(value.list_dir.map(async (list_dir: string) => {
    //     try {
    //       const list_files = await fs.promises.readdir(value.folder_path + "/" + list_dir);
    //       return { [list_dir]: list_files };
    //     } catch (error) {
    //       console.error("Error reading directory:", error);
    //       return { [list_dir]: [] }; // Return an empty array if readdir fails
    //     }
    //   }));
    } catch (error) {
      console.error(`Error processing data for folder '${value.folder_path}':`, error);
    }
  }
  conn.end()
  return Response.json({ data: data, maxId: maxId })
}

export async function POST(request: Request) {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    const txsPath = '/upload/txs'
    const fullPath = path.join(projectRoot, txsPath, data.id_transaksi)
    if (value.requestType == 'delete') {
      await conn.query(`delete from transaksi_sewa where id = ?`, [data.id])
      rimraf(fullPath).then((result) => {
        console.log(`Folder '${fullPath}' deleted successfully.`);
      }).catch((e) => {
        console.error(`Error deleting folder '${fullPath}':`, e);
      });
      // conn.end()
      // return Response.json({ status: 200 })
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
        total_biaya_sewa = ?
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
      // request Type is add
      await conn.query(`
      insert into transaksi_sewa (
        no_akte, tanggal_akte, notaris,
        id_cabang, id_pelanggan, id_aset, periode_pembayaran,
        start_date_sewa, end_date_sewa,
        harga, total_biaya_sewa, id_transaksi
      ) values (?,?,?,?,?,?,?,?,?,?,?, ?)
    `, [
        data.no_akte, data.tanggal_akte, data.notaris,
        data.id_cabang, data.id_pelanggan, data.id_aset, data.periode_pembayaran,
        data.start_date_sewa, data.end_date_sewa,
        data.harga, data.total_biaya_sewa, data.id_transaksi
      ])
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath)
        console.log(`Folder '${data.id_transaksi}' created successfully under the 'public/upload/txs' directory.`);
      } else {
        console.log(`Folder '${data.id_transaksi}' already exists.`);
      }
    }
    conn.end()
    return Response.json({ status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}