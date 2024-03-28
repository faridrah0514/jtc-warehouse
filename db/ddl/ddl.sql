-- jtc_warehouse.cabang definition

CREATE TABLE `cabang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_perusahaan` varchar(100) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `no_tlp` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `kwh_rp` float DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- jtc_warehouse.aset definition

CREATE TABLE `aset` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_aset` varchar(100) DEFAULT NULL,
  `tipe_aset` varchar(100) DEFAULT NULL,
  `nama_aset` varchar(100) DEFAULT NULL,
  `id_cabang` int NOT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `folder_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`)
) ;

-- jtc_warehouse.pelanggan definition

CREATE TABLE `pelanggan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `no_tlp` varchar(100) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- jtc_warehouse.transaksi_sewa definition

CREATE TABLE `transaksi_sewa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_cabang` int DEFAULT NULL,
  `id_pelanggan` int DEFAULT NULL,
  `id_aset` int DEFAULT NULL,
  `start_date_sewa` text,
  `end_date_sewa` text,
  `harga` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cabang` (`id_cabang`),
  KEY `id_pelanggan` (`id_pelanggan`),
  KEY `id_aset` (`id_aset`),
  FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`),
  FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id`),
  FOREIGN KEY (`id_aset`) REFERENCES `aset` (`id`)
) ;