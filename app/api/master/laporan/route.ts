import { _renderCurrency } from "@/app/utils/renderCurrency";
import { openDB } from "@/helper/db";
import { RowDataPacket } from "mysql2";
import "dayjs/locale/id";

import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.locale("id");

export const dynamic = "force-dynamic";

// Helper function to calculate masa using dayjs
const calculateMasa = (start: string, end: string) => {
  const startDate = dayjs(start, "DD-MM-YYYY");
  const endDate = dayjs(end, "DD-MM-YYYY");

  const diffInMonths = endDate.diff(startDate, "months", true); // Calculate month difference, accounting for days
  const years = Math.floor(diffInMonths / 12); // Full years
  const months = Math.round(diffInMonths % 12); // Remaining months

  return `${years} tahun ${months} bulan`;
};

export async function GET() {
  const conn = openDB();
  const [cabangData] = await conn.execute("select * from cabang");
  const [asetData] = await conn.execute<RowDataPacket[]>(
    "select a.* from aset a left join cabang c on a.id_cabang = c.id"
  );
  let [laporanData] = await conn.execute<RowDataPacket[]>(
    "select * from laporan"
  );

  laporanData = laporanData.map((item) => {
    return {
      ...item,
      nama_cabang: Array.isArray(item.nama_cabang)
        ? item.nama_cabang.join(", ")
        : item.nama_cabang || "",
      nama_aset: Array.isArray(item.nama_aset)
        ? item.nama_aset.join(", ")
        : item.nama_aset || "",
      jenis_laporan: item.jenis_laporan
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    };
  });
  conn.end();
  return Response.json({ cabangData, asetData, laporanData });
}

