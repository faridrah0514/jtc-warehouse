import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { projectRoot } from "@/app/projectRoot";

export async function POST(req: Request): Promise<Response> {
  const fileUrl = await req.json()
  const filePath = path.join(projectRoot, fileUrl.fileUrl);
  return new Promise((resolve) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        resolve(
          new Response(JSON.stringify({ message: "Failed to delete file" }), {
            status: 500,
          })
        );
      } else {
        resolve(
          new Response(
            JSON.stringify({ message: "File deleted successfully" }),
            { status: 200 }
          )
        );
      }
    });
  });
}
