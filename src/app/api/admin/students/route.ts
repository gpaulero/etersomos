import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/admin/students — list all students
export async function GET(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    await ensureSchema()
    const students = await (db as any).student.findMany({ orderBy: { createdAt: 'desc' } })
    // Remove passwordHash from response
    const safe = students.map((s: any) => ({
      id: s.id,
      email: s.email,
      nombre: s.nombre,
      phone: s.phone,
      createdAt: s.createdAt,
    }))
    return NextResponse.json({ students: safe })
  } catch (error) {
    console.error('[Admin Students GET Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/admin/students — create a student
export async function POST(request: NextRequest) {
  try {
    const { email, nombre, phone, password } = await request.json()
    if (!email || !nombre) {
      return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 })
    }

    const { createStudent } = await import('@/lib/student-auth')
    const { ensureSchema: es } = await import('@/lib/db')
    await es()

    // Check if exists
    const existing = await (await import('@/lib/student-auth')).findStudentByEmail(email.toLowerCase().trim())
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un alumno con ese email' }, { status: 409 })
    }

    // Auto-generate password if not provided
    const studentPassword = password || Math.random().toString(36).slice(2, 10)
    const student = await createStudent({
      email: email.toLowerCase().trim(),
      password: studentPassword,
      nombre: nombre.trim(),
      phone: phone?.trim() || '',
    })

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        email: student.email,
        nombre: student.nombre,
        generatedPassword: !password ? studentPassword : undefined,
      }
    })
  } catch (error) {
    console.error('[Admin Students POST Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
