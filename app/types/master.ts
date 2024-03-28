export interface DataCabang {
    no: number,
    id: number,
    nama_perusahaan: string,
    alamat: string,
    kota: string,
    no_tlp: number,
    status: string,
    kwh_rp: number
}

export interface DataPelanggan {
  no: number,
  id: number,
  nama: string,
  alamat: string,
  kota: string,
  no_tlp: number,
  contact_person: string
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
  doc_list: string[]
}