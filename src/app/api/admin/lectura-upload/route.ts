import { NextRequest, NextResponse } from 'next/server'
import { getPresignedLecturaUploadUrl } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/lectura-upload
 * Server-side upload for lectura audio files.
 * Receives the file as FormData, uploads to R2, returns the r2Key.
 * This avoids CORS issues with direct browser-to-R2 uploads.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const enrollmentId = formData.get('enrollmentId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Archivo es requerido' }, { status: 400 })
    }

    // Get presigned upload URL for lecturas/ prefix
    const contentType = file.type || 'audio/mpeg'
    const { url, key } = await getPresignedLecturaUploadUrl(file.name, contentType)

    // Upload to R2 from server side (no CORS issues)
    const arrayBuffer = await file.arrayBuffer()
    const uploadRes = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: arrayBuffer,
    })

    if (!uploadRes.ok) {
      console.error('[Lectura Upload] R2 upload failed:', uploadRes.status, await uploadRes.text().catch(() => ''))
      return NextResponse.json({ error: `Error al subir a R2 (${uploadRes.status})` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      r2Key: key,
      fileName: file.name,
      enrollmentId: enrollmentId || null,
    })
  } catch (error) {
    console.error('[Lectura Upload Error]', error)
    return NextResponse.json({ error: 'Error interno al subir audio' }, { status: 500 })
  }
}