export async function POST(request: Request, response: Response) {
  try {
    const conn = openDB();
    const value = await request.json();
    const data = value.data;
    if (value.requestType == "add" && data) {
      await conn.query(
        `
            INSERT INTO laporan (jenis_laporan, nama_cabang, nama_aset, periode) 
            VALUES (
                ?,?,?,?
            );
            `,
        [data.jenis_laporan, data.cabang, data.aset, data.periode]
      );
    } else if (value.requestType == "call-to-print" && data) {
      if (data.jenis_laporan.toLowerCase() == "cabang") {
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          `select 
                id, nama_perusahaan, alamat, kota, no_tlp, status Status, kwh_rp 'Rp/Kwh'
                from cabang where nama_perusahaan in (?)`,
          [data.nama_cabang.split(", ")]
        );
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id");
        columnNames.unshift("Nomor");

        laporan = laporan.map((item, idx) => {
          return {
            ...item,
            Nomor: idx + 1,
            "Rp/Kwh": _renderCurrency(item["Rp/Kwh"]),
          };
        });
        return Response.json({ laporan, columnNames });
      } else if (data.jenis_laporan.toLowerCase() == "aset" && data) {
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          `select c.nama_perusahaan, a.nama_aset, a.alamat, a.kota, a.no_tlp, a.luas_tanah , a.luas_bangunan  from aset a inner join cabang c 
          on a.id_cabang = c.id  where a.nama_aset in (?) and c.nama_perusahaan in (?)`,
          [data.nama_aset.split(", "), data.nama_cabang.split(", ")]
        );
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id");
        columnNames.unshift("Nomor");
        laporan = laporan.map((item, idx) => {
          return {
            ...item,
            Nomor: idx + 1,
          };
        });
        return Response.json({ laporan, columnNames });
      } else if (data.jenis_laporan.toLowerCase() == "transaksi sewa") {
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          `
          SELECT
              c.nama_perusahaan AS nama_cabang, 
              a.nama_aset, 
              p.nama AS nama_pelanggan, 
              ts.start_date_sewa AS awal_sewa, 
              ts.end_date_sewa AS akhir_sewa, 
              ts.harga AS harga_sewa, 
              ts.total_biaya_sewa AS total_harga_sewa,
              CASE 
                  WHEN ? BETWEEN YEAR(STR_TO_DATE(ts.start_date_sewa, '%d-%m-%Y')) 
                              AND YEAR(STR_TO_DATE(ts.end_date_sewa, '%d-%m-%Y')) 
                  THEN 'true'
                  ELSE 'false'
              END AS is_within_range
          FROM transaksi_sewa ts
          LEFT JOIN cabang c ON ts.id_cabang = c.id
          LEFT JOIN aset a ON ts.id_aset = a.id
          LEFT JOIN pelanggan p ON ts.id_pelanggan = p.id
          where a.nama_aset in (?) and c.nama_perusahaan in (?)
          `,
          [
            data.periode,
            data.nama_aset.split(", "),
            data.nama_cabang.split(", "),
          ]
        );

        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .filter((fieldName) => fieldName != "is_within_range");
        columnNames.unshift("Nomor");
        laporan = laporan
          .filter((val) => val.is_within_range == "true")
          .map((item, idx) => {
            return {
              ...item,
              Nomor: idx + 1,
              harga_sewa: _renderCurrency(item.harga_sewa),
              total_harga_sewa: _renderCurrency(item.total_harga_sewa),
            };
          });
        return Response.json({ laporan, columnNames });
      } else if (data.jenis_laporan.toLowerCase() == "transaksi ipl") {
        let query = `
          SELECT c.nama_perusahaan nama_cabang, a.nama_aset, p.nama nama_pelanggan, 
                 ti.periode_pembayaran, ti.status_pembayaran, ti.tanggal_pembayaran, ts.ipl IPL
          FROM transaksi_ipl ti
          LEFT JOIN cabang c ON ti.id_cabang = c.id
          LEFT JOIN aset a ON ti.id_aset = a.id
          LEFT JOIN pelanggan p ON ti.id_pelanggan = p.id
          LEFT JOIN transaksi_sewa ts ON ts.id_cabang = ti.id_cabang 
                                       AND ts.id_aset = ti.id_aset 
                                       AND ts.id_pelanggan = ti.id_pelanggan
          WHERE LEFT(ti.periode_pembayaran, 4) = ?
        `;

        const queryParams = [data.periode];

        // Adjust for 'Semua Cabang'
        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() !== "semua cabang"
        ) {
          if (data.nama_aset) {
            query += " AND c.nama_perusahaan IN (?) AND a.nama_aset IN (?)";
            queryParams.push(
              data.nama_cabang.split(", "),
              data.nama_aset.split(", ")
            );
          } else {
            query += " AND c.nama_perusahaan IN (?)";
            queryParams.push(data.nama_cabang.split(", "));
          }
        }

        // Add ORDER BY clause here to make it apply regardless of conditions
        query += " ORDER BY ti.periode_pembayaran ASC";

        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );

        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .map((val: any) => ({
            title: val
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" "),
            dataIndex: val,
            key: val,
          }));

        laporan = laporan
          .map((item, idx) => ({
            ...item,
            Nomor: idx + 1,
            IPL: _renderCurrency(item.IPL),
          }))
          .map((item: any) => ({
            ...item,
            periode_pembayaran: dayjs(item.periode_pembayaran).format(
              "MMMM YYYY"
            ),
          }));

        const jenis_laporan = "DATA PEMAKAIAN IPL TAHUN " + data.periode;

        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() === "semua cabang"
        ) {
          const groupedLaporan = laporan.reduce((result: any, row) => {
            const { nama_cabang, nama_aset } = row;

            if (!result[nama_cabang]) {
              result[nama_cabang] = {};
            }

            if (!result[nama_cabang][nama_aset]) {
              result[nama_cabang][nama_aset] = [];
            }

            result[nama_cabang][nama_aset].push(row);
            return result;
          }, {});

          const response = Object.keys(groupedLaporan)
            .map((cabang) => {
              return Object.keys(groupedLaporan[cabang]).map((aset) => {
                return {
                  laporan: groupedLaporan[cabang][aset],
                  columnNames,
                  aset: [aset], // Always an array
                  cabang: [cabang], // Always an array
                  jenis_laporan,
                };
              });
            })
            .flat();
          return Response.json(response);
        } else {
          // For specific cabang, ensure single objects are arrays
          const laporanArray = Array.isArray(laporan) ? laporan : [laporan]; // Ensure laporan is always an array
          const asetArray = Array.isArray(data.nama_aset)
            ? data.nama_aset.split(", ")
            : [data.nama_aset]; // Ensure aset is an array
          const cabangArray = Array.isArray(data.nama_cabang)
            ? data.nama_cabang.split(", ")
            : [data.nama_cabang]; // Ensure cabang is an array

          return Response.json([
            {
              laporan: laporanArray,
              columnNames,
              aset: asetArray,
              cabang: cabangArray,
              jenis_laporan,
            },
          ]);
        }
      } else if (
        data.jenis_laporan.toLowerCase() == "transaksi listrik tahunan"
      ) {
        let query = `
          SELECT c.nama_perusahaan nama_cabang, a.nama_aset, p.nama nama_pelanggan, 
          tl.bln_thn Bulan, tl.meteran_awal, tl.meteran_akhir, tl.meteran_akhir - meteran_awal pemakaian, c.kwh_rp
          FROM transaksi_listrik tl
          LEFT JOIN pelanggan p ON tl.id_pelanggan = p.id
          LEFT JOIN cabang c ON tl.id_cabang = c.id
          LEFT JOIN aset a ON tl.id_aset = a.id
          WHERE RIGHT(tl.bln_thn, 4) = ?
        `;

        const queryParams = [data.periode];

        // Adjust for 'Semua Cabang'
        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() !== "semua cabang"
        ) {
          if (data.nama_aset) {
            query += " AND c.nama_perusahaan IN (?) AND a.nama_aset IN (?)";
            queryParams.push(
              data.nama_cabang.split(", "),
              data.nama_aset.split(", ")
            );
          } else {
            query += " AND c.nama_perusahaan IN (?)";
            queryParams.push(data.nama_cabang.split(", "));
          }
        }

        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );

        // Define all months in Indonesian
        const months = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];

        laporan = laporan.map((item, idx) => ({
          ...item,
          Bulan: dayjs(item.Bulan, "MM-YYYY").format("MMMM"),
          Nomor: idx + 1,
          kwh_rp: _renderCurrency(item.kwh_rp),
          total_tagihan: _renderCurrency(item.pemakaian * item.kwh_rp),
        }));

        const transformedData = [
          {
            rowHead: "Meteran Awal",
            ...months.reduce(
              (acc, month) => ({
                ...acc,
                [month]:
                  laporan.find((item) => item.Bulan === month)?.meteran_awal ||
                  "-",
              }),
              {}
            ),
          },
          {
            rowHead: "Meteran Akhir",
            ...months.reduce(
              (acc, month) => ({
                ...acc,
                [month]:
                  laporan.find((item) => item.Bulan === month)?.meteran_akhir ||
                  "-",
              }),
              {}
            ),
          },
          {
            rowHead: "Pemakaian",
            ...months.reduce(
              (acc, month) => ({
                ...acc,
                [month]:
                  laporan.find((item) => item.Bulan === month)?.pemakaian ||
                  "-",
              }),
              {}
            ),
          },
          {
            rowHead: "Kwh Rp",
            ...months.reduce(
              (acc, month) => ({
                ...acc,
                [month]:
                  laporan.find((item) => item.Bulan === month)?.kwh_rp || "-",
              }),
              {}
            ),
          },
          {
            rowHead: "Total Tagihan",
            ...months.reduce(
              (acc, month) => ({
                ...acc,
                [month]:
                  laporan.find((item) => item.Bulan === month)?.total_tagihan ||
                  "-",
              }),
              {}
            ),
          },
        ];

        // Define columns dynamically
        const columnNames = [
          {
            title: "Keterangan",
            dataIndex: "rowHead",
            key: "rowHead",
            rowScope: "row",
          },
          ...months.map((month) => ({
            title: month,
            dataIndex: month,
            key: month,
          })),
        ];

        const jenis_laporan = "DATA PEMAKAIAN LISTRIK TAHUN " + data.periode;

        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() === "semua cabang"
        ) {
          const groupedLaporan = laporan.reduce((result: any, row) => {
            const { nama_cabang, nama_aset } = row;

            if (!result[nama_cabang]) {
              result[nama_cabang] = {};
            }

            if (!result[nama_cabang][nama_aset]) {
              result[nama_cabang][nama_aset] = [];
            }

            result[nama_cabang][nama_aset].push(row);
            return result;
          }, {});

          const response = Object.keys(groupedLaporan)
            .map((cabang) => {
              return Object.keys(groupedLaporan[cabang]).map((aset) => {
                return {
                  laporan: transformedData, // Apply transformedData for grouped report
                  columnNames,
                  aset: [aset], // Always an array
                  cabang: [cabang], // Always an array
                  jenis_laporan,
                };
              });
            })
            .flat();
          return Response.json(response);
        } else {
          // For specific cabang, ensure single objects are arrays
          const laporanArray = Array.isArray(laporan) ? laporan : [laporan]; // Ensure laporan is always an array
          const asetArray = Array.isArray(data.nama_aset)
            ? data.nama_aset.split(", ")
            : [data.nama_aset]; // Ensure aset is an array
          const cabangArray = Array.isArray(data.nama_cabang)
            ? data.nama_cabang.split(", ")
            : [data.nama_cabang]; // Ensure cabang is an array

          return Response.json([
            {
              laporan: transformedData,
              columnNames,
              aset: asetArray,
              cabang: cabangArray,
              jenis_laporan,
            },
          ]);
        }
      } else if (data.jenis_laporan.toLowerCase() == "daftar penyewa per blok") {
        let query = `
          SELECT 
            c.nama_perusahaan AS nama_cabang, 
            p.nama AS nama_penyewa, 
            a.nama_aset AS nama_aset,
            a.no_sertifikat,
            CONCAT(a.luas_lt1, ' - ', a.luas_lt2) AS luas_bangunan,
            a.luas_tanah,
            ts.start_date_sewa AS mulai, 
            ts.end_date_sewa AS berakhir, 
            ts.total_biaya_sewa AS harga_sewa
          FROM transaksi_sewa ts
          LEFT JOIN cabang c ON ts.id_cabang = c.id
          LEFT JOIN pelanggan p ON ts.id_pelanggan = p.id
          LEFT JOIN aset a ON ts.id_aset = a.id
          WHERE 1
        `;
      
        const queryParams: any[] = [];
      
        // Handle specific cabang and aset filtering
        if (data.nama_cabang && data.nama_cabang.toLowerCase() !== "semua cabang") {
          if (data.nama_aset) {
            query += " AND c.nama_perusahaan IN (?) AND a.nama_aset IN (?)";
            queryParams.push(
              data.nama_cabang.split(", "),
              data.nama_aset.split(", ")
            );
          } else {
            query += " AND c.nama_perusahaan IN (?)";
            queryParams.push(data.nama_cabang.split(", "));
          }
        }
      
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(query, queryParams);
      
        // Extract unique values for all nama_aset
        const uniqueValues = laporan.reduce((acc: any, row: any) => {
          const key = row.nama_aset;
          if (!acc[key]) {
            acc[key] = {
              no_sertifikat: row.no_sertifikat,
              luas_bangunan: row.luas_bangunan,
              luas_tanah: row.luas_tanah
            };
          }
          return acc;
        }, {});
      
        // Format laporan data
        laporan = laporan.map((row: any, idx: number) => ({
          ...row,
          nomor: idx + 1,
          mulai: dayjs(row.mulai, "DD-MM-YYYY").format("D MMMM YYYY"), // Format mulai
          berakhir: dayjs(row.berakhir, "DD-MM-YYYY").format("D MMMM YYYY"), // Format berakhir
          masa: calculateMasa(row.mulai, row.berakhir), // Calculate masa
          // harga_sewa: _renderCurrency(row.harga_sewa),
        }));
      
        // Extract column names
        let columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => !["id", "no_sertifikat", "luas_bangunan", "luas_tanah"].includes(fieldName))
          .map((val: any, idx: number) => ({
            title: val
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" "),
            dataIndex: val,
            key: val,
          }));
      
        columnNames.unshift({
          title: "Nomor",
          dataIndex: "nomor",
          key: "nomor",
        });
      
        const jenis_laporan = "DAFTAR PENYEWA PER-BLOK";
      
        // Handle the case where nama_cabang is "Semua Cabang"
        if (data.nama_cabang && data.nama_cabang.toLowerCase() === "semua cabang") {
          // Group by cabang and then by aset
          const groupedLaporan = laporan.reduce((result: any, row) => {
            const { nama_cabang, nama_aset } = row;
      
            if (!result[nama_cabang]) {
              result[nama_cabang] = {};
            }
      
            if (!result[nama_cabang][nama_aset]) {
              result[nama_cabang][nama_aset] = {
                rows: [],
                total_harga_sewa: 0,
              };
            }
      
            result[nama_cabang][nama_aset].rows.push(row);
            result[nama_cabang][nama_aset].total_harga_sewa += parseFloat(row.harga_sewa);
            return result;
          }, {});
      
          const response = Object.keys(groupedLaporan).flatMap((cabang) =>
            Object.keys(groupedLaporan[cabang]).map((aset) => ({
              laporan: groupedLaporan[cabang][aset].rows.map((row: any, idx: number) => ({
                ...row,
                harga_sewa: _renderCurrency(row.harga_sewa),
              })), // Array of rows for the specific cabang and aset
              columnNames,
              aset: [aset], // Always an array
              cabang: [cabang], // Always an array
              no_sertifikat: uniqueValues[aset].no_sertifikat,
              luas_bangunan: uniqueValues[aset].luas_bangunan,
              luas_tanah: uniqueValues[aset].luas_tanah,
              total_harga_sewa: _renderCurrency(groupedLaporan[cabang][aset].total_harga_sewa), // Total harga sewa
              jenis_laporan,
            }))
          );
      
          return Response.json(response);
        } else {
          // Calculate total harga_sewa for specific cabang/aset
       
          const totalHargaSewa = laporan.reduce((acc: number, row: any) => acc + parseFloat(row.harga_sewa), 0);
      
          laporan = laporan.map((row: any, idx: number) => ({
            ...row,
            harga_sewa: _renderCurrency(row.harga_sewa),
          }));
          // For specific cabang, ensure single objects are arrays
          const laporanArray = Array.isArray(laporan) ? laporan : [laporan]; // Ensure laporan is always an array
          const asetArray = Array.isArray(data.nama_aset)
            ? data.nama_aset.split(", ")
            : [data.nama_aset]; // Ensure aset is an array
          const cabangArray = Array.isArray(data.nama_cabang)
            ? data.nama_cabang.split(", ")
            : [data.nama_cabang]; // Ensure cabang is an array
      
          return Response.json([
            {
              laporan: laporanArray,
              columnNames,
              aset: asetArray,
              cabang: cabangArray,
              no_sertifikat: uniqueValues[asetArray[0]]?.no_sertifikat,
              luas_bangunan: uniqueValues[asetArray[0]]?.luas_bangunan,
              luas_tanah: uniqueValues[asetArray[0]]?.luas_tanah,
              total_harga_sewa: _renderCurrency(totalHargaSewa), // Total for specific cabang/aset
              jenis_laporan,
            },
          ]);
        }
      }
      
       else if (
        data.jenis_laporan.toLowerCase() == "transaksi listrik bulanan"
      ) {

        let query = `
          SELECT c.nama_perusahaan AS nama_cabang, a.nama_aset, p.nama AS nama_pelanggan, 
          tl.bln_thn AS Bulan, tl.meteran_awal, tl.meteran_akhir, 
          tl.meteran_akhir - tl.meteran_awal AS pemakaian, 
          c.kwh_rp, 
          (tl.meteran_akhir - tl.meteran_awal) * c.kwh_rp AS total_biaya
          FROM transaksi_listrik tl
          LEFT JOIN pelanggan p ON tl.id_pelanggan = p.id
          LEFT JOIN cabang c ON tl.id_cabang = c.id
          LEFT JOIN aset a ON tl.id_aset = a.id
          WHERE tl.bln_thn = ?
        `;

        const queryParams = [data.periode];

        // Add conditions only if nama_cabang is provided
        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() !== "semua cabang"
        ) {
          if (data.nama_aset) {
            query += " AND c.nama_perusahaan IN (?) AND a.nama_aset IN (?)";
            queryParams.push(
              data.nama_cabang.split(", "),
              data.nama_aset.split(", ")
            );
          } else {
            query += " AND c.nama_perusahaan IN (?)";
            queryParams.push(data.nama_cabang.split(", "));
          }
        }

        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );

        // Apply currency formatting
        laporan = laporan.map((row) => ({
          ...row,
          kwh_rp: _renderCurrency(row.kwh_rp),
          total_biaya: _renderCurrency(row.total_biaya),
        }));

        // Extract column names
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .map((val: any) => ({
            title: val
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" "),
            dataIndex: val,
            key: val,
          }));

        // If nama_cabang is 'Semua Cabang', group by cabang and aggregate aset names
        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() === "semua cabang"
        ) {
          const groupedLaporan = laporan.reduce((result: any, row) => {
            const { nama_cabang, nama_aset } = row;

            if (!result[nama_cabang]) {
              result[nama_cabang] = {
                laporan: [],
                aset: new Set<string>(),
              };
            }

            result[nama_cabang].laporan.push(row);
            result[nama_cabang].aset.add(nama_aset);

            return result;
          }, {});

          const response = Object.keys(groupedLaporan).map((cabang) => ({
            laporan: groupedLaporan[cabang].laporan, // Always an array
            columnNames,
            aset: Array.from(groupedLaporan[cabang].aset), // Convert Set to array
            cabang: [cabang], // Always an array
            jenis_laporan:
              "DATA PEMAKAIAN LISTRIK " +
              dayjs(data.periode, "MM-YYYY").format("MMMM YYYY"),
          }));

          return Response.json(response);
        } else {
          // For specific cabang, ensure single objects are arrays
          const jenis_laporan =
            "DATA PEMAKAIAN LISTRIK " +
            dayjs(data.periode, "MM-YYYY").format("MMMM YYYY");

          const laporanArray = Array.isArray(laporan) ? laporan : [laporan]; // Ensure laporan is always an array
          const asetArray = Array.isArray(data.nama_aset)
            ? data.nama_aset.split(", ")
            : [data.nama_aset]; // Ensure aset is an array
          const cabangArray = Array.isArray(data.nama_cabang)
            ? data.nama_cabang.split(", ")
            : [data.nama_cabang]; // Ensure cabang is an array

          return Response.json([
            {
              laporan: laporanArray,
              columnNames,
              aset: asetArray,
              cabang: cabangArray,
              jenis_laporan,
            },
          ]);
        }
      } else if (data.jenis_laporan.toLowerCase() == "jatuh tempo") {
        let query = `
          SELECT c.nama_perusahaan AS nama_cabang, a.nama_aset, p.nama AS nama_penyewa, ts.end_date_sewa AS jatuh_tempo
          FROM transaksi_sewa ts
          LEFT JOIN cabang c ON ts.id_cabang = c.id
          LEFT JOIN aset a ON ts.id_aset = a.id
          LEFT JOIN pelanggan p ON ts.id_pelanggan = p.id
          WHERE RIGHT(ts.end_date_sewa, 4) = ?
        `;

        const queryParams = [data.periode];

        // Add conditions only if nama_cabang is provided
        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() !== "semua cabang"
        ) {
          query += " AND c.nama_perusahaan IN (?)";
          queryParams.push(data.nama_cabang.split(", "));
        }

        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );

        // Apply date formatting and add 'no' field
        laporan = laporan.map((data: any, idx: number) => ({
          ...data,
          no: idx + 1,
          jatuh_tempo: dayjs(data.jatuh_tempo, "DD-MM-YYYY").format(
            "DD MMMM YYYY"
          ), // Convert to month name in Bahasa Indonesia
        }));

        // Extract column names
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .map((val: any) => ({
            title: val
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" "),
            dataIndex: val,
            key: val,
          }));

        columnNames.unshift({ title: "No", dataIndex: "no", key: "no" });

        const jenis_laporan = "DAFTAR JATUH TEMPO TAHUN " + data.periode;

        if (
          data.nama_cabang &&
          data.nama_cabang.toLowerCase() === "semua cabang"
        ) {
          // Group by cabang and aggregate aset names
          const groupedLaporan = laporan.reduce((result: any, row) => {
            const { nama_cabang, nama_aset } = row;

            if (!result[nama_cabang]) {
              result[nama_cabang] = {
                laporan: [],
                aset: new Set<string>(),
              };
            }

            result[nama_cabang].laporan.push(row);
            result[nama_cabang].aset.add(nama_aset);

            return result;
          }, {});

          // Transform grouped data into the required format
          const response = Object.keys(groupedLaporan).map((cabang) => ({
            laporan: groupedLaporan[cabang].laporan, // Always an array
            columnNames,
            aset: Array.from(groupedLaporan[cabang].aset), // Convert Set to array
            cabang: [cabang], // Always an array
            jenis_laporan,
          }));
          return Response.json(response);
        } else {
          // For specific cabang, ensure single objects are arrays
          const laporanArray = Array.isArray(laporan) ? laporan : [laporan]; // Ensure laporan is always an array
          const asetArray = Array.isArray(data.nama_aset)
            ? data.nama_aset.split(", ")
            : [data.nama_aset]; // Ensure aset is an array
          const cabangArray = Array.isArray(data.nama_cabang)
            ? data.nama_cabang.split(", ")
            : [data.nama_cabang]; // Ensure cabang is an array
          return Response.json([
            {
              laporan: laporanArray,
              columnNames,
              aset: asetArray,
              cabang: cabangArray,
              jenis_laporan,
            },
          ]);
        }
      } else if (data.jenis_laporan.toLowerCase() === "daftar penyewa per tahun") {
        let query = `
          SELECT 
            p.nama AS nama_penyewa, 
            a.nama_aset AS nama_aset, 
            ts.start_date_sewa AS mulai, 
            ts.end_date_sewa AS berakhir, 
            ts.total_biaya_sewa AS harga_sewa, 
            ts.ipl AS IPL, 
            CONCAT(ts.no_akte, ' - ', ts.notaris) AS nomor_akta_dan_notaris
          FROM transaksi_sewa ts 
            LEFT JOIN cabang c ON ts.id_cabang = c.id
            LEFT JOIN pelanggan p ON ts.id_pelanggan = p.id
            LEFT JOIN aset a ON ts.id_aset = a.id
          WHERE YEAR(STR_TO_DATE(ts.start_date_sewa, '%d-%m-%Y')) <= ?
            AND YEAR(STR_TO_DATE(ts.end_date_sewa, '%d-%m-%Y')) >= ?
        `;
      
        const queryParams: any[] = [data.periode, data.periode];
      
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );
      
        // Format laporan data and calculate masa
        laporan = laporan.map((row: any, idx: number) => ({
          ...row,
          nomor: idx + 1,
          mulai: dayjs(row.mulai, "DD-MM-YYYY").format("D MMMM YYYY"), // Format mulai
          berakhir: dayjs(row.berakhir, "DD-MM-YYYY").format("D MMMM YYYY"), // Format berakhir
          masa: calculateMasa(row.mulai, row.berakhir), // Calculate masa using the helper function
          harga_sewa: _renderCurrency(row.harga_sewa),
          IPL: _renderCurrency(row.IPL),
        }));
      
        // Extract column names and add "Masa" before "Mulai"
        let columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName !== "id");
      
        // Add "Nomor" to the start of the columns
        columnNames.unshift("nomor");
      
        // Convert column names to the required format and place "Masa" before "Mulai"
        columnNames = columnNames.map((val: any) => ({
          title: val
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          dataIndex: val,
          key: val,
        }));
      
        // Find index of "mulai" and insert "Masa" before it
        columnNames.splice(
          columnNames.findIndex((column) => column.dataIndex === "mulai"), 0, {
            title: "Masa",
            dataIndex: "masa",
            key: "masa",
          }
        );
      
        const jenis_laporan = "DAFTAR PENYEWA PER-TAHUN";
      
        // Structure the response
        const response = {
          laporan,
          columnNames,
          aset: data.nama_aset,
          cabang: data.nama_cabang,
          jenis_laporan,
        };
      
        // Send the response
        return Response.json([response]);
      }
      
    } else if (value.requestType == "delete_laporan") {
      await conn.query(`delete from laporan where id  = ?`, data.id);
    } else {
      console.log("else");
    }
    conn.end();
    return Response.json({ status: 200, columnNames: [], laporan: [] });
  } catch (e) {
    console.log(e);
    return Response.json({ status: 500 });
  }
}
