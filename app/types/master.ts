export interface DataCabang {
    no: number,
    id: number,
    nama_perusahaan: string,
    alamat: string,
    kota: string,
    no_tlp: number,
    status: string,
    kwh_rp: number,
    kwh_rp_1: string,
    id_cabang: string
}

export interface DataPelanggan {
  no: number,
  id: number,
  nama: string,
  alamat: string,
  kota: string,
  no_tlp: number,
  nama_kontak: string
}

export interface DataUtility {
  id: number,
  IPL: string,
  awal: number,
  akhir: number,
  terpakai: number | 0,
  asset: string
}

export interface DataAset {
  id: number,
  no: number,
  id_aset: string,
  tipe_aset: string,
  nama_aset: string,
  id_cabang: number,
  alamat: string,
  kota: string,
  status: string,
  doc_list: string[],
  no_tlp: string,
  no_rek_air: string,
  no_rek_listrik: string,
  no_pbb: string,
  tipe_sertifikat: string,
  no_sertifikat: string,
  tanggal_akhir_hgb: string,
  list_files: string[],
  list_dir: string[],
  list_dir_files: any[]
}