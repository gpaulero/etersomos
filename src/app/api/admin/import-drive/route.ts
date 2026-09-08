import { NextRequest, NextResponse } from 'next/server'
import { uploadResource, uploadCourseResource } from '@/lib/r2'
import { db, ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function extractDriveId(url: string): string | null {
  const m =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/^([a-zA-Z0-9_-]{20,})$/)
  return m ? m[1] : null
}

function detectFileType(fileName: string, mime: string): string {
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  if (mime.startsWith('audio/') || ['mp3','wav','ogg','m4a','flac','aac'].includes(ext)) return 'audio'
  if (mime.startsWith('video/') || ['mp4','webm','mov','avi','mkv'].includes(ext)) return 'video'
  if (mime.startsWith('image/') || ['png','jpg','jpeg','webp','gif'].includes(ext)) return 'imagen'
  return 'documento'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, title, description, fileType, target, courseId, module: moduleName } = body
    const id = extractDriveId(url || '')
    if (!id) return NextResponse.json({ error: 'Link de Drive no válido' }, { status: 400 })

    const res = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`)
    if (!res.ok) return NextResponse.json({ error: `Drive devolvió ${res.status}. Revisá que el archivo sea público ("cualquiera con el enlace").` }, { status: 502 })
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/html')) return NextResponse.json({ error: 'Drive devolvió una página de confirmación. Compartí el archivo como "cualquiera con el enlace" y probá de nuevo.' }, { status: 502 })
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) return NextResponse.json({ error: 'El archivo de Drive está vacío' }, { status: 502 })

    const cd = res.headers.get('content-disposition') || ''
    const cdName = (cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i) || [])[1]
    let fileName = String(title || cdName || `drive-${id}`).trim()
    if (!fileName.includes('.') && cdName && cdName.includes('.')) fileName = cdName
    const mime = contentType || 'application/octet-stream'

    const file = new File([buf], fileName, { type: mime })

    if (target === 'curso') {
      if (!courseId) return NextResponse.json({ error: 'Falta el curso destino' }, { status: 400 })
      const up = await uploadCourseResource(file)
      await ensureSchema()
      await (db as any).courseContent.create({ data: {
        id: `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        courseId,
        title: title || fileName,
        description: description || '',
        fileType: fileType || detectFileType(fileName, mime),
        r2Key: up.key,
        fileName: up.name,
        sortOrder: 999,
        active: 1,
        module: moduleName || '',
        moduleOrder: 0,
      }})
      return NextResponse.json({ success: true, key: up.key, size: up.size })
    }

    const up = await uploadResource(file)
    await ensureSchema()
    await (db as any).resource.create({ data: {
      id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: title || fileName,
      description: description || '',
      category: 'general',
      fileType: fileType || detectFileType(fileName, mime),
      r2Key: up.key,
      fileName: up.name,
      fileSize: up.size,
      price: 0,
      priceArs: 0,
      priceUsd: 0,
      active: 1,
      sortOrder: 0,
    }})
    return NextResponse.json({ success: true, key: up.key, size: up.size })
  } catch (e) {
    console.error('[import-drive]', e)
    return NextResponse.json({ error: 'Error al importar desde Drive' }, { status: 500 })
  }
}
