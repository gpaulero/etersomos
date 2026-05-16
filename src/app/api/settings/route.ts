import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";

export const dynamic = 'force-dynamic';

const defaultForms: Record<string, boolean> = {
  lecturas: true,
  "n1-teorico": true,
  "n1-con-practica": true,
  "n2-completo": true,
  ambos: true,
  membresias: true,
};

export async function GET() {
  try {
    await ensureSchema();

    const settings = await db.settings.findFirst();

    const savedForms = settings?.forms;
    const forms = savedForms && Object.keys(savedForms).length > 0
      ? savedForms
      : defaultForms;
    const pauseMessage = settings?.pauseMessage || "Fer se encuentra en pausa temporal. ¡Pronto volvemos!";

    return NextResponse.json(
      { forms, pauseMessage },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error("[Settings GET] Error:", error);
    return NextResponse.json(
      { forms: defaultForms, pauseMessage: "Fer se encuentra en pausa temporal. ¡Pronto volvemos!" },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await ensureSchema();

    const body = await request.json();

    // Read current settings from DB
    const current = await db.settings.findFirst();

    const updateData: Record<string, unknown> = {};

    if (body.forms !== undefined) {
      // body.forms is a partial update — merge with defaults + current
      const currentForms = current?.forms && Object.keys(current?.forms || {}).length > 0
        ? current.forms
        : defaultForms;
      updateData.forms = { ...currentForms, ...body.forms };
    }

    if (body.pauseMessage !== undefined) {
      updateData.pauseMessage = body.pauseMessage;
    }

    const updated = await db.settings.update({
      where: { id: "singleton" },
      data: updateData,
    });

    // Invalidate all relevant page caches so changes reflect immediately
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/tienda');
    revalidatePath('/cursos');
    revalidatePath('/cursos/n1-teorico');
    revalidatePath('/cursos/n1-con-practica');
    revalidatePath('/cursos/n2');
    revalidatePath('/cursos/ambos');
    revalidatePath('/membresias');
    revalidatePath('/lecturas');
    revalidatePath('/recursos');

    return NextResponse.json({
      success: true,
      settings: { forms: updated?.forms || updateData.forms, pauseMessage: updated?.pauseMessage || updateData.pauseMessage },
    });
  } catch (error) {
    console.error("[Settings PUT] Error:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración" },
      { status: 500 }
    );
  }
}
