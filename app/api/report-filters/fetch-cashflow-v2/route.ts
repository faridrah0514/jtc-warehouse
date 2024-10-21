import { NextResponse } from "next/server";
import { openDB } from "@/helper/db"; // Your database connection function

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cabang_id, report_type, period_start, period_end, categories } =
      body;

    // Ensure all cabang_id elements are parsed as integers
    const cabangIds = cabang_id.map((id: string) => parseInt(id, 10));

    const db = await openDB();

    let saldoAwalMap: {
      [key: string]: {
        total_incoming: number;
        total_outgoing: number;
        saldo_awal: number;
      };
    } = {};

    // Fetch transactions during the period
    let results: any[] = [];
    if (report_type === "period") {
      // Fetch initial balance (Saldo Awal) - the sum of incoming - outgoing amounts before the period_start
      const saldoAwalResults = await db.query(
        `SELECT c.id as cabang_id, 
                    SUM(CASE WHEN cf_category.type = 'incoming' THEN cf.amount ELSE 0 END) AS total_incoming,
                    SUM(CASE WHEN cf_category.type = 'outgoing' THEN cf.amount ELSE 0 END) AS total_outgoing
             FROM cash_flow cf
             INNER JOIN cabang c ON cf.cabang_id = c.id
             INNER JOIN cash_flow_category cf_category ON cf.category_id = cf_category.id
             WHERE cf.cabang_id IN (?) AND cf.date < ?
             GROUP BY c.id`,
        [cabangIds, period_start]
      );

      // Process saldo awal results
      saldoAwalMap = (
        Array.isArray(saldoAwalResults[0]) ? saldoAwalResults[0] : []
      ).reduce((acc: any, record: any) => {
        acc[record.cabang_id] = {
          total_incoming: parseFloat(record.total_incoming) || 0,
          total_outgoing: parseFloat(record.total_outgoing) || 0,
          saldo_awal:
            (parseFloat(record.total_incoming) || 0) -
            (parseFloat(record.total_outgoing) || 0),
        };
        return acc;
      }, {});
      // Arus Kas (By Period) Report
      results = await db.query(
        `SELECT c.id as cabang_id, c.nama_perusahaan, c.kota, 
                        cf.description, cf.amount, cf.date, cf_category.type as category_type, cf.category_id, cf_category.name as category_name, cf.nama_toko
                 FROM cash_flow cf
                 INNER JOIN cabang c ON cf.cabang_id = c.id
                 INNER JOIN cash_flow_category cf_category ON cf.category_id = cf_category.id
                 WHERE cf.cabang_id IN (?) AND cf.date BETWEEN ? AND ? 
                 ORDER BY cf.date`,
        [cabangIds, period_start, period_end]
      );
    } else if (report_type === "category") {
      // Laporan Berdasarkan Kategori (By Category)
      results = await db.query(
        `SELECT c.id as cabang_id, c.nama_perusahaan, c.kota, 
                        cf.description, cf.amount, cf.date, cf_category.id as category_id, cf_category.name as category_name, cf_category.type as category_type, cf.nama_toko
                 FROM cash_flow cf
                 INNER JOIN cabang c ON cf.cabang_id = c.id
                 INNER JOIN cash_flow_category cf_category ON cf.category_id = cf_category.id
                 WHERE cf.cabang_id IN (?) AND cf_category.id IN (?) AND cf.date BETWEEN ? AND ? 
                 ORDER BY cf.date`,
        [cabangIds, categories, period_start, period_end]
      );
    }

    // Access the first element of the result, which contains the actual rows
    const rows = results[0];

    // Grouping by cabang (branch) and calculating totals
    const groupedByCabang = (rows || []).reduce((acc: any, record: any) => {
      if (!acc[record.cabang_id]) {
        // Initialize with Saldo Awal (Initial Balance)
        const saldoAwal = saldoAwalMap[record.cabang_id]?.saldo_awal || 0;

        acc[record.cabang_id] = {
          nama_perusahaan: record.nama_perusahaan,
          kota: record.kota,
          saldo_awal: report_type === "period" ? saldoAwal : 0, // Initial balance before the period if report_type is 'period'
          total_incoming: saldoAwalMap[record.cabang_id]?.total_incoming || 0,
          total_outgoing: saldoAwalMap[record.cabang_id]?.total_outgoing || 0,
          total_amount: report_type === "period" ? saldoAwal : 0, // Initialize total with saldo_awal if report_type is 'period'
          transactions: [],
          remaining_balance: report_type === "period" ? saldoAwal : 0, // Track the running balance if report_type is 'period'
        };
      }

      // Determine if the transaction is incoming or outgoing
      const isIncoming = record.category_type === "incoming";
      const isOutgoing = record.category_type === "outgoing";

      // Update totals
      if (isIncoming) {
        acc[record.cabang_id].total_incoming += parseFloat(record.amount);
      }
      if (isOutgoing) {
        acc[record.cabang_id].total_outgoing += parseFloat(record.amount);
      }

      // Calculate the remaining balance based on the transaction type
      let newRemaining = acc[record.cabang_id].remaining_balance;
      if (isIncoming) {
        newRemaining += parseFloat(record.amount);
      } else if (isOutgoing) {
        newRemaining -= parseFloat(record.amount);
      }

      // Add transaction details to each cabang, including category information and remaining balance
      acc[record.cabang_id].transactions.push({
        nama_toko: record.nama_toko,
        description: record.description,
        amount: record.amount,
        date: record.date,
        category_id: record.category_id,
        category_name: record.category_name,
        category_type: record.category_type,
        remaining: newRemaining, // Add the remaining balance after each transaction
      });

      // Update remaining balance for the next transaction
      acc[record.cabang_id].remaining_balance = newRemaining;

      // Update total amount (saldo_awal + total_incoming - total_outgoing)
      if (report_type === "period") {
        acc[record.cabang_id].total_amount =
          acc[record.cabang_id].saldo_awal +
          (acc[record.cabang_id].total_incoming -
        acc[record.cabang_id].total_outgoing);
      } else if (report_type === "category") {
        // If the report type is 'category' and the category type is 'outgoing', the total amount should be positive
        const totalAmount =
          acc[record.cabang_id].total_incoming -
          acc[record.cabang_id].total_outgoing;
        acc[record.cabang_id].total_amount =
          record.category_type === "outgoing" ? Math.abs(totalAmount) : totalAmount;
      }

      return acc;
    }, {});
    return NextResponse.json(groupedByCabang);
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}
