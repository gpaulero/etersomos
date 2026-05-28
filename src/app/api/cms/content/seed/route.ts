import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ensureSchema, db } from '@/lib/db'
import { defaultSiteContent } from '@/lib/cms-defaults'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await ensureSchema()
    let inserted = 0

    for (const item of defaultSiteContent) {
      try {
        await (db as any).siteContent.upsert({
          where: { key: item.key },
          update: {
            value: item.value,
            section: item.section,
            label: item.label,
            type: item.type,
          },
          create: {
            key: item.key,
            value: item.value,
            section: item.section,
            label: item.label,
            type: item.type,
          }
        })
        inserted++
      } catch (e: any) {
        console.error(`[CMS] Seed error for ${item.key}:`, e.message || e)
      }
    }

    // Invalidate cache after seeding
    revalidatePath('/', 'layout')
    revalidatePath('/')

    return NextResponse.json({ success: true, inserted, total: defaultSiteContent.length })
  } catch (err: any) {
    console.error('[CMS] SEED error:', err.message || err)
    return NextResponse.json({ error: 'Error al sembrar contenido' }, { status: 500 })
  }
}
