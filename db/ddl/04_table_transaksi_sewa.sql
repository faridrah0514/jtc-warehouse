drop table if EXISTS transaksi_sewa;

create table if not exists transaksi_sewa(
    id integer primary key AUTOINCREMENT,
    id_cabang text,
    id_pelanggan text,
    id_aset text,
    start_date_sewa text,
    end_date_sewa text,
    harga text,
    FOREIGN key (id_cabang) REFERENCES cabang(id),
    FOREIGN key (id_pelanggan) REFERENCES pelanggan(id),
    FOREIGN key (id_aset) REFERENCES aset(id)

);

insert into transaksi_sewa
(id_cabang, id_pelanggan, id_aset, start_date_sewa, end_date_sewa, harga) values 
(1, 1, 1, '2024-01-01', '2024-02-29', 'Rp500.000')
-- insert into aset (id_aset, tipe_aset, nama_aset, cabang, alamat, kota, 'status') VALUES (
--     'GD-01', 'Gudang', 'Aset Gudang Satu', 'PT Siji','Jalan Sukamaju', 'Jambi', 'Aktif'
-- );
-- insert into aset (id_aset, tipe_aset, nama_aset, cabang, alamat, kota, 'status') VALUES (
--     'RK-01', 'Ruko', 'Aset Ruko Satu', 'PT Loro', 'Jalan Sukamakan', 'Surabaya', 'Aktif'
-- );
-- insert into aset (id_aset, tipe_aset, nama_aset, cabang, alamat, kota, 'status') VALUES (
--     'PR-01', 'Perumahan', 'Aset Perumahan Satu', 'PT Loro', 'Jalan Sukaminum', 'Surabaya', 'Pasif'
-- );
