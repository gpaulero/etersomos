import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentToken, COOKIE_NAME } from '@/lib/student-auth'
import { ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/student/course-content?courseId=xxx
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const payload = await verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const courseId = request.nextUrl.searchParams.get('courseId')
    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 })
    }

    // Verify student is enrolled in this course
    const { db } = await import('@/lib/db')
    await ensureSchema()

    const enrollment = await (db as any).studentEnrollment.findFirst({
      where: { studentId: payload.id, type: 'curso', referenceId: courseId }
    })

    // Also check by title match (for admin-assigned courses without referenceId)
    const enrollmentByTitle = !enrollment ? await (db as any).studentEnrollment.findFirst({
      where: { studentId: payload.id, type: 'curso' }
    }) : enrollment

    if (!enrollment && !enrollmentByTitle) {
      return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 })
    }

    // Get course content
    const contents = await (db as any).courseContent.findMany({
      where: { courseId }
    })

    const activeContents = contents.filter((c: any) => c.active === 1 || c.active === true)

    return NextResponse.json({
      contents: activeContents.map((c: any) => ({
        id: c.id,
        courseId: c.courseId,
        title: c.title,
        description: c.description,
        fileType: c.fileType,
        r2Key: c.r2Key,
        fileName: c.fileName,
        sortOrder: c.sortOrder,
      }))
    })
  } catch (error) {
    console.error('[Student Course Content Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
