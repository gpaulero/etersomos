import { NextRequest, NextResponse } from 'next/server'
import { findStudentByEmail, verifyPassword, createStudentToken, getStudentCookieOptions } from '@/lib/student-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    const student = await findStudentByEmail(email.toLowerCase().trim())
    if (!student) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const valid = await verifyPassword(password, student.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const token = await createStudentToken({ id: student.id, email: student.email, nombre: student.nombre })
    const cookieOpts = getStudentCookieOptions()

    const response = NextResponse.json({
      success: true,
      student: { id: student.id, email: student.email, nombre: student.nombre }
    })
    response.cookies.set(cookieOpts.name, token, cookieOpts)
    return response
  } catch (error) {
    console.error('[Student Login Error]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
