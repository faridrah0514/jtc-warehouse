import { openDB } from "@/helper/db";
import dayjs from "dayjs";
import { RowDataPacket } from "mysql2";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NextRequest, NextResponse } from "next/server";
import  bcrypt  from "bcrypt";
import mysql from "mysql2/promise";

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const { username, oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "Old password and new password are required" },
        { status: 400 }
      );
    }
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    // Fetch the user from the database and verify the old password

    const conn = openDB();
    const [rows] = await conn.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    const userRows = rows as mysql.RowDataPacket[];
    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userRows[0];
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 400 }
      );
    }



    // Update the user's password in the database
    // const updateConnection = await pool.getConnection();
    await conn.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE username = ?",
      [hashedNewPassword, username]
    );
    // updateConnection.release();
    conn.end();
    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
