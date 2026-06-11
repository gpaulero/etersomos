import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/db'
import { deleteResource } from '@/lib/r2'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/cleanup-lecturas
 * Cleans up expired lectura enrollments:
 * - Finds all lectura enrollments where expiresAt < now
 * - Deletes the R2 file to free storage
 * - Clears the r2Key and fileName from the enrollment
 * - Marks the enrollment status as 'expirada'
 * Returns summary of cleaned items.
 */
export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    await ensureSchema()

    // Find all lectura enrollments with an expiration date
    const allLecturas = await (db as any).studentEnrollment.findMany({
      where: { type: 'lectura' }
    })

    const now = new Date()
    const expired = allLecturas.filter((e: any) => {
      if (!e.expiresAt || !e.r2Key) return false
      return new Date(e.expiresAt).getTime() < now.getTime()
    })

    let deletedCount = 0
    let errors = 0

    for (const enrollment of expired) {
      try {
        // Delete main audio from R2
        await deleteResource(enrollment.r2Key)

        // Also delete all attachments from R2
        try {
          const attachments = await (db as any).enrollmentAttachment.findMany({
            where: { enrollmentId: enrollment.id },
          })
          for (const attachment of attachments) {
            try {
              await deleteResource(attachment.r2Key)
            } catch (e) {
              console.warn(`[Cleanup] Failed to delete attachment R2 key ${attachment.r2Key}:`, e)
            }
            // Delete attachment record from DB
            try {
              await (db as any).enrollmentAttachment.delete({
                where: { id: attachment.id },
              })
            } catch {}
          }
        } catch (e) {
          console.warn(`[Cleanup] Failed to clean attachments for enrollment ${enrollment.id}:`, e)
        }

        // Update enrollment: clear r2Key, mark as expirada
        await (db as any).studentEnrollment.update({
          where: { id: enrollment.id },
          data: {
            r2Key: '',
            fileName: '',
            status: 'expirada',
          }
        })

        deletedCount++
      } catch (e) {
        console.warn(`[Cleanup] Failed to delete R2 key ${enrollment.r2Key}:`, e)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      cleaned: deletedCount,
      errors,
      totalExpired: expired.length,
    })
  } catch (error) {
    console.error('[Cleanup Lecturas Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
