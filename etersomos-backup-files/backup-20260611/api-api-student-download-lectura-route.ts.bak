import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentToken, COOKIE_NAME } from '@/lib/student-auth'
import { ensureSchema } from '@/lib/db'
import { getResourceStream } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/student/download-lectura?key=lecturas/xxx
 * Download endpoint for lectura audio files.
 * - Verifies student is authenticated and owns this lectura
 * - Checks that the lectura hasn't expired
 * - Serves file with Content-Disposition: attachment (download)
 * - After download, the file remains available until expiration
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

    // Only allow lecturas/ prefix
    if (!key.startsWith('lecturas/')) {
      return NextResponse.json({ error: 'Ruta no permitida' }, { status: 400 })
    }

    // 3. Find the enrollment with this r2Key and verify ownership
    const { db } = await import('@/lib/db')
    await ensureSchema()

    const allEnrollments = await (db as any).studentEnrollment.findMany({
      where: { studentId: payload.id, type: 'lectura' }
    })
    const enrollment = allEnrollments.find((e: any) => e.r2Key === key)

    if (!enrollment) {
      return NextResponse.json({ error: 'No tenés acceso a esta lectura' }, { status: 403 })
    }

    // 4. Check expiration
    if (enrollment.expiresAt) {
      const expiresAt = new Date(enrollment.expiresAt)
      if (expiresAt.getTime() < Date.now()) {
        return NextResponse.json({ error: 'Esta lectura ha expirado y ya no está disponible' }, { status: 410 })
      }
    }

    // 5. Stream from R2 with attachment disposition (triggers download)
    const result = await getResourceStream(key)

    if (!result.Body) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    const fileName = enrollment.fileName || key.split('/').pop() || 'lectura.mp3'
    const contentType = result.ContentType || 'audio/mpeg'

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    }

    if (result.ContentLength) {
      responseHeaders['Content-Length'] = String(result.ContentLength)
    }

    return new NextResponse(result.Body as ReadableStream, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[Student Download Lectura Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
