import { NextRequest, NextResponse } from 'next/server'
import { uploadLecturaAttachment, deleteResource } from '@/lib/r2'
import { db, ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/enrollments/[id]/attachments
 * List all attachments for an enrollment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    await ensureSchema()

    const attachments = await (db as any).enrollmentAttachment.findMany({
      where: { enrollmentId },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ attachments })
  } catch (error) {
    console.error('[Admin Attachments GET Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * POST /api/admin/enrollments/[id]/attachments
 * Upload a new attachment (PDF, image, etc.) to an enrollment
 * Accepts FormData with a "file" field
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    await ensureSchema()

    // Verify enrollment exists
    const enrollment = await (db as any).studentEnrollment.findUnique({
      where: { id: enrollmentId },
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Validate file type (allow PDF, images, documents)
    const validTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.doc', '.docx', '.txt']
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. PDF, imágenes (JPG, PNG, GIF, WebP), Word y texto son válidos.' },
        { status: 400 }
      )
    }

    // Max file size: 50MB
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'El archivo excede el límite de 50MB' }, { status: 400 })
    }

    // Upload to R2
    const result = await uploadLecturaAttachment(file)

    // Determine file type category
    let fileType = 'documento'
    if (file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      fileType = 'imagen'
    } else if (file.type === 'application/pdf' || ext === '.pdf') {
      fileType = 'pdf'
    }

    // Get current max sortOrder for this enrollment
    const existingAttachments = await (db as any).enrollmentAttachment.findMany({
      where: { enrollmentId },
    })
    const maxSortOrder = existingAttachments.length > 0
      ? Math.max(...existingAttachments.map((a: any) => a.sortOrder || 0))
      : 0

    // Create attachment record
    const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const attachment = await (db as any).enrollmentAttachment.create({
      data: {
        id,
        enrollmentId,
        r2Key: result.key,
        fileName: file.name,
        fileType,
        fileSize: result.size,
        mimeType: file.type || 'application/octet-stream',
        sortOrder: maxSortOrder + 1,
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, attachment })
  } catch (error) {
    console.error('[Admin Attachments POST Error]', error)
    return NextResponse.json({ error: 'Error interno al subir adjunto' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/enrollments/[id]/attachments
 * Delete an attachment from an enrollment
 * Body: { attachmentId: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    const { attachmentId } = await request.json()

    if (!attachmentId) {
      return NextResponse.json({ error: 'attachmentId es requerido' }, { status: 400 })
    }

    await ensureSchema()

    // Get the attachment
    const attachment = await (db as any).enrollmentAttachment.findUnique({
      where: { id: attachmentId },
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Adjunto no encontrado' }, { status: 404 })
    }

    // Verify it belongs to this enrollment
    if (attachment.enrollmentId !== enrollmentId) {
      return NextResponse.json({ error: 'El adjunto no pertenece a esta inscripción' }, { status: 403 })
    }

    // Delete from R2
    if (attachment.r2Key) {
      try {
        await deleteResource(attachment.r2Key)
      } catch (e) {
        console.warn('[Admin Attachments DELETE] R2 delete failed:', e)
      }
    }

    // Delete from DB
    await (db as any).enrollmentAttachment.delete({
      where: { id: attachmentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Attachments DELETE Error]', error)
    return NextResponse.json({ error: 'Error interno al eliminar adjunto' }, { status: 500 })
  }
}
