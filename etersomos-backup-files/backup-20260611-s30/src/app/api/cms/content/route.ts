import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ensureSchema, db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await ensureSchema()
    const rows = await (db as any).siteContent.findMany()

    const grouped: Record<string, Record<string, { value: string; label: string; type: string; updatedAt: string }>> = {}

    for (const row of rows as Array<{ key: string; value: string; section: string; label: string; type: string; updatedAt: string }>) {
      if (!grouped[row.section]) grouped[row.section] = {}
      grouped[row.section][row.key] = {
        value: row.value,
        label: row.label,
        type: row.type,
        updatedAt: row.updatedAt,
      }
    }

    const response = NextResponse.json(grouped)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (err: any) {
    console.error('[CMS] GET error:', err.message || err)
    return NextResponse.json({ error: 'Error al cargar contenido' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await ensureSchema()
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const existing = await (db as any).siteContent.findUnique({ where: { key } })
    if (!existing) {
      return NextResponse.json({ error: 'Clave no encontrada. Usá /seed primero.' }, { status: 404 })
    }

    await (db as any).siteContent.update({
      where: { key },
      data: { value: String(value) }
    })

    // Invalidate Next.js cache so changes reflect immediately
    revalidatePath('/', 'layout')
    revalidatePath('/')

    return NextResponse.json({ success: true, key })
  } catch (err: any) {
    console.error('[CMS] PUT error:', err.message || err)
    return NextResponse.json({ error: 'Error al actualizar contenido' }, { status: 500 })
  }
}
