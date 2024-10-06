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
    id_cabang: string,
    created_at: string
}

export interface DataPelanggan {
  no: number,
  id: number,
  nama: string,
  alamat: string,
  kota: string,
  no_tlp: number,
  nama_kontak: string,
  id_pelanggan: string,
  created_at: string,
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
  cabang: string,
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

// types.ts
export interface CashFlow {
  id: number; // or `string` if it's stored as a string in your database
  category_id: string;
  nama_perusahaan: string;
  description: string;
  amount: string; // or `number`, ensure it matches your backend type
  date: string; // Date in string format (e.g., ISO format)
  cabang_id: number 
}

export interface CashFlowCategory {
  id: string;
  name: string;
  type: 'incoming' | 'outgoing';
  description?: string;
}
