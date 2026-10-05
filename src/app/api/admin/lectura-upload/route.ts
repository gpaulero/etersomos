import { NextRequest, NextResponse } from 'next/server'
import { uploadLecturaResource } from '@/lib/r2'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function extractDriveId(url: string): string | null {
  const m =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/^([a-zA-Z0-9_-]{20,})$/)
  return m ? m[1] : null
}

/**
 * POST /api/admin/lectura-upload
 * Upload a lectura audio file directly to R2 (server-side upload).
 * Accepts FormData with a "file" field.
 * Returns { r2Key, fileName, size }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    let file = formData.get('file') as File | null
    const driveUrl = String(formData.get('driveUrl') || '')

    if (!file && driveUrl) {
      const id = extractDriveId(driveUrl)
      if (!id) return NextResponse.json({ error: 'Link de Drive no válido' }, { status: 400 })
      const res = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`)
      if (!res.ok) return NextResponse.json({ error: `Drive devolvió ${res.status}. Revisá que el archivo sea público ("cualquiera con el enlace").` }, { status: 502 })
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('text/html')) return NextResponse.json({ error: 'Drive devolvió una página de confirmación. Compartí el archivo como "cualquiera con el enlace".' }, { status: 502 })
      const buf = Buffer.from(await res.arrayBuffer())
      const cd = res.headers.get('content-disposition') || ''
      const cdName = (cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i) || [])[1]
      file = new File([buf], cdName || `lectura-${id}.mp3`, { type: contentType || 'audio/mpeg' })
    }

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Validate file type (audio only)
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/aac', 'audio/webm']
    const validExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm']
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      return NextResponse.json({ error: 'Solo se permiten archivos de audio (mp3, wav, ogg, m4a, flac, aac, webm)' }, { status: 400 })
    }

    // Max file size: 200MB
    const maxSize = 200 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'El archivo excede el límite de 200MB' }, { status: 400 })
    }

    const result = await uploadLecturaResource(file)

    return NextResponse.json({
      r2Key: result.key,
      fileName: file.name,
      size: result.size,
    })
  } catch (error) {
    console.error('[Admin Lectura Upload Error]', error)
    return NextResponse.json({ error: 'Error interno al subir archivo' }, { status: 500 })
  }
}
