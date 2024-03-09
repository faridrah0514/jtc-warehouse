drop table cabang;

create table if not exists cabang(
    id integer primary key AUTOINCREMENT,
    nama_perusahaan text,
    alamat text,
    kota text,
    no_tlp integer,
    'status' text,
    kwh_rp real
);

insert into cabang
(nama_perusahaan, alamat, kota, no_tlp, 'status', kwh_rp)
VALUES
('Grab', 'South Quarter', 'Jakarta Selatan', '081299266009', 'Aktif', 100000);

insert into cabang
(nama_perusahaan, alamat, kota, no_tlp, 'status', kwh_rp)
VALUES
('Gojek', 'Pasaraya Tower', 'Jakarta Selatan', '081299266008', 'Aktif', 90000);