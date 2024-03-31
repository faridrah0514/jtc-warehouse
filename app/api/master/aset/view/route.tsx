import { openDB } from "@/helper/db";

export const dynamic = 'force-dynamic'
export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
  const conn = openDB()
 
  conn.end()
  return Response.json({ status: 200, id})
}
