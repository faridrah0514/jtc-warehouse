import { openDB } from "@/helper/db";
import { DataAset } from "@/app/types/master";

import path from "path";
import { writeFile } from "fs/promises";
import { projectRoot } from "@/app/page";

export async function POST( request: Request, response: Response): Promise<Response> {
  try {
    const fd = await request.formData()
    const flist: File[] | null = fd.getAll("files[]") as unknown as File[]
    if (flist.length == 0) {
      return Response.json({message: "no file uploaded", status: 400})
    } else {
      const cabang = fd.get('aset')
      flist.forEach(
        async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer())
          const filename = cabang+"_"+file.name.replaceAll(" ", "_") 
          try {
            await writeFile(
              path.join(projectRoot, "public/docs/" + filename),
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
