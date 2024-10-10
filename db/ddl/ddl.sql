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
  `id` int NOT NULL AUTO_INCREMENT,
  `id_aset` int NOT NULL,
  `id_cabang` int NOT NULL,
  `id_pelanggan` int NOT NULL,
  `bln_thn` varchar(12) DEFAULT NULL,
  `meteran_awal` float DEFAULT NULL,
  `meteran_akhir` float DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`),
  FOREIGN KEY (`id_aset`) REFERENCES `aset` (`id`),
  FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id`)
);

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
  `nama_cabang` json DEFAULT NULL,
  `nama_aset` json DEFAULT NULL,
  `periode` json DEFAULT NULL,
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` enum('admin','supervisor','reporter') NOT NULL DEFAULT 'reporter',
  `editable_until` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) 

CREATE TABLE cash_flow (
    id INT AUTO_INCREMENT PRIMARY KEY,               -- Auto-incrementing unique identifier for each cash flow record
    category_id VARCHAR(50) NOT NULL,                -- Foreign key to cash_flow_category table
    description VARCHAR(255) NOT NULL,               -- Description of the cash flow (e.g., 'Payment received')
    amount DECIMAL(10, 2) NOT NULL,                  -- Amount of the cash flow
    date DATE NOT NULL,                              -- Date of the cash flow
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Record creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Auto-updated timestamp on modification
    FOREIGN KEY (category_id) REFERENCES cash_flow_category(id)  -- Foreign key constraint to ensure valid category
);

CREATE TABLE cash_flow_category (
    id VARCHAR(50) PRIMARY KEY,               -- Category ID (e.g., 'CFI-001', 'CFO-001')
    name VARCHAR(100) NOT NULL,               -- Name of the category
    type ENUM('incoming', 'outgoing') NOT NULL, -- Type of cash flow
    description VARCHAR(255) DEFAULT NULL     -- Optional description for the category
);


-- jtc_warehouse.report_filters definition

-- jtc_warehouse.report_filters definition

CREATE TABLE `report_filters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cabang_id` int DEFAULT NULL,
  `cash_flow_type` enum('incoming','outgoing','both') DEFAULT NULL,
  `categories` json DEFAULT NULL,
  `period_type` enum('monthly','yearly') DEFAULT NULL,
  `period_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nama_cabang` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cabang_id` (`cabang_id`),
  CONSTRAINT `fk_cabang_id` FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`)
)
