import { NextRequest, NextResponse } from 'next/server'
import { uploadLecturaResource } from '@/lib/r2'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/lectura-upload
 * Upload a lectura audio file directly to R2 (server-side upload).
 * Accepts FormData with a "file" field.
 * Returns { r2Key, fileName, size }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

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
