import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";

import path from "path";
import { writeFile } from "fs/promises";
import { projectRoot } from "@/app/projectRoot";
import fs from 'fs';

export async function POST( request: Request, response: Response): Promise<Response> {
  try {
    const fd = await request.formData()
    const flist: File[] | null = fd.getAll("files[]") as unknown as File[]
    if (flist.length == 0) {
      return Response.json({message: "no file uploaded", status: 400})
    } else {
      const id_aset = fd.get('id_aset') as unknown as string
      const nama_aset  = fd.get('nama_aset') as unknown as string
      flist.forEach(
        async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer())
          const filename = file.name.replaceAll(" ", "_") 
          try {
            await writeFile(
              path.join(projectRoot, "/public/docs/" + id_aset.replaceAll(" ", "_") + "_" + nama_aset.replaceAll(" ", "_") + "/" + filename),
              buffer
            )
          } catch (e) {
            console.log(e)
          }
        }
      )
    }
    return Response.json({status: 200})
  } catch (e) {
    console.log(e)
    return Response.json({status: 500})
  }
}
