# Worklog - Eter Somos

---
## ESTADO ACTUAL DEL PROYECTO (última actualización: 2026-05-13)

### URLs importantes:
- **Producción activa:** https://etersomos-iota.vercel.app
- **GitHub:** https://github.com/gpaulero/etersomos
- **GitHub PAT:** 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
- **Vercel Token:** vcp_4LujBKhqwrKpCWAxOJY4aKtXOp8Ltw1zsx3BBqPUkARgtMlWEL2qq3xt
- **Vercel Team:** team_LvzyzJEg1ssYCZ0GgvvVmZMH
- **Vercel Project ID:** prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY
- **Vercel Dashboard:** https://vercel.com/gpauleros-projects/etersomos
- **Admin URL:** https://etersomos-iota.vercel.app/admin
- **Admin password:** eter2024admin

### Credenciales Git local:
- Email: gpaulero@gmail.com
- Nombre: gpaulero
- **IMPORTANTE:** NUNCA usar z@container como email de git (Vercel bloquea el deploy)

### Nota sobre URLs:
- El proyecto original era etersomos-gpauleros-projects.vercel.app (proyecto en org team_g8aMlFGUV5psNwW6vWm3RJRC, projectId prj_aG2V0LwVQlZLOP3VPSNqGcjT) — ESE TOKEN NO TIENE ACCESO A ESE PROYECTO
- El proyecto accesible con el token actual es etersomos-iota.vercel.app (org team_LvzyzJEg1ssYCZ0GgvvVmZMH, projectId prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY)
- Este es el UNICO proyecto disponible con el token actual
- Para cambiar al proyecto original, el usuario debe dar un token nuevo con acceso a esa org

### Flujo de deploy:
1. `git add -A && git -c user.name="gpaulero" -c user.email="gpaulero@gmail.com" commit -m "mensaje"`
2. `git push origin main` (esto dispara deploy automático en Vercel via GitHub integration)
3. Deploy manual: `npx vercel --prod --token="vcp_4LujBKhqwrKpCWAxOJY4aKtXOp8Ltw1zsx3BBqPUkARgtMlWEL2qq3xt"`

### Comando de deploy CLI (con .vercel/project.json configurado):
```
cd /home/z/my-project && npx vercel --prod --token="vcp_4LujBKhqwrKpCWAxOJY4aKtXOp8Ltw1zsx3BBqPUkARgtMlWEL2qq3xt"
```

### .vercel/project.json actual:
```json
{
  "orgId": "team_LvzyzJEg1ssYCZ0GgvvVmZMH",
  "projectId": "prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY"
}
```

---
## ARQUITECTURA TÉCNICA

### Stack:
- Next.js 16 con App Router
- Turbopack (dev server)
- Tailwind CSS 4
- shadcn/ui components
- Framer Motion (animaciones)
- Sonner (toasts)
- Prisma + Turso (DB libSQL) para bookings, pedidos, membresías, settings
- GitHub: gpaulero/etersomos (repo privado)

### Directorio del proyecto:
- **Raíz:** `/home/z/my-project/` (NO usar /home/z/my-project/etersomos/)
- **next.config.ts:** Turbopack root apunta a ".."
- **.vercel/project.json:** Linkeado a etersomos (prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY)

### Base de datos:
- **Motor:** Turso (libSQL) — configurado via DATABASE_URL en .env
- **Proxy:** src/lib/db.ts tiene un proxy Prisma→Turso que traduce llamadas Prisma a SQL directo
- **Tablas:** ReadingBooking, Membership, CrystalOrder, Settings
- **Settings proxy especial:** createSettingsProxy() maneja key/value (form_toggles, pause_message)
- **ensureSchema():** Crea tablas automáticamente si no existen (CREATE TABLE IF NOT EXISTS)
- **LOCAL (sin Turso):** Usa Prisma con SQLite file:./db/custom.db (NO tiene modelo Settings en schema.prisma — usa SQL raw via ensureSchema)

### Fuentes:
- **Títulos/Serif:** Playfair Display
- **Cuerpo/Sans:** Josefin Sans

### Paleta de colores (violeta/místico):
- Variables CSS en globals.css: violet-400, violet-500, gold-400, mystic-900, mystic-950, etc.
- Estilo glass: backdrop-blur con bordes semitransparentes

### Precios (formato: ARS primero, USD después):
- Membresía Raíz de Luz: $5.000 ARS · US$5/mes
- Membresía Corazón Solar: $10.000 ARS · US$8/mes
- Membresía Puente Estelar: $15.000 ARS · US$12/mes
- Curso N1 Teórico: Contribución voluntaria
- Curso N1 con Práctica: $35.000 ARS · US$30
- Curso N2 Completo: $45.000 ARS · US$45
- Ambos Cursos: $70.000 ARS · US$55
- Lecturas: desde $18.000 ARS · US$20
- Cristales: varios (ver crystalProducts en page.tsx)

