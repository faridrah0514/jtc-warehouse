import { openDB } from "@/helper/db";

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  try {
    const conn = openDB();
    const value = await request.json();
    const data = value.data;

    if (value.requestType === 'edit') {
      await conn.query(
        `UPDATE tipe_aset SET tipe_aset = ? WHERE id = ?`,
        [data.tipe_aset, data.id_aset]
      );
    } else {
      await conn.query(
        `INSERT INTO tipe_aset (tipe_aset) VALUES (?)`,
        [data.tipe_aset]
      );
    }

    conn.end();
    return Response.json({ status: 200 });
  } catch (e) {
    console.log(e);
    return Response.json({ status: 500 });
  }
}

export async function GET(): Promise<Response> {
  const conn = openDB();
  const [data] = await conn.query(`SELECT * FROM tipe_aset`);
  conn.end();
  return Response.json({ data });
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const conn = openDB();
    const value = await request.json();
    const id = value.id;

    // Check for any aset referencing the tipe_aset
    const [dependentAsets] = await conn.query(
      `SELECT id, nama_aset FROM aset WHERE id_tipe_aset = ?`,
      [id]
    );

    if (Array.isArray(dependentAsets) && dependentAsets.length > 0) {
      // If there are dependent aset records, inform the user
      const asetNames = dependentAsets.map((aset: any) => aset.nama_aset).join(", ");
      return Response.json({
        status: 400,
        message: `Cannot delete this tipe aset because it is used by the following aset(s): ${asetNames}. Please delete or update these aset records first.`,
      });
    }

    // If no dependent aset, proceed with deletion
    await conn.query(`DELETE FROM tipe_aset WHERE id = ?`, [id]);

    conn.end();
    return Response.json({ status: 200, message: "Record deleted successfully" });
  } catch (e) {
    console.log(e);
    return Response.json({ status: 500, message: "Error deleting record" });
  }
}
