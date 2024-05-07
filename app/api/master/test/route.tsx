import { openDB } from "@/helper/db";
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export const dynamic = 'force-dynamic' 
export async function GET() {
  const xlsx_dir = '/Users/farid.rahman/Personal/belajar-nextjs/jtc-warehouse/jtc-warehouse/upload/docs/CB-0016-AS-0111/DOCX/Dokumen_tanpa_judul.doc'
  // const conn = openDB()
  // const [rows, fields] = await conn.query('select * from cabang')
  // conn.end()
  const formData = new FormData()
  formData.append('instructions', JSON.stringify({
    parts: [
      {
        file: "file"
      }
    ]
  }))
  formData.append('file', fs.createReadStream(xlsx_dir))
  
  ;(async () => {
    try {
      const response = await axios.post('https://api.pspdfkit.com/build', formData, {
        headers: formData.getHeaders({
            'Authorization': 'Bearer pdf_live_kF6EG6hvcAv5ThdAqfOFGfFV9vIlKVPMdhhZVjMaPiR'
        }),
        responseType: "stream"
      })
  
      response.data.pipe(fs.createWriteStream("/Users/farid.rahman/Personal/belajar-nextjs/jtc-warehouse/jtc-warehouse/upload/docs/CB-0016-AS-0111/DOCX/Dokumen_tanpa_judul_doc.pdf"))
      return Response.json({ data: "ok" })
    } catch (e: any) {
      console.error(e.message)
      return Response.json({ data: "error" })
    }
  })()


  



}

// This code requires Node.js. Do not run this code directly in a web browser.

// const axios = require('axios')
// const FormData = require('form-data')
// const fs = require('fs')



// function streamToString(stream: any) {
//   const chunks: any[] = []
//   return new Promise((resolve, reject) => {
//     stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
//     stream.on("error", (err) => reject(err))
//     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
//   })
// }

