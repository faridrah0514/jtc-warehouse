drop table if EXISTS utility;

create table if not exists utility(
    id integer primary key AUTOINCREMENT,
    IPL text,
    awal real,
    akhir real,
    asset text
);

insert into utility (IPL, awal, akhir, asset) VALUES ('112233', 100, 50, 'Cabang 1');
insert into utility (IPL, awal, akhir, asset) VALUES ('122334', 200, 50, 'Cabang 2');
insert into utility (IPL, awal, akhir, asset) VALUES ('125434', 210, 45, 'Cabang 2');
