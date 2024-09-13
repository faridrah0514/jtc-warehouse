import { _renderCurrency } from "@/app/utils/renderCurrency";
import { openDB } from "@/helper/db";
import { c } from "tar";
import { RowDataPacket } from "mysql2";
import "dayjs/locale/id";

import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.locale("id");

export const dynamic = "force-dynamic";
export async function GET() {
  const conn = openDB();
  //   const [data, _] = await conn.execute("select * from pelanggan")
  const [cabangData] = await conn.execute("select * from cabang");
  const [asetData] = await conn.execute<RowDataPacket[]>(
    "select a.* from aset a left join cabang c on a.id_cabang = c.id"
  );
  let [laporanData] = await conn.execute<RowDataPacket[]>(
    "select * from laporan"
  );

  // const []

  // laporanData = laporanData.map((item) => {
  //   return {
  //     ...item,
  //     nama_cabang: item.nama_cabang?.join(", "),
  //     nama_aset: item.nama_aset?.join(", "),
  //     jenis_laporan: item.jenis_laporan
  //       .split("_") // Split the string by underscores
  //       .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
  //       .join(" "), // Join the words back with spaces // Join array elements with a comma and a space
  //     periode: dayjs(item.periode).year()
  //   };
  // });
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
            select c.nama_perusahaan nama_cabang , a.nama_aset, p.nama nama_pelanggan, ti.periode_pembayaran, ti.status_pembayaran, ti.tanggal_pembayaran, ts.ipl from transaksi_ipl ti 
            left join cabang c on ti.id_cabang = c.id
            left join aset a on ti.id_aset = a.id 
            left join pelanggan p on ti.id_pelanggan = p.id 
            left join transaksi_sewa ts on ts.id_cabang = ti.id_cabang and ts.id_aset = ti.id_aset and ts.id_pelanggan = ti.id_pelanggan
            where LEFT(ti.periode_pembayaran, 4) = ? 
  `;

        const queryParams = [data.periode];

        // Add conditions only if both nama_cabang and nama_aset are provided
        if (data.nama_cabang && data.nama_aset) {
          query +=
            " AND c.nama_perusahaan IN (?) AND a.nama_aset IN (?) order by ti.periode_pembayaran asc";
          queryParams.push(
            data.nama_cabang.split(", "),
            data.nama_aset.split(", ")
          );
        } else if (data.nama_cabang) {
          // If only nama_cabang is provided
          query +=
            " AND c.nama_perusahaan IN (?) order by ti.periode_pembayaran asc";
          queryParams.push(data.nama_cabang.split(", "));
        }
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );
        ////////
        // let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
        //   `
        //     select c.nama_perusahaan nama_cabang , a.nama_aset, p.nama nama_pelanggan, ti.periode_pembayaran, ti.status_pembayaran, ti.tanggal_pembayaran, ts.ipl from transaksi_ipl ti
        //     left join cabang c on ti.id_cabang = c.id
        //     left join aset a on ti.id_aset = a.id
        //     left join pelanggan p on ti.id_pelanggan = p.id
        //     left join transaksi_sewa ts on ts.id_cabang = ti.id_cabang and ts.id_aset = ti.id_aset and ts.id_pelanggan = ti.id_pelanggan
        //     where a.nama_aset in (?) and c.nama_perusahaan in (?) and LEFT(ti.periode_pembayaran, 4) = ? order by ti.periode_pembayaran asc
        //     `,
        //   [
        //     data.nama_aset.split(", "),
        //     data.nama_cabang.split(", "),
        //     data.periode,
        //   ]
        // );
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .map((val: any, idx: number) => {
            return {
              title: val
                .split("_")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" "),
              dataIndex: val,
              key: val,
            };
          });
        laporan = laporan
          .map((item, idx) => {
            return {
              ...item,
              Nomor: idx + 1,
              ipl: _renderCurrency(item.ipl),
            };
          })
          .map((item: any) => ({
            ...item,
            periode_pembayaran: dayjs(item.periode_pembayaran).format(
              "MMMM YYYY"
            ),
          }));
        const jenis_laporan = "DATA PEMAKAIAN IPL TAHUN " + data.periode;
        return Response.json({
          laporan,
          columnNames,
          aset: data.nama_aset,
          cabang: data.nama_cabang,
          jenis_laporan,
        });
      } else if (
        data.jenis_laporan.toLowerCase() == "transaksi listrik tahunan"
      ) {
        let query = `
            select c.nama_perusahaan nama_cabang, a.nama_aset, p.nama nama_pelanggan, 
            tl.bln_thn Bulan, tl.meteran_awal, tl.meteran_akhir, tl.meteran_akhir - meteran_awal pemakaian, c.kwh_rp
            from transaksi_listrik tl
            left join pelanggan p on tl.id_pelanggan = p.id
            left join cabang c on tl.id_cabang = c.id
            left join aset a on tl.id_aset = a.id
            where RIGHT(tl.bln_thn, 4) = ?
      `;

        const queryParams = [data.periode];

        // Add conditions only if both nama_cabang and nama_aset are provided
        if (data.nama_cabang && data.nama_aset) {
          query += " AND c.nama_perusahaan IN (?) AND a.nama_aset IN (?)";
          queryParams.push(
            data.nama_cabang.split(", "),
            data.nama_aset.split(", ")
          );
        } else if (data.nama_cabang) {
          // If only nama_cabang is provided
          query += " AND c.nama_perusahaan IN (?)";
          queryParams.push(data.nama_cabang.split(", "));
        }
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );
        /////
        // let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
        //   `
        //     select c.nama_perusahaan nama_cabang, a.nama_aset, p.nama nama_pelanggan,
        //     tl.bln_thn Bulan, tl.meteran_awal, tl.meteran_akhir, tl.meteran_akhir - meteran_awal pemakaian, c.kwh_rp
        //     from transaksi_listrik tl
        //     left join pelanggan p on tl.id_pelanggan = p.id
        //     left join cabang c on tl.id_cabang = c.id
        //     left join aset a on tl.id_aset = a.id
        //     where a.nama_aset in (?) and c.nama_perusahaan in (?) and RIGHT(tl.bln_thn, 4) = ?
        //   `,
        //   [
        //     data.nama_aset.split(", "),
        //     data.nama_cabang.split(", "),
        //     data.periode,
        //   ]
        // );
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
        laporan = laporan.map((item, idx) => {
          return {
            ...item,
            Bulan: dayjs(item.Bulan, "MM-YYYY").format("MMMM"),
            Nomor: idx + 1,
            kwh_rp: _renderCurrency(item.kwh_rp),
            total_tagihan: _renderCurrency(item.pemakaian * item.kwh_rp),
          };
        });
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
        return Response.json({
          laporan: transformedData,
          columnNames,
          aset: data.nama_aset.split(", "),
          cabang: data.nama_cabang.split(", "),
          jenis_laporan,
        });
      } else if (
        data.jenis_laporan.toLowerCase() == "daftar penyewa per blok"
      ) {
        let query = `
            select p.nama nama_penyewa, a.nama_aset nama_aset, 
              CONCAT(
                FLOOR(TIMESTAMPDIFF(MONTH, 
                  STR_TO_DATE(ts.start_date_sewa, '%d-%m-%Y'), 
                  STR_TO_DATE(ts.end_date_sewa, '%d-%m-%Y')
                ) / 12), ' tahun ',
                MOD(TIMESTAMPDIFF(MONTH, 
                  STR_TO_DATE(ts.start_date_sewa, '%d-%m-%Y'), 
                  STR_TO_DATE(ts.end_date_sewa, '%d-%m-%Y')
                ), 12), ' bulan'
              ) AS masa,
            ts.start_date_sewa mulai, ts.end_date_sewa berakhir, ts.total_biaya_sewa harga_sewa
          from transaksi_sewa ts 
            left join cabang c on ts.id_cabang =  c.id
            left join pelanggan p on ts.id_pelanggan = p.id
            left join aset a on ts.id_aset = a.id
            where 
      `;

        const queryParams = [];

        // Add conditions only if both nama_cabang and nama_aset are provided
        if (data.nama_cabang && data.nama_aset) {
          query += " c.nama_perusahaan IN (?) AND a.nama_aset IN (?)";
          queryParams.push(
            data.nama_cabang.split(", "),
            data.nama_aset.split(", ")
          );
        } else if (data.nama_cabang) {
          // If only nama_cabang is provided
          query += " c.nama_perusahaan IN (?)";
          queryParams.push(data.nama_cabang.split(", "));
        }
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );
        
        

        laporan = laporan.map((row: any, idx: number) => ({
          ...row,
          // kwh_rp: _renderCurrency(row.kwh_rp),
          nomor: idx + 1,
          mulai: dayjs(row.mulai, 'DD-MM-YYYY').format('D MMMM YYYY'), // Format mulai
          berakhir: dayjs(row.berakhir, 'DD-MM-YYYY').format('D MMMM YYYY'), // Format berakhir
          harga_sewa: _renderCurrency(row.harga_sewa),
        }));
        let columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")

        columnNames.unshift("nomor");

        columnNames = columnNames
          .map((val: any, idx: number) => {
            return {
              title: val
                .split("_")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" "),
              dataIndex: val,
              key: val,
            };
          });
        const jenis_laporan = "DAFTAR PENYEWA PER-BLOK";
        return Response.json({
          laporan,
          columnNames,
          aset: data.nama_aset.split(", "),
          cabang: data.nama_cabang.split(", "),
          jenis_laporan,
        });
      } else if (
        data.jenis_laporan.toLowerCase() == "transaksi listrik bulanan"
      ) {
        let query = `
        SELECT c.nama_perusahaan nama_cabang, a.nama_aset, p.nama nama_pelanggan, 
        tl.bln_thn Bulan, tl.meteran_awal, tl.meteran_akhir, 
        tl.meteran_akhir - tl.meteran_awal pemakaian, 
        c.kwh_rp, 
        (tl.meteran_akhir - tl.meteran_awal) * c.kwh_rp total_biaya
        FROM transaksi_listrik tl
        LEFT JOIN pelanggan p ON tl.id_pelanggan = p.id
        LEFT JOIN cabang c ON tl.id_cabang = c.id
        LEFT JOIN aset a ON tl.id_aset = a.id
        WHERE tl.bln_thn = ?
      `;

        const queryParams = [data.periode];

        // Add conditions only if both nama_cabang and nama_aset are provided
        if (data.nama_cabang && data.nama_aset) {
          query += " AND c.nama_perusahaan IN (?) AND a.nama_aset IN (?)";
          queryParams.push(
            data.nama_cabang.split(", "),
            data.nama_aset.split(", ")
          );
        } else if (data.nama_cabang) {
          // If only nama_cabang is provided
          query += " AND c.nama_perusahaan IN (?)";
          queryParams.push(data.nama_cabang.split(", "));
        }
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          query,
          queryParams
        );
        // Apply the _renderCurrency function to the kwh_rp and total_biaya fields
        laporan = laporan.map((row) => ({
          ...row,
          kwh_rp: _renderCurrency(row.kwh_rp),
          total_biaya: _renderCurrency(row.total_biaya),
        }));
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .map((val: any, idx: number) => {
            return {
              title: val
                .split("_")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" "),
              dataIndex: val,
              key: val,
            };
          });
        const jenis_laporan =
          "DATA PEMAKAIAN LISTRIK " +
          dayjs(data.periode, "MM-YYYY").format("MMMM YYYY");
        return Response.json({
          laporan,
          columnNames,
          aset: data.nama_aset.split(", "),
          cabang: data.nama_cabang.split(", "),
          jenis_laporan,
        });
      } else if (data.jenis_laporan.toLowerCase() == "jatuh tempo") {
        let [laporan, laporanFields] = await conn.query<RowDataPacket[]>(
          `
            select p.nama 'nama_penyewa', a.nama_aset 'nama_aset', ts.end_date_sewa 'jatuh_tempo' from transaksi_sewa ts
            left join cabang c on ts.id_cabang = c.id
            left join aset a on ts.id_aset = a.id
            left join pelanggan p on ts.id_pelanggan = p.id
            where c.nama_perusahaan in (?) and RIGHT(ts.end_date_sewa, 4) = ?
          `,
          [
            // data.nama_aset.split(", "),
            data.nama_cabang.split(", "),
            data.periode,
          ]
        );
        laporan = laporan.map((data: any, idx: number) => {
          return {
            ...data,
            no: idx + 1,
            jatuh_tempo: dayjs(data.jatuh_tempo, "DD-MM-YYYY").format(
              "DD MMMM YYYY"
            ), // Convert to month name in Bahasa Indonesia
          };
        });
        const columnNames = laporanFields
          .map((fields: any) => fields.name)
          .filter((fieldName) => fieldName != "id")
          .map((val: any, idx: number) => {
            return {
              title: val
                .split("_")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" "),
              dataIndex: val,
              key: val,
            };
          });

        columnNames.unshift({ title: "No", dataIndex: "no", key: "no" });

        const jenis_laporan = "DAFTAR JATUH TEMPO TAHUN " + data.periode;
        return Response.json({
          laporan,
          columnNames,
          aset: data.nama_aset.split(", "),
          cabang: data.nama_cabang.split(", "),
          jenis_laporan,
        });
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