---
## ESTRUCTURA DEL SITIO

### Páginas:
- `/` → Home (11 secciones: Navbar, Hero, Espacios, Sobre Fer, Membresía Destacada, Recursos, Tienda/Cristales, Testimonios, FAQ accordion, Newsletter, Footer)
- `/admin` → Panel de administración completo (login con password, kanban boards, stats, control de formularios)
- `/cursos` → Listado 4 cursos (tarjetas glass 2x2, botones "Inscribirme")
- `/cursos/n1-teorico` → Curso N1 Teórico (con banner de pausa)
- `/cursos/n1-con-practica` → Curso N1 con Práctica (con banner de pausa)
- `/cursos/n2-completo` → Curso N2 Completo (con banner de pausa)
- `/cursos/ambos` → Ambos Cursos (con banner de pausa)
- `/lecturas` → Lecturas Akáshicas (formulario completo, con banner de pausa)
- `/membresias` → Membresías (3 planes con tarjetas glass, con banner de pausa)

### Panel de Admin (/admin):
- **Acceso:** Triple-click en logo del Eter en la home → redirige a /admin
- **Password:** eter2024admin
- **Auth:** sessionStorage (persiste mientras la pestaña esté abierta)
- **5 Tabs:**
  1. **Lecturas** — Kanban: Pendientes → En Proceso → Entregadas
  2. **Cristales** — Kanban: Pendientes de Envío → Preparando → Entregados
  3. **Cursos** — Kanban: Inscritos → En Curso → Completados
  4. **Membresías** — Kanban: Activas → Pendientes → Vencidas/Canceladas
  5. **Formularios** — 6 toggles individuales + pausar/activar todos + mensaje de pausa
- **Features:** Drag & drop kanban, expandir tarjetas, copiar ID, eliminar con confirmación, exportar CSV, búsqueda global
- **APIs:** /api/admin/stats, /api/bookings, /api/admin/orders, /api/admin/memberships, /api/settings

