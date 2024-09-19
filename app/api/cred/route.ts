import { openDB } from "@/helper/db";
import dayjs from "dayjs";
import { RowDataPacket } from "mysql2";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NextRequest, NextResponse } from "next/server";
import  bcrypt  from "bcrypt";
import mysql from "mysql2/promise";

const SALT_ROUNDS = 10;

export async function GET() {
  const conn = openDB();
  const [rows] = await conn.query<RowDataPacket[]>(`SELECT id, username, role, created_at FROM users`);
  conn.end();

  const formattedData = rows.map((user: any) => ({
    ...user,
    created_at: dayjs(user.created_at).format('DD-MM-YYYY')
  }));

  return new Response(JSON.stringify({ data: formattedData }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (data.requestType === 'add-user') {
      // Extract the data fields from the request body
      const { username, password, role } = data.data;

      // Validate input fields
      if (!username || !password || !role) {
        return NextResponse.json(
          { message: "Username, password, and role are required" },
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Open the DB connection
      const conn = openDB();

      // Check if the username already exists
      const [existingUsers] = await conn.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if ((existingUsers as mysql.RowDataPacket[]).length > 0) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 400 }
        );
      }

      // Insert the new user into the database
      await conn.query(
        "INSERT INTO users (username, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [username, hashedPassword, role]
      );

      // Close the DB connection
      conn.end();

      // Return success response
      return NextResponse.json({ message: "User created successfully" }, { status: 201 });

    } else {
      // Original backend code for password update
      const { username, oldPassword, newPassword } = data;

      if (!oldPassword || !newPassword) {
        return NextResponse.json(
          { message: "Old password and new password are required" },
          { status: 400 }
        );
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Open the DB connection
      const conn = openDB();

      // Fetch the user from the database and verify the old password
      const [rows] = await conn.query("SELECT * FROM users WHERE username = ?", [username]);

      const userRows = rows as mysql.RowDataPacket[];
      if (userRows.length === 0) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const user = userRows[0];
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isOldPasswordValid) {
        return NextResponse.json({ message: "Old password is incorrect" }, { status: 400 });
      }

      // Update the user's password in the database
      await conn.query(
        "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE username = ?",
        [hashedNewPassword, username]
      );

      // Close the DB connection
      conn.end();

      // Return success response
      return NextResponse.json({ message: "Password updated successfully" });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE request to delete a user by ID
export async function DELETE(req: NextRequest) {
  try {
    const { requestType, id } = await req.json();

    if (requestType === 'delete-user') {
      if (!id) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
      }

      const conn = openDB();

      // Check if the user exists before deleting
      const [existingUser] = await conn.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]);

      if (existingUser.length === 0) {
        conn.end();
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      // Delete the user from the database
      await conn.query("DELETE FROM users WHERE id = ?", [id]);

      conn.end();

      return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid request type" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}