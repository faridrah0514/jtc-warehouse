import path from "path";
import { writeFile } from "fs/promises";
import { projectRoot } from "@/app/projectRoot";
import fs from "fs";

export async function POST(request: Request): Promise<Response> {
  try {
    const fd = await request.formData();
    const flist: File[] = fd.getAll("files[]") as unknown as File[];
    const cashFlowPath = "/upload/cashflow";

    if (flist.length === 0) {
      return new Response(
        JSON.stringify({ message: "No files uploaded", status: 400 }),
        { status: 400 }
      );
    } else {
      const cashFlowId = fd.get("cashFlowId") as string;

      if (!cashFlowId) {
        return new Response(
          JSON.stringify({ message: "Missing cashFlowId", status: 400 }),
          { status: 400 }
        );
      }

      // Ensure the directory for the cash flow exists
      const directoryPath = path.join(projectRoot, cashFlowPath, cashFlowId);
      fs.mkdirSync(directoryPath, { recursive: true });

      for (const file of flist) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replaceAll(" ", "_");
        const filepath = path.join(directoryPath, filename);
        console.log("Write file to:", filepath);

        try {
          await writeFile(filepath, buffer);
        } catch (e) {
          console.error("Error writing file:", e);
          return new Response(
            JSON.stringify({ status: 500, message: "File write error" }),
            { status: 500 }
          );
        }
      }

      return new Response(
        JSON.stringify({ status: 200, message: "Files uploaded successfully" }),
        { status: 200 }
      );
    }
  } catch (e) {
    console.error("Upload error:", e);
    return new Response(
      JSON.stringify({ status: 500, message: "Server error during upload" }),
      { status: 500 }
    );
  }
}