### Navbar links:
Inicio, Sesiones (/lecturas), Cursos (/cursos), Membresía (#membresias), Recursos (#recursos), Tienda (#cristales), Contacto (#contacto)

### Footer links:
Inicio, Sesiones, Cursos (/cursos), Membresía, Recursos, Tienda (#cristales), Contacto

### Funcionalidades:
- Carrito de cristales con checkout (MercadoPago + PayPal)
- Sistema de reservas de lecturas (API /api/bookings)
- Sistema de pausa/reactivación de formularios desde admin (persiste en DB Turso)
- Banner de pausa en formularios desactivados (componente form-paused-banner.tsx)
- Filtro de categorías de cristales
- FAQ accordion
- Newsletter email
- Botón flotante WhatsApp (wa.me/5493518629325)
- Botón "Volver arriba"
- Animaciones Framer Motion (fade-in, stagger, float, twinkle)

---
## ARCHIVOS PRINCIPALES

| Archivo | Descripción |
|---------|-------------|
| `src/app/page.tsx` | Home completa (~3030 líneas) |
| `src/app/admin/page.tsx` | Panel admin completo (~1630 líneas): stats, 4 kanban boards, tab formularios |
| `src/app/layout.tsx` | Layout global con fuentes Playfair + Josefin |
| `src/app/globals.css` | Variables CSS de colores + animaciones custom |
| `src/app/cursos/page.tsx` | Listado 4 cursos en tarjetas glass |
| `src/app/cursos/layout.tsx` | Layout con "Volver a Inicio" |
| `src/app/cursos/n1-teorico/page.tsx` | Formulario inscripción N1 |
| `src/app/cursos/n1-con-practica/page.tsx` | Formulario inscripción N1 con práctica |
| `src/app/cursos/n2-completo/page.tsx` | Formulario inscripción N2 |
| `src/app/cursos/ambos/page.tsx` | Formulario inscripción ambos cursos |
| `src/app/lecturas/page.tsx` | Lecturas Akáshicas con formulario completo |
| `src/app/membresias/page.tsx` | 3 planes de membresía con tarjetas glass |
| `src/app/api/settings/route.ts` | API GET/PUT para settings (DB Turso) |
| `src/app/api/bookings/route.ts` | API bookings |
| `src/app/api/admin/stats/route.ts` | API stats admin |
| `src/app/api/admin/orders/route.ts` | API pedidos (cristales + cursos) |
| `src/app/api/admin/memberships/route.ts` | API membresías |
| `src/app/api/admin/contacts/route.ts` | API exportar contactos CSV |
| `src/lib/db.ts` | Proxy Prisma→Turso, createSettingsProxy, ensureSchema |
| `src/components/form-paused-banner.tsx` | Banner reutilizable para formularios pausados |
| `prisma/schema.prisma` | Schema Prisma (ReadingBooking, Membership, CrystalOrder) — NO tiene Settings model |
| `data/settings.json` | Archivo local de settings (ya NO se usa, migrado a DB Turso) |
| `next.config.ts` | Turbopack root + CORS headers |
| `.vercel/project.json` | Config link a Vercel (etersomos) |

### Notas técnicas:
- shadcn/ui Card causó problemas de layout → se usan divs plain styled con clases glass custom
- Preview proxy puede tener cache; verificar con curl directo
- Settings se guardan en DB Turso (NO en filesystem) — data/settings.json es solo fallback local
- El proxy Settings en db.ts usa tabla key/value (CREATE TABLE IF NOT EXISTS Settings)
- La tabla Settings se crea automáticamente en ensureSchema()

---
## BACKUPS

| Fecha | Archivo | Tamaño | Ubicación |
|-------|---------|--------|-----------|
| 2026-05-13 | etersomos-backup-20260512.tar.gz | 3.0MB | /home/z/my-project/backups/ + /home/z/my-project/download/ |
| 2024-04-23 | (backup completo antiguo) | — | /home/z/my-project/etersomos-backup-20260423-164958/ |

---
## HISTORIAL DE TRABAJO

---
Task ID: 1
Agent: Super Z (Main)
Task: Rediseño completo de Home, fix /cursos, ajustes varias páginas

Work Log:
- Rediseño completo de la página Home (page.tsx): 11 secciones, paleta violeta, tarjetas glass
- Fuentes revertidas a originales: Playfair Display + Josefin Sans
- Todos los precios en formato ARS primero, USD después
- Creada /cursos con 4 cursos en grid 2x2 con estilo glass
- Navbar actualizado con 7 items + Instagram + Carrito
- Layout de cursos con "Volver a Inicio"
- Check de términos actualizado en 4 cursos
- next.config.ts: Turbopack root + CORS headers

Stage Summary:
- Git commit: 57854ac

---
Task ID: 2
Agent: Super Z (Main)
Task: Revision UX completa + deploy

Work Log:
- Auditoría UX completa: 19 issues identificados
- 15 correcciones aplicadas en primer batch (WhatsApp flotante, footer, copyright 2026, FAQ unificado, etc.)
- 4 correcciones restantes aplicadas
- Git email corregido de "z@container" a "gpaulero@gmail.com" (43 commits reescritos con filter-branch)
- Force push a GitHub exitoso
- Deploy automático via GitHub integration

Stage Summary:
- Todas las 19 correcciones UX aplicadas y deployadas
- Git: gpaulero@gmail.com configurado permanentemente

---
Task ID: 3
Agent: Super Z (Main)
Task: Agregar control de pausa/reactivación de formularios desde el admin

Work Log:
- Creada API /api/settings (GET + PUT) con persistencia en data/settings.json
- Creado componente FormPausedBanner reutilizable
- Agregada sección "Control de Formularios" en el admin panel con 6 toggles individuales
- Modificados 5 formularios + membresías para verificar estado al cargar

Stage Summary:
- Archivos nuevos: data/settings.json, src/app/api/settings/route.ts, src/components/form-paused-banner.tsx

---
Task ID: 4
Agent: Main Agent
Task: Fix broken admin panel - eliminate dead JSX code outside component

Work Log:
- Read full admin/page.tsx (1622 lines) and found duplicate closing tags
- Fixed by removing duplicate closing code and keeping Footer inside the component
- Build verified, pushed to GitHub, deployed to Vercel production

Stage Summary:
- Root cause: Dead JSX code outside AdminPage component function caused compilation error
- Admin panel now works with all features including the new form toggles tab

---
Task ID: 5
Agent: Super Z (Main)
Task: Migrar API settings de filesystem a base de datos Turso para funcionar en Vercel

Work Log:
- Descubierto que /api/settings usaba fs.writeFile en data/settings.json, que NO funciona en Vercel
- Creada tabla Settings en la DB Turso (key/value con columns: key, value, updatedAt)
- Agregado createSettingsProxy() en src/lib/db.ts para manejar lectura/escritura via SQL
- Reescrito /api/settings/route.ts para usar db.settings.findFirst() y db.settings.update()
- Mejorado handleToggleForm con actualización optimista

Stage Summary:
- Los toggles de formularios funcionan correctamente en Vercel producción
- data/settings.json ya NO se usa (migrado a DB Turso)

---
Task ID: 6
Agent: main
Task: Fix triple-click logo to redirect to /admin, fix Vercel deployment

Work Log:
- Changed triple-click on logo from in-page mini-admin dialog to redirect to /admin
- Fixed .vercel/project.json to correct project
- Built, committed, pushed, deployed to etersomos-iota.vercel.app

Stage Summary:
- Triple-click logo now goes to /admin (full admin with kanban + form toggles)
- Deployed to https://etersomos-iota.vercel.app

---
## TAREAS PENDIENTES (futuras sesiones)

- [ ] Configurar dominio personalizado en Vercel
- [ ] Construir página /recursos (lead magnet con meditaciones + PDFs)
- [ ] Configurar Cloudflare R2 para storage de archivos
- [ ] SEO optimization (meta tags, sitemap, robots.txt, structured data)
- [ ] Google Business Profile
- [ ] Reales testimonios (reemplazar los placeholders actuales)
- [ ] Ajuste de precios a rango de mercado
- [ ] Google Analytics / Search Console
- [ ] Página de política de privacidad y términos
- [ ] Testimonios reales de clientes
- [ ] Configurar un token de Vercel con acceso al proyecto original (etersomos-gpauleros-projects.vercel.app) si el usuario lo necesita
---
Task ID: session-19-cms-integration
Agent: Main Agent
Task: Comprehensive review and fix of Eter Somos - CMS integration, email, DB, pages, admin

Work Log:
- Reviewed entire project structure: 7 public pages, 25+ API routes, CMS system, admin panel
- Tested all API endpoints: auth, CMS, settings, newsletter, resources - all passing (7/7)
- Tested database connectivity: Turso connection working, 8 tables, 125 CMS entries
- Found root cause of admin content edit issue: pages /cursos, /lecturas, /membresias, /tienda, /recursos were NOT using CMS at all - all content was hardcoded
- Integrated CMS into /cursos page: prices and badges now come from CMS with fallbacks
- Integrated CMS into /lecturas page: prices ($18000/$20) now from CMS with fallbacks
- Integrated CMS into /membresias page: tiers, prices now from CMS with fallbacks
- Integrated CMS into /tienda page: products and categories now from CMS with fallbacks
- Fixed hardcoded prices in /api/bookings/route.ts: now reads from SiteContent DB
- Identified email issue: Resend uses onboarding@resend.dev (test sender, can only send to verified emails)
- Built and deployed to Vercel production successfully
- Verified all 7 pages return 200 on production
- Verified CMS end-to-end: update → persist → revert working correctly

Stage Summary:
- CMS now integrated in all pages (was only in homepage before)
- Admin content edits will now reflect on all pages
- API bookings price now reads from CMS/DB instead of hardcoded values
- Live site: https://etersomos-iota.vercel.app - all pages working
- Known issue: Resend sender is onboarding@resend.dev - needs custom domain for production emails to customers
- Known issue: Newsletter subscription doesn't send confirmation to subscriber (only admin notification)

---
Task ID: session-resource-paywall
Agent: Super Z (Main)
Task: Implement resource paywall + video protection + critical system fixes

Work Log:
- Explored entire resource system: DB schema, API routes, upload flow, download route, public page
- Explored payment system: MercadoPago + PayPal integration, checkout flow, confirm-order
- Implemented video/audio stream-only protection (already existed via ProtectedVideoPlayer + X-Stream-Request header)
- Created ResourcePurchase table for tracking paid resource downloads
- Created /api/resources/purchase API route for initiating resource purchases
- Modified /api/resources/download to verify purchase tokens for paid non-streamable resources
- Created /lib/resource-payment.ts client helper for initiating resource payments
- Added "resource_purchase" checkout type to the payment flow
- Modified /recursos page: paid resources show "Comprar y descargar" button with payment dialog
- Modified /payment/success page: shows download button after resource purchase
- Modified /api/payments/confirm-order: handles resource_purchase type, creates ResourcePurchase record
- Admin: added priceArs and priceUsd fields to resource upload form
- Fixed: added revalidatePath('/recursos') to resource CRUD operations (admin edits now reflect on public page)
- Fixed: added ReadingBooking, CrystalOrder, CourseInterest, ResourcePurchase tables to ensureSchema()
- Fixed: created /api/payments/mercadopago-webhook route (was missing, MercadoPago notifications were 404)
- Fixed: auth/login and newsletter/subscribe now return 400 instead of 500 on empty request body
- All fixes tested and verified in production

Stage Summary:
- Resource paywall fully functional: paid resources require MercadoPago/PayPal payment before download
- Videos/audio continue to stream only (not downloadable)
- Free resources remain directly downloadable
- Critical DB schema gaps fixed: all tables now created in ensureSchema()
- MercadoPago webhook endpoint now exists (was missing)
- Error handling improved on auth and newsletter endpoints
- Commits: 0739c7f, 149c632, c5dd893 deployed to production
