import { NextRequest, NextResponse } from 'next/server'
import { findStudentByEmail, createStudent, createStudentToken, getStudentCookieOptions } from '@/lib/student-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, phone } = await request.json()
    if (!email || !password || !nombre) {
      return NextResponse.json({ error: 'Email, contraseña y nombre son requeridos' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const existing = await findStudentByEmail(email.toLowerCase().trim())
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email. Probá iniciando sesión.' }, { status: 409 })
    }

    const student = await createStudent({
      email: email.toLowerCase().trim(),
      password,
      nombre: nombre.trim(),
      phone: phone?.trim() || '',
    })

    const token = await createStudentToken({ id: student.id, email: student.email, nombre: student.nombre })
    const cookieOpts = getStudentCookieOptions()

    const response = NextResponse.json({
      success: true,
      student: { id: student.id, email: student.email, nombre: student.nombre }
    })
    response.cookies.set(cookieOpts.name, token, cookieOpts)
    return response
  } catch (error) {
    console.error('[Student Register Error]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
