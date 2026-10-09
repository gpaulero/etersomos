import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// GET /api/admin/drive-list?folderId=...  → lista archivos de una carpeta pública de Drive
export async function GET(request: NextRequest) {
  try {
    const folderId = request.nextUrl.searchParams.get('folderId') || ''
    if (!folderId) return NextResponse.json({ error: 'Falta folderId' }, { status: 400 })
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY
    if (apiKey) {
      const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`)
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size)&pageSize=300&key=${apiKey}`)
      if (res.ok) {
        const d = await res.json()
        return NextResponse.json({ files: (d.files || []).map((f: any) => ({ id: f.id, name: f.name, size: f.size })) })
      }
    }
    const url = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return NextResponse.json({ error: `Drive devolvió ${res.status}` }, { status: 502 })
    const htmlText = await res.text()
    const files: { id: string; name: string }[] = []
    const re = /\/file\/d\/([a-zA-Z0-9_-]+)/g
    const seen = new Set<string>()
    // pares href+titulo
    const pairRe = /href="[^"]*\/file\/d\/([a-zA-Z0-9_-]+)\/[^"]*"[^>]*>\s*(?:<div[^>]*>)?([^<"]{2,120})/g
    let m: RegExpExecArray | null
    while ((m = pairRe.exec(htmlText))) {
      const id = m[1]
      const name = m[2].trim()
      if (!seen.has(id) && name) { seen.add(id); files.push({ id, name }) }
    }
    if (files.length === 0) {
      while ((m = re.exec(htmlText))) {
        const id = m[1]
        if (!seen.has(id)) { seen.add(id); files.push({ id, name: `archivo-${id.slice(0, 6)}` }) }
      }
    }
    if (files.length === 0) {
      return NextResponse.json({ error: 'No se pudieron listar los archivos. Verificá que la carpeta sea pública ("cualquiera con el enlace").', files: [] }, { status: 200 })
    }
    return NextResponse.json({ files })
  } catch (e) {
    console.error('[drive-list]', e)
    return NextResponse.json({ error: 'Error al listar la carpeta de Drive' }, { status: 500 })
  }
}
