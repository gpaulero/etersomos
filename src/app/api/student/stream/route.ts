import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentToken, COOKIE_NAME } from '@/lib/student-auth'
import { ensureSchema } from '@/lib/db'
import { getResourceStream } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/student/stream?key=cursos/xxx or key=lecturas/xxx
 * Protected streaming endpoint for enrolled students.
 * Streams video/audio with inline content-disposition (no download).
 * Validates enrollment before serving.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify student authentication
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const payload = await verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // 2. Get the R2 key
    const key = request.nextUrl.searchParams.get('key')
    if (!key) {
      return NextResponse.json({ error: 'key es requerido' }, { status: 400 })
    }

    // Only allow cursos/ and lecturas/ prefixes for this endpoint
    if (!key.startsWith('cursos/') && !key.startsWith('lecturas/')) {
      return NextResponse.json({ error: 'Ruta no permitida' }, { status: 400 })
    }

    // 3. Verify enrollment based on content type
    const { db } = await import('@/lib/db')
    await ensureSchema()

    if (key.startsWith('lecturas/')) {
      // For lecturas: verify the student has an enrollment with this r2Key OR an attachment with this r2Key
      const allEnrollments = await (db as any).studentEnrollment.findMany({
        where: { studentId: payload.id, type: 'lectura' }
      })

      // Check main audio r2Key
      let enrollment = allEnrollments.find((e: any) => e.r2Key === key)

      // If not found in main audio, check attachments
      if (!enrollment) {
        const allAttachments = await (db as any).enrollmentAttachment.findMany({})
        const attachment = allAttachments.find((a: any) => a.r2Key === key)
        if (attachment) {
          enrollment = allEnrollments.find((e: any) => e.id === attachment.enrollmentId)
        }
      }

      if (!enrollment) {
        return NextResponse.json({ error: 'No tenés acceso a esta lectura' }, { status: 403 })
      }
      // Check expiration
      if (enrollment.expiresAt) {
        const expiresAt = new Date(enrollment.expiresAt)
        if (expiresAt.getTime() < Date.now()) {
          return NextResponse.json({ error: 'Esta lectura ha expirado y ya no está disponible' }, { status: 410 })
        }
      }
    } else {
      // For cursos: find the CourseContent item by r2Key and verify enrollment
      const allContents = await (db as any).courseContent.findMany({})
      const contentItem = allContents.find((c: any) => c.r2Key === key)

      if (contentItem) {
        // Verify student is enrolled in this course
        const enrollment = await (db as any).studentEnrollment.findFirst({
          where: { studentId: payload.id, type: 'curso', referenceId: contentItem.courseId }
        })

        // Also try to match by any enrollment of type curso for this student
        const anyCourseEnrollment = !enrollment ? await (db as any).studentEnrollment.findFirst({
          where: { studentId: payload.id, type: 'curso' }
        }) : enrollment

        if (!enrollment && !anyCourseEnrollment) {
          return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 })
        }
      } else {
        // If no CourseContent record exists, check if student has any course enrollment
        const anyEnrollment = await (db as any).studentEnrollment.findFirst({
          where: { studentId: payload.id, type: 'curso' }
        })
        if (!anyEnrollment) {
          return NextResponse.json({ error: 'No estás inscrito en ningún curso' }, { status: 403 })
        }
      }
    }

    // 4. Stream from R2 con soporte de Range (streaming progresivo + seek)
    const rangeHeader = request.headers.get('range')
    const fileName = key.split('/').pop() || 'media'

    const baseHeaders: Record<string, string> = {
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Accept-Ranges': 'bytes',
    }

    if (rangeHeader) {
      const ranged = await getResourceStream(key, rangeHeader)
      if (!ranged.Body) {
        return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
      }
      const rangedType = ranged.ContentType || 'application/octet-stream'
      const contentRange = ranged.ContentRange || ''
      const totalStr = contentRange.split('/')[1]
      const total = totalStr ? parseInt(totalStr, 10) : 0
      const parts = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10) || 0
      const end = parts[1] ? parseInt(parts[1], 10) : (total ? total - 1 : start + (ranged.ContentLength || 1) - 1)
      const headers: Record<string, string> = {
        ...baseHeaders,
        'Content-Type': rangedType,
        'Content-Range': `bytes ${start}-${end}/${total || end + 1}`,
        'Content-Length': String(ranged.ContentLength ?? end - start + 1),
      }
      return new NextResponse(ranged.Body as ReadableStream, { status: 206, headers })
    }

    const result = await getResourceStream(key)
    if (!result.Body) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }
    const contentType = result.ContentType || 'application/octet-stream'
    const headers: Record<string, string> = {
      ...baseHeaders,
      'Content-Type': contentType,
    }
    if (result.ContentLength) {
      headers['Content-Length'] = String(result.ContentLength)
    }
    return new NextResponse(result.Body as ReadableStream, { status: 200, headers })
  } catch (error) {
    console.error('[Student Stream Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
