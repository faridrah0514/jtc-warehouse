drop table if EXISTS pelanggan;

create table if not exists pelanggan(
    id integer primary key AUTOINCREMENT,
    nama text,
    alamat text,
    kota text,
    no_tlp integer,
    contact_person text
);

insert into pelanggan (nama, alamat, kota, no_tlp, contact_person) VALUES ('Farid', 'Puri Beta', 'Tangerang', '081299266009', 'Farid');
insert into pelanggan (nama, alamat, kota, no_tlp, contact_person) VALUES ('Nazha', 'Jalan Ilyas', 'Bekasi', '081299266007', 'Farid');