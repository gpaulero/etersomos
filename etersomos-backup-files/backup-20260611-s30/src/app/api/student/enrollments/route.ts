import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentToken, getStudentEnrollments, COOKIE_NAME } from '@/lib/student-auth'

export const dynamic = 'force-dynamic'

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

    const enrollments = await getStudentEnrollments(payload.id)
    return NextResponse.json({ enrollments })
  } catch (error) {
    console.error('[Student Enrollments Error]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
