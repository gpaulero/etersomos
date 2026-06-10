import { NextRequest, NextResponse } from 'next/server'
import { getPresignedCourseUploadUrl } from '@/lib/r2'

export const dynamic = 'force-dynamic'

// POST /api/admin/course-content/presign — get a presigned upload URL for course content
export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: 'fileName es requerido' }, { status: 400 })
    }

    const { url, key } = await getPresignedCourseUploadUrl(fileName, contentType || 'application/octet-stream')

    return NextResponse.json({ uploadUrl: url, key })
  } catch (error) {
    console.error('[Admin Course Content Presign Error]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
