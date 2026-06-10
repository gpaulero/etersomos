import { NextRequest, NextResponse } from 'next/server'
import { getPresignedLecturaUploadUrl } from '@/lib/r2'
import { ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/enrollments/[id]/upload-audio
 * Step 1: Get presigned URL + create metadata for lectura audio
 * Body: { fileName, contentType }
 * Returns: { uploadUrl, key, r2Key }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    const { fileName, contentType } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: 'fileName es requerido' }, { status: 400 })
    }

    // Get presigned upload URL for lecturas/ prefix
    const { url, key } = await getPresignedLecturaUploadUrl(fileName, contentType || 'audio/mpeg')

    return NextResponse.json({ uploadUrl: url, r2Key: key, fileName })
  } catch (error) {
    console.error('[Admin Enrollment Upload Audio Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/enrollments/[id]/upload-audio
 * Step 2 (after file upload to R2): Update the enrollment with r2Key + fileName
 * Also accepts expiresAt to set/update expiration date
 * Body: { r2Key, fileName, expiresAt? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    const { r2Key, fileName, expiresAt } = await request.json()

    if (!r2Key && !expiresAt) {
      return NextResponse.json({ error: 'r2Key o expiresAt es requerido' }, { status: 400 })
    }

    const { db } = await import('@/lib/db')
    await ensureSchema()

    const data: Record<string, unknown> = {}
    if (r2Key) data.r2Key = r2Key
    if (fileName) data.fileName = fileName
    if (expiresAt !== undefined) data.expiresAt = expiresAt || null

    const enrollment = await (db as any).studentEnrollment.update({
      where: { id: enrollmentId },
      data,
    })

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error('[Admin Enrollment Update Audio Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/enrollments/[id]/upload-audio
 * Remove audio from an enrollment (delete from R2 + clear r2Key)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    const { db } = await import('@/lib/db')
    const { deleteResource } = await import('@/lib/r2')
    await ensureSchema()

    // Get the enrollment to find the R2 key
    const enrollment = await (db as any).studentEnrollment.findUnique({
      where: { id: enrollmentId }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 })
    }

    // Delete from R2
    if (enrollment.r2Key) {
      try {
        await deleteResource(enrollment.r2Key)
      } catch (e) {
        console.warn('[Admin Enrollment Delete Audio] R2 delete failed:', e)
      }
    }

    // Clear the r2Key and fileName
    await (db as any).studentEnrollment.update({
      where: { id: enrollmentId },
      data: { r2Key: '', fileName: '' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Enrollment Delete Audio Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
