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
      // For lecturas: verify the student has an enrollment with this r2Key
      const allEnrollments = await (db as any).studentEnrollment.findMany({
        where: { studentId: payload.id, type: 'lectura' }
      })
      const enrollment = allEnrollments.find((e: any) => e.r2Key === key)
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

    // 4. Stream from R2 with inline disposition (no download)
    const result = await getResourceStream(key)

    if (!result.Body) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    const fileName = key.split('/').pop() || 'media'
    const contentType = result.ContentType || 'application/octet-stream'

    // Determine if we should support range requests for video
    const rangeHeader = request.headers.get('range')

    // For video/audio files, use inline disposition with streaming support
    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
    }

    // If content length is known, add it
    if (result.ContentLength) {
      responseHeaders['Content-Length'] = String(result.ContentLength)
    }

    // Support range requests for video seeking
    if (rangeHeader && result.ContentLength) {
      const fileSize = result.ContentLength
      const parts = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = end - start + 1

      responseHeaders['Content-Range'] = `bytes ${start}-${end}/${fileSize}`
      responseHeaders['Content-Length'] = String(chunkSize)
      responseHeaders['Accept-Ranges'] = 'bytes'

      return new NextResponse(result.Body as ReadableStream, {
        status: 206,
        headers: responseHeaders,
      })
    }

    responseHeaders['Accept-Ranges'] = 'bytes'

    return new NextResponse(result.Body as ReadableStream, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[Student Stream Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
