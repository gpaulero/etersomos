import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentToken, findStudentById, COOKIE_NAME } from '@/lib/student-auth'

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

    const student = await findStudentById(payload.id)
    if (!student) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: student.id,
      email: student.email,
      nombre: student.nombre,
      phone: student.phone,
    })
  } catch (error) {
    console.error('[Student Me Error]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
