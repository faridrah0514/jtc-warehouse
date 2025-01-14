-- jtc_warehouse.cabang definition
CREATE TABLE `cabang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_perusahaan` varchar(100) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `no_tlp` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `kwh_rp` float DEFAULT NULL,
  `rek_bank_1` varchar(100) DEFAULT NULL,
  `rek_norek_1` varchar(100) DEFAULT NULL,
  `rek_atas_nama_1` varchar(100) DEFAULT NULL,
  `rek_bank_2` varchar(100) DEFAULT NULL,
  `rek_norek_2` varchar(100) DEFAULT NULL,
  `rek_atas_nama_2` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- jtc_warehouse.pelanggan definition
CREATE TABLE `pelanggan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `no_tlp` varchar(100) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- jtc_warehouse.tipe_aset definition
CREATE TABLE `tipe_aset` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipe_aset` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- jtc_warehouse.tipe_sertifikat definition
CREATE TABLE `tipe_sertifikat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipe_sertifikat` varchar(100) DEFAULT NULL,
  `masa_berlaku` tinyint(1) DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- jtc_warehouse.aset definition
CREATE TABLE `aset` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_aset` varchar(100) DEFAULT NULL,
  `id_tipe_aset` int NOT NULL,
  `nama_aset` varchar(100) DEFAULT NULL,
  `id_cabang` int NOT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `folder_path` varchar(255) DEFAULT NULL,
  `no_tlp` varchar(100) DEFAULT NULL,
  `no_rek_air` varchar(100) DEFAULT NULL,
  `no_rek_listrik` varchar(100) DEFAULT NULL,
  `no_pbb` varchar(100) NOT NULL,
  `id_tipe_sertifikat` int DEFAULT NULL,
  `no_sertifikat` varchar(100) DEFAULT NULL,
  `tanggal_akhir_hgb` varchar(50) DEFAULT NULL,
  `luas_lt1` varchar(50) DEFAULT NULL,
  `luas_lt2` varchar(50) DEFAULT NULL,
  `is_pln` int DEFAULT NULL,
  `luas_tanah` varchar(50) DEFAULT NULL,
  `luas_bangunan` varchar(50) DEFAULT NULL,
  `ipl` int DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`),
  FOREIGN KEY (`id_tipe_aset`) REFERENCES `tipe_aset` (`id`),
  FOREIGN KEY (`id_tipe_sertifikat`) REFERENCES `tipe_sertifikat` (`id`)
);

-- jtc_warehouse.transaksi_sewa definition
CREATE TABLE `transaksi_sewa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_transaksi` varchar(50) DEFAULT NULL,
  `no_akte` varchar(100) DEFAULT NULL,
  `tanggal_akte` varchar(12) DEFAULT NULL,
  `notaris` varchar(50) DEFAULT NULL,
  `id_cabang` int DEFAULT NULL,
  `id_pelanggan` int DEFAULT NULL,
  `id_aset` int DEFAULT NULL,
  `periode_pembayaran` varchar(20) DEFAULT NULL,
  `start_date_sewa` varchar(12) DEFAULT NULL,
  `end_date_sewa` varchar(12) DEFAULT NULL,
  `harga` int DEFAULT NULL,
  `total_biaya_sewa` int DEFAULT NULL,
  `ipl` int DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`),
  FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id`),
  FOREIGN KEY (`id_aset`) REFERENCES `aset` (`id`)
);

-- jtc_warehouse.transaksi_listrik definition

CREATE TABLE `transaksi_listrik` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_aset` int(11) NOT NULL,
  `id_cabang` int(11) NOT NULL,
  `id_pelanggan` int(11) NOT NULL,
  `bln_thn` varchar(12) DEFAULT NULL,
  `meteran_awal` decimal(10,2) DEFAULT NULL,
  `meteran_akhir` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_sewa` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cabang` (`id_cabang`),
  KEY `id_aset` (`id_aset`),
  KEY `id_pelanggan` (`id_pelanggan`),
  KEY `id_sewa` (`id_sewa`),
  CONSTRAINT `transaksi_listrik_ibfk_1` FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`),
  CONSTRAINT `transaksi_listrik_ibfk_2` FOREIGN KEY (`id_aset`) REFERENCES `aset` (`id`),
  CONSTRAINT `transaksi_listrik_ibfk_3` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id`),
  CONSTRAINT `transaksi_listrik_ibfk_4` FOREIGN KEY (`id_sewa`) REFERENCES `transaksi_sewa` (`id`)
) 

-- jtc_warehouse.transaksi_ipl definition
CREATE TABLE `transaksi_ipl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `periode_pembayaran` varchar(20) DEFAULT NULL,
  `id_cabang` int DEFAULT NULL,
  `id_pelanggan` int DEFAULT NULL,
  `id_aset` int DEFAULT NULL,
  `status_pembayaran` varchar(50) DEFAULT NULL,
  `ipl` int DEFAULT NULL,
  `tanggal_pembayaran` varchar(12) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`),
  FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id`),
  FOREIGN KEY (`id_aset`) REFERENCES `aset` (`id`)
);

-- jtc_warehouse.laporan definition
CREATE TABLE `laporan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_cabang` VARCHAR(255) DEFAULT NULL,
  `nama_aset` VARCHAR(255) DEFAULT NULL,
  `periode` VARCHAR(255) DEFAULT NULL,
  `jenis_laporan` varchar(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- jtc_warehouse.users definition

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` enum('admin','supervisor','reporter','finance','finance-reporter') NOT NULL DEFAULT 'reporter',
  `editable_until` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
)

CREATE TABLE cash_flow_category (
    id VARCHAR(50) PRIMARY KEY,               -- Category ID (e.g., 'CFI-001', 'CFO-001')
    name VARCHAR(100) NOT NULL,               -- Name of the category
    type ENUM('incoming', 'outgoing') NOT NULL, -- Type of cash flow
    description VARCHAR(255) DEFAULT NULL     -- Optional description for the category
);

CREATE TABLE `cash_flow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `folder_path` varchar(255) DEFAULT NULL,
  `nama_toko` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cabang_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `fk_cabang` (`cabang_id`),
  CONSTRAINT `cash_flow_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `cash_flow_category` (`id`),
  CONSTRAINT `fk_cabang` FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`)
)

-- jtc_warehouse.report_filters definition

CREATE TABLE `report_filters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_type` enum('period','category') DEFAULT 'period',
  `cabang_id` varchar(250) DEFAULT NULL,
  `cash_flow_type` enum('incoming','outgoing','both') DEFAULT NULL,
  `categories` json DEFAULT NULL,
  `period_type` enum('monthly','yearly', 'daily') DEFAULT NULL,
  `period_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nama_cabang` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
)


-- jtc_warehouse.user_actions definition

CREATE TABLE `user_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `tanggal` date NOT NULL DEFAULT curdate(),
  `action` varchar(255) NOT NULL,
  `jenis_laporan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
)