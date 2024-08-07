import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";
import { projectRoot } from "@/app/projectRoot";
import fs from 'fs';
import path from "path";

export async function POST(request: Request, response: Response): Promise<Response> {
  try {
    const conn = openDB()
    const value = await request.json()
    const data = value.data
    const folderPath = data.id_aset.replaceAll(" ", "_")
    const publicPath = '/upload/docs/'
    const fullPath = path.join(projectRoot, publicPath + folderPath)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath)
      console.log(`Folder '${folderPath}' created successfully under the 'public' directory.`);
    } else {
      console.log(`Folder '${folderPath}' already exists.`);
    }
    data.doc_list.forEach((value: any, i: number) => {
      const fullPath = path.join(projectRoot, publicPath + folderPath, value)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath)
        console.log(`Folder '${folderPath}' created successfully under the 'public' directory.`);
      } else {
        console.log(`Folder '${folderPath}' already exists.`);
      }
    })
    if (value.requestType == 'edit') {
      await conn.query(
        `update aset set 
          id_aset= ?,
          id_tipe_aset = ?,
          nama_aset = ?,
          id_cabang = ?,
          alamat = ?,
          kota = ?,
          status = ?,
          no_tlp = ?,
          no_rek_air = ?,
          no_rek_listrik = ?,
          no_pbb = ?,
          id_tipe_sertifikat = ?,
          no_sertifikat = ?,
          tanggal_akhir_hgb = ?,
          luas_lt1 = ?,
          luas_lt2 = ?,
          is_pln =?,
          luas_tanah = ?,
          luas_bangunan = ?,
          ipl = ?
        where
          id = ?    
        `,
        [data.id_aset, data.id_tipe_aset, data.nama_aset, data.id_cabang, data.alamat, data.kota, data.status, data.no_tlp, data.no_rek_air, data.no_rek_listrik, data.no_pbb, data.id_tipe_sertifikat, data.no_sertifikat, data.tanggal_akhir_hgb, data.luas_lt1, data.luas_lt2, data.is_pln, data.luas_tanah, data.luas_bangunan, data.ipl, data.id]
      )
    } else if (value.requestType == 'add') {
      const idAset = 'CB-' + data.id_cabang.toString().padStart(4, "0") + '-' + data.id_aset
      await conn.query(`insert into aset (
        id_aset,
        id_tipe_aset,
        nama_aset,
        id_cabang,
        alamat,
        kota,
        status,
        folder_path,
        no_tlp,
        no_rek_air,
        no_rek_listrik,
        no_pbb,
        id_tipe_sertifikat,
        no_sertifikat,
        tanggal_akhir_hgb,
        luas_lt1,
        luas_lt2,
        is_pln,
        luas_tanah,
        luas_bangunan,
        ipl
    ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [data.id_aset, data.id_tipe_aset, data.nama_aset, data.id_cabang, data.alamat, data.kota, data.status, fullPath, data.no_tlp, data.no_rek_air, data.no_rek_listrik, data.no_pbb, data.id_tipe_sertifikat, data.no_sertifikat, data.tanggal_akhir_hgb,
          data.luas_lt1, data.luas_lt2, data.is_pln, data.luas_tanah, data.luas_bangunan, data.ipl
        ]
      )
    }

    conn.end()
    return Response.json({ status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}
