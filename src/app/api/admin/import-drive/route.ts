import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

/* ── Importar archivo desde Google Drive → R2 (S51) ──
   El archivo debe estar compartido como "cualquiera con el link".
   Destinos: recurso (Resource público) | curso (CourseContent) | lectura (audio de inscripción) */

function extractDriveId(url: string): string | null {
  const m =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/^([a-zA-Z0-9_-]{20,})$/)
  return m ? m[1] : null
}

function parseFileName(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8) { try { return decodeURIComponent(utf8[1]) } catch {} }
  const plain = disposition.match(/filename="?([^";]+)"?/i)
  if (plain) return plain[1]
  return fallback
}

function extType(name: string, mime: string): string {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['mp3','wav','ogg','m4a','aac','flac'].includes(ext) || mime.startsWith('audio/')) return 'audio'
  if (['mp4','webm','mov','avi','mkv'].includes(ext) || mime.startsWith('video/')) return 'video'
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf'
  if (['jpg','jpeg','png','webp','gif'].includes(ext) || mime.startsWith('image/')) return 'imagen'
  return 'documento'
}

export async function POST(request: NextRequest) {
  try {
    const { url, destino, courseId, enrollmentId, title } = await request.json()
    const id = extractDriveId(url || '')
    if (!id) return NextResponse.json({ error: 'Link de Drive inválido' }, { status: 400 })

    const dl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`
    const res = await fetch(dl, { redirect: 'follow' })
    if (!res.ok) return NextResponse.json({ error: 'Drive rechazó la descarga (¿el archivo es público?)' }, { status: 502 })
    const ctype = res.headers.get('content-type') || 'application/octet-stream'
    if (ctype.includes('text/html')) {
      return NextResponse.json({ error: 'Drive devolvió una página de aviso: compartí el archivo como "cualquiera con el link"' }, { status: 400 })
    }
    const fileName = parseFileName(res.headers.get('content-disposition'), title || `drive-${id}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) return NextResponse.json({ error: 'Archivo vacío o inválido' }, { status: 400 })

    const prefix = destino === 'curso' ? 'cursos' : destino === 'lectura' ? 'lecturas' : 'recursos'
    const safe = fileName.replace(/[^a-zA-Z0-9._\-() ]/g, '_').replace(/\s+/g, ' ').trim()
    const key = `${prefix}/${Date.now()}-${safe}`

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID || '', secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '' },
    })
    await client.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: buf, ContentType: ctype }))

    const { db } = await import('@/lib/db')
    await ensureSchema()
    const ftype = extType(fileName, ctype)

    if (destino === 'recurso') {
      const rid = `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await (db as any).resource.create({ data: { id: rid, title: title || fileName, description: '', category: 'drive', fileType: ftype, r2Key: key, fileName, fileSize: buf.length, price: 0, priceArs: 0, priceUsd: 0, active: 1, sortOrder: 0, createdAt: new Date() } })
    } else if (destino === 'curso') {
      if (!courseId) return NextResponse.json({ error: 'Faltó el curso' }, { status: 400 })
      const cid = `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await (db as any).courseContent.create({ data: { id: cid, courseId, title: title || fileName, description: '', fileType: ftype, r2Key: key, fileName, sortOrder: 999, active: 1, createdAt: new Date() } })
    } else if (destino === 'lectura') {
      if (!enrollmentId) return NextResponse.json({ error: 'Faltó la inscripción' }, { status: 400 })
      await (db as any).studentEnrollment.update({ where: { id: enrollmentId }, data: { r2Key: key, fileName, updatedAt: new Date() } })
    }

    return NextResponse.json({ success: true, r2Key: key, fileName, fileSize: buf.length, fileType: ftype })
  } catch (error) {
    console.error('[Import Drive Error]', error)
    return NextResponse.json({ error: 'Error al importar desde Drive' }, { status: 500 })
  }
}
