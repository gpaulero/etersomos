import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ensureSchema, db } from '@/lib/db'

export async function PUT(request: Request) {
  try {
    await ensureSchema()
    const body = await request.json()
    const { updates } = body

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    let updated = 0
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue
      try {
        await (db as any).siteContent.update({
          where: { key },
          data: { value: String(value) }
        })
        updated++
      } catch (e: any) {
        console.warn(`[CMS] Could not update key ${key}:`, e.message || e)
      }
    }

    // Invalidate Next.js cache so the public pages reflect changes immediately
    revalidatePath('/', 'layout')
    revalidatePath('/')
    revalidatePath('/tienda')
    revalidatePath('/cursos')
    revalidatePath('/membresias')
    revalidatePath('/lecturas')
    revalidatePath('/recursos')

    return NextResponse.json({ success: true, updated })
  } catch (err: any) {
    console.error('[CMS] BULK PUT error:', err.message || err)
    return NextResponse.json({ error: 'Error al actualizar contenido' }, { status: 500 })
  }
}
