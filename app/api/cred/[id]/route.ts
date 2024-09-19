import { openDB } from "@/helper/db";
import dayjs from "dayjs";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// GET request to fetch user details by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;

  try {
    const conn = openDB();
    const [rows] = await conn.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [userId]);
    conn.end();

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = rows[0];
    const formattedUser = {
      ...user,
      created_at: dayjs(user.created_at).format('DD-MM-YYYY'),
    };

    return NextResponse.json(formattedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT request to update user details by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;

  try {
    const { requestType, data } = await req.json();

    if (requestType === 'edit-user') {
      const { username, password, role } = data;

      if (!username || !role) {
        return NextResponse.json({ message: "Username and role are required" }, { status: 400 });
      }

      const conn = openDB();

      // Check if the user exists
      const [existingUser] = await conn.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [userId]);

      if (existingUser.length === 0) {
        conn.end();
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      // Update user details (password only if provided)
      if (password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await conn.query(
          "UPDATE users SET username = ?, password_hash = ?, role = ?, updated_at = NOW() WHERE id = ?",
          [username, hashedPassword, role, userId]
        );
      } else {
        await conn.query(
          "UPDATE users SET username = ?, role = ?, updated_at = NOW() WHERE id = ?",
          [username, role, userId]
        );
      }

      conn.end();

      return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid request type" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
