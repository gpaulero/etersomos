import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentToken, COOKIE_NAME } from '@/lib/student-auth'
import { ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const payload = await verifyStudentToken(token)
    if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    const { enrollmentId, contentId, action } = await request.json()
    if (!enrollmentId || !action) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    const { db } = await import('@/lib/db')
    await ensureSchema()
    const enrollment = await (db as any).studentEnrollment.findFirst({ where: { id: enrollmentId, studentId: payload.id } })
    if (!enrollment) return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 })
    let completed: string[] = []
    try { completed = JSON.parse(enrollment.completedContent || '[]') } catch { completed = [] }
    if (action === 'complete' && contentId && !completed.includes(contentId)) completed.push(contentId)
    if (action === 'uncomplete' && contentId) completed = completed.filter((c) => c !== contentId)
    const data: any = { updatedAt: new Date() }
    if (action === 'complete' || action === 'uncomplete') data.completedContent = JSON.stringify(completed)
    if (action === 'last' && contentId) data.lastContentId = contentId
    await (db as any).studentEnrollment.update({ where: { id: enrollmentId }, data })
    return NextResponse.json({ success: true, completedContent: completed })
  } catch (error) {
    console.error('[Student Progress Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
