import path from "path";
import { writeFile } from "fs/promises";
import { projectRoot } from "@/app/projectRoot";
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: Request, response: Response): Promise<Response> {
    try {
        const fd = await request.formData()
        const flist: File[]  = fd.getAll("files[]") as unknown as File[]
        const txsPath = '/upload/txs'
        if (flist.length == 0) {
            return Response.json({message: "no file uploaded", status: 400})
        } else {
            const id_transaksi = fd.get('id_transaksi') as unknown as string
            for (const file of flist) {
                const buffer = Buffer.from(await file.arrayBuffer())
                const filename = file.name.replaceAll(" ", "_")
                const filepath = path.join(projectRoot, txsPath, id_transaksi)
                console.log("write file to: ", path.join(filepath, filename))
                try {
                    await writeFile(path.join(filepath, filename), buffer)
                    return Response.json({status: 200})
                } catch (e) {
                    console.log(e)
                    return Response.json({status: 500})
                }
            }
        }
        return Response.json({ status: 200 })
    } catch (e) {
        console.log(e)
        return Response.json({status: 500})
    }    
}