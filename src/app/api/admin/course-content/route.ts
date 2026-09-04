import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/db'
import { getPresignedCourseUploadUrl, deleteResource } from '@/lib/r2'

export const dynamic = 'force-dynamic'

// GET /api/admin/course-content?courseId=xxx — list content for a course
export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get('courseId')
    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 })
    }

    const { db } = await import('@/lib/db')
    await ensureSchema()

    const contents = await (db as any).courseContent.findMany({
      where: { courseId }
    })

    return NextResponse.json({
      contents: contents.map((c: any) => ({
        id: c.id,
        courseId: c.courseId,
        title: c.title,
        description: c.description || '',
        fileType: c.fileType || '',
        r2Key: c.r2Key,
        fileName: c.fileName || '',
        sortOrder: c.sortOrder || 0,
        active: c.active,
        module: c.module || '',
        moduleOrder: c.moduleOrder || 0,
        createdAt: c.createdAt,
      }))
    })
  } catch (error) {
    console.error('[Admin Course Content GET Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/admin/course-content — create a content item (metadata only, file already uploaded)
export async function POST(request: NextRequest) {
  try {
    const { courseId, title, description, fileType, r2Key, fileName, sortOrder, active, module, moduleOrder } = await request.json()

    if (!courseId || !title || !r2Key) {
      return NextResponse.json({ error: 'courseId, título y r2Key son requeridos' }, { status: 400 })
    }

    const { db } = await import('@/lib/db')
    await ensureSchema()

    const id = `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const content = await (db as any).courseContent.create({
      data: {
        id,
        courseId,
        title,
        description: description || '',
        fileType: fileType || '',
        r2Key,
        fileName: fileName || '',
        sortOrder: sortOrder || 0,
        active: active !== undefined ? active : 1,
        module: module || '',
        moduleOrder: moduleOrder || 0,
      }
    })

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('[Admin Course Content POST Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT /api/admin/course-content — update a content item
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, fileType, sortOrder, active, module, moduleOrder } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const { db } = await import('@/lib/db')
    await ensureSchema()

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (fileType !== undefined) data.fileType = fileType
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    if (active !== undefined) data.active = active
    if (module !== undefined) data.module = module
    if (moduleOrder !== undefined) data.moduleOrder = moduleOrder

    const content = await (db as any).courseContent.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('[Admin Course Content PUT Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/admin/course-content?id=xxx — delete a content item and its R2 file
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const { db } = await import('@/lib/db')
    await ensureSchema()

    // Get the content to find the R2 key
    const content = await (db as any).courseContent.findUnique({ where: { id } })
    if (!content) {
      return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 })
    }

    // Delete from R2
    if (content.r2Key) {
      try {
        await deleteResource(content.r2Key)
      } catch (e) {
        console.warn('[Admin Course Content DELETE] R2 delete failed:', e)
      }
    }

    // Delete from DB
    await (db as any).courseContent.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Course Content DELETE Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
