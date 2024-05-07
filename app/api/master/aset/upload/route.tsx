import path from "path";
import { writeFile } from "fs/promises";
import { projectRoot } from "@/app/projectRoot";
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

async function convertToPDF(filepath: string, filename: string, extension: string) {
  const formData = new FormData()
  formData.append('instructions', JSON.stringify({
    parts: [
      {
        file: "file"
      }
    ]
  }))
  formData.append('file', fs.createReadStream(path.join(filepath, filename)))
    ; (async () => {
      try {
        const response = await axios.post('https://api.pspdfkit.com/build', formData, {
          headers: formData.getHeaders({
            'Authorization': 'Bearer pdf_live_kF6EG6hvcAv5ThdAqfOFGfFV9vIlKVPMdhhZVjMaPiR'
          }),
          responseType: "stream"
        })
        // download the pdf file
        const newfilename = "___pdf___" + filename
        response.data.pipe(fs.createWriteStream(path.join(filepath, newfilename.replaceAll(extension, ".pdf"))))
      } catch (e: any) {
        console.error("converting file error: ", e.message)
      }
    })()
}

export async function POST(request: Request, response: Response): Promise<Response> {
  const file_extension: string[] = ['.xlsx', '.xls', '.doc', '.docx']
  try {
    const fd = await request.formData()
    const flist: File[] | null = fd.getAll("files[]") as unknown as File[]
    if (flist.length == 0) {
      return Response.json({ message: "no file uploaded", status: 400 })
    } else {
      const id_aset = fd.get('id_aset') as unknown as string
      const nama_aset = fd.get('nama_aset') as unknown as string
      const doc_list = fd.get('doc_list') as unknown as string

      // Iterate over each uploaded file
      for (const file of flist) {
        // Write the file to the specified directory
        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = file.name.replaceAll(" ", "_")
        const filepath = path.join(projectRoot, "/upload/docs/" + id_aset.replaceAll(" ", "_") + "/", doc_list)
        try {
          await writeFile(
            path.join(filepath, filename),
            buffer
          )
          const extension: string = path.extname(filename).toLowerCase();
          if (file_extension.includes(extension)) {
            // Convert Excel to PDF
            await convertToPDF(filepath, filename, extension)
          }
          return Response.json({ status: 200 })
        } catch (e) {
          console.log(e)
        }
      }
    }

  } catch (e) {
    console.log(e)
    return Response.json({ status: 500 })
  }
}

