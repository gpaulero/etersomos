import { NextRequest, NextResponse } from 'next/server'
import { createEnrollment } from '@/lib/student-auth'

export const dynamic = 'force-dynamic'

// POST /api/admin/students/[id]/enrollments — assign course/reading to student
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params
    const { type, referenceId, title, status, notes, r2Key, fileName } = await request.json()

    if (!type || !title) {
      return NextResponse.json({ error: 'Tipo y título son requeridos' }, { status: 400 })
    }

    const validTypes = ['curso', 'lectura', 'mentoria']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido. Usar: curso, lectura, mentoria' }, { status: 400 })
    }

    const enrollment = await createEnrollment({
      studentId,
      type,
      referenceId: referenceId || '',
      title,
      status: status || 'activa',
      assignedBy: 'admin',
      notes: notes || '',
      r2Key: r2Key || '',
      fileName: fileName || '',
    })

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error('[Admin Enrollment POST Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
