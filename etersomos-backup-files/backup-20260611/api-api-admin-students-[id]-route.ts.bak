import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/admin/students/[id] — get student detail with enrollments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    await ensureSchema()

    const student = await (db as any).student.findUnique({ where: { id } })
    if (!student) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    const enrollments = await (db as any).studentEnrollment.findMany({
      where: { studentId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      student: {
        id: student.id,
        email: student.email,
        nombre: student.nombre,
        phone: student.phone,
        createdAt: student.createdAt,
      },
      enrollments,
    })
  } catch (error) {
    console.error('[Admin Student GET Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/admin/students/[id] — delete a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    await ensureSchema()

    // Delete enrollments first
    const enrollments = await (db as any).studentEnrollment.findMany({ where: { studentId: id } })
    for (const enr of enrollments) {
      await (db as any).studentEnrollment.delete({ where: { id: enr.id } })
    }

    // Delete student
    await (db as any).student.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Student DELETE Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
