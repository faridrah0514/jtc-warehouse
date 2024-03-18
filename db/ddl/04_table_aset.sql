drop table if EXISTS aset;

create table if not exists aset(
    id integer primary key AUTOINCREMENT,
    id_aset text,
    tipe_aset text,
    nama_aset text,
    cabang text,
    alamat text,
    kota text,
    'status' text
);

insert into aset (id_aset, tipe_aset, nama_aset, cabang, alamat, kota, 'status') VALUES (
    'GD-01', 'Gudang', 'Aset Gudang Satu', 'PT Siji','Jalan Sukamaju', 'Jambi', 'Aktif'
);
insert into aset (id_aset, tipe_aset, nama_aset, cabang, alamat, kota, 'status') VALUES (
    'RK-01', 'Ruko', 'Aset Ruko Satu', 'PT Loro', 'Jalan Sukamakan', 'Surabaya', 'Aktif'
);
insert into aset (id_aset, tipe_aset, nama_aset, cabang, alamat, kota, 'status') VALUES (
    'PR-01', 'Perumahan', 'Aset Perumahan Satu', 'PT Loro', 'Jalan Sukaminum', 'Surabaya', 'Pasif'
);
