# ETÉR SOMOS - Especificación Completa del Proyecto
## (Archivo de referencia CRÍTICO - NO BORRAR)
## Última actualización: 2026-08-19 (sesión 41)

Este documento describe TODO el estado actual, credenciales, estructura y requisitos del sitio web.
**Siempre consultar antes de hacer cambios.**

### REGLA OBLIGATORIA - GIT BACKUP
**DESPUÉS DE CADA CAMBIO (por más chico que sea), hacer git commit inmediatamente.**
No esperar a que el usuario lo pida. Todo cambio a cualquier archivo = commit.
Comando: `git add -A && git -c user.name="gpaulero" -c user.email="gpaulero@gmail.com" commit -m "descripcion del cambio"`
IMPORTANTE: Usar SIEMPRE gpaulero@gmail.com como email de git. NO usar etersomos@gmail.com ni z@container porque Vercel bloquea el deploy.
Esto asegura que nunca se pierda trabajo entre sesiones.

---

## URL Producción
https://www.etersomos.com

## Proyecto Vercel
- ID: prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY
- Org ID: team_LvzyzJEg1ssYCZ0GgvvVmZMH
- Nombre: etersomos
- Dominio principal: www.etersomos.com (verificado, 06/2026)
- Dominio redirect: etersomos.com → 308 → www.etersomos.com
- Dominio legacy: etersomos-iota.vercel.app (verificado, sigue funcionando)
- GitHub Repo ID: 1217270869 (necesario para deploy via API)
- Dashboard: https://vercel.com/gpauleros-projects/etersomos

### NOTA SOBRE URLs (13/05/2026):
- El proyecto original era etersomos-gpauleros-projects.vercel.app (org team_g8aMlFGUV5psNwW6vWm3RJRC, projectId prj_aG2V0LwVQlZLOP3VPSNqGcjT)
- ESE TOKEN NO TIENE ACCESO a ese proyecto
- El proyecto accesible con el token actual es etersomos-iota.vercel.app (este)
- Para cambiar al proyecto original, el usuario debe proporcionar un token nuevo con acceso a esa org

## Repositorio GitHub
- URL: https://github.com/gpaulero/etersomos.git
- Visibilidad: PRIVADO (cambiado de público a privado el 23/04/2026)
- IMPORTANTE: El historial fue limpiado con git-filter-repo para eliminar secrets expuestos
- Los commits viejos fueron reescritos (force push) - los hashes cambiaron

---

## CREDENCIALES Y CONFIGURACIÓN

**TODAS las credenciales están en `.env.local` (archivo local, NO se commitea).**
BACKUP de `.env.local` en: `/home/z/my-project/etersomos-backups/2026-04-23/env.local.backup`

**⚠️ NOTA (10/06/2026): `.env.example` NO existe actualmente en el repo.** Si se necesita recrear, debe contener placeholders para las 16 variables obligatorias (ver tabla abajo).

### Vercel Token
- vcp_52GvKUqT6kZxgfW8ymTCysvu0X1R7F4JfdRwjWBAqm5mFtvn3x1lHd1F (actualizado 17/05/2026)
- Token anterior: vcp_4LujBKhqwrKpCWAxOJY4aKtXOp8Ltw1zsx3BBqPUkARgtMlWEL2qq3xt (EXPIRADO)
- Ver también variable `VERCEL_TOKEN` en `.env.local`

### GitHub PAT
- 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 (actualizado 03/06/2026)
- Token anterior: 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 (EXPIRADO)

### Resend (Emails) — LEGACY, ya no se usa activamente
- Ver variables `RESEND_API_KEY` y `ADMIN_EMAIL` en `.env.local`
- Estado: SANDBOX (solo envía a emails verificados en Resend)
- **Reemplazado por Nodemailer + Gmail SMTP** en sesión 29 (ver sección "Emails (Nodemailer)" abajo)
- Sender anterior: onboarding@resend.dev (sandbox)

### Emails (Nodemailer + Gmail SMTP) — PROVEEDOR ACTUAL
- Cuenta Gmail: etersomos@gmail.com
- App Password: qarpqbgcdhlkxksa
- Env vars: SMTP_USER, SMTP_APP_PASSWORD
- Sender: "Eter Somos" <etersomos@gmail.com>
- **Ventaja sobre Resend**: Envía a cualquier email sin necesidad de verificar dominio
- Todos los templates usan BRAND tokens con la estética del sitio (fondos oscuros, violeta, gold)
- Ver sección "SISTEMA DE EMAILS" para detalle completo de templates

### PayPal
- Modo: SANDBOX (testeo)
- Ver variables `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` en `.env.local`
- **IMPORTANTE (24/04)**: PayPal NO se usa para cristales (producto físico, solo Argentina)
- PayPal se usa para: membresías (links de suscripción), cursos y lecturas (via PayPal.me personal: paypal.me/registrosakashicos9)
- La función `handlePayWithPayPal` fue eliminada de page.tsx (checkout de cristales)
- No se planea pasar a PayPal Business (decisión del usuario)

### MercadoPago (PRODUCCIÓN)
- Ver variables `MERCADOPAGO_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY` en `.env.local`
- Cristales: solo MercadoPago (sin PayPal) — producto físico, se vende solo en Argentina

### Cloudflare R2 (Storage de archivos)
- Ver variables `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` en `.env.local`
- Bucket: etersomos-recursos
- Endpoint: `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- Uso: Almacenamiento de archivos de recursos (PDFs, imágenes, audio, video)
- Librería: src/lib/r2.ts (usa @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner)
- CORS: Configurado (17/05/2026) — AllowedOrigins: *, AllowedMethods: GET/PUT/POST/DELETE
- Flujo de upload: presigned URL → upload directo del navegador a R2 → metadata en DB

### Turso DB
- Ver variable `DATABASE_URL` en `.env.local`
- `DATABASE_AUTH_TOKEN`: obtener con `turso db tokens create etersomos-db-gpaulero`
- El CLI de Turso (`/home/z/.turso/turso`) requiere auth login que no funciona en este entorno (headless)
- Para dumps de DB: usar node con @libsql/client y DATABASE_AUTH_TOKEN del .env.local
- Ejemplo: `node -e "const {createClient}=require('@libsql/client'); ..."`

### Admin Panel
- URL: https://etersomos-iota.vercel.app/admin
- Password: eter2024admin
- Acceso desde el sitio: triple-click en logo del Eter → redirige a /admin
- Auth: sessionStorage con token Bearer (clave: "admin_token")
- Login via POST /api/auth/login → devuelve token ADMIN_API_SECRET
- El middleware valida el token Bearer en todas las APIs protegidas
- La contraseña NO está en el código cliente — se valida del lado del servidor

### Git (para commits)
- Nombre: gpaulero
- Email: gpaulero@gmail.com (DEBE coincidir con GitHub account para que Vercel no bloquee el deploy)
- Repositorio: https://github.com/gpaulero/etersomos.git
- Ver variables `GITHUB_TOKEN`, `GITHUB_USER`, `GITHUB_EMAIL` en `.env.local`

---

## SEGURIDAD - SECRETS

### Estado actual (14/05/2026):
- TODAS las credenciales se guardan en `.env.local` (NO se commitea)
- `.env.example` NO existe actualmente (ver nota arriba en Credenciales)
- El historial de git fue limpiado con `git-filter-repo` para eliminar secrets expuestos
- GitGuardian detectó la Resend API Key expuesta - RESUELTO: eliminada del historial completo
- Si se vuelve a exponer un secret: usar `git-filter-repo --blob-callback` para reemplazarlo y luego `git push --force`
- **SESIÓN 9: Middleware de seguridad implementado** (ver abajo)
- **⚠️ NOTA (10/06/2026):** `src/app/page.tsx` tiene un check de admin password client-side (`process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "eter2024admin"`) en `handleOpenAdmin()`. Esto es menos seguro que el admin panel que usa `/api/auth/login` server-side. El admin panel en `/admin` sí valida correctamente via server-side.

### Middleware de Seguridad (actualizado 17/05/2026):
- **Archivo:** `src/middleware.ts` — se ejecuta en TODAS las rutas `/api/*` y `/admin/*`
- **Rutas protegidas (requieren Bearer token):**
  - `/api/admin/*` — TODOS los métodos
  - `/api/cms/content` — PUT (escritura requiere auth, GET es público para que la home pueda leer CMS)
  - `/api/cms/content/bulk` — PUT (escritura bulk requiere auth)
  - `/api/cms/content/seed` — POST (seed requiere auth)
  - `/api/bookings` — solo GET, PUT, DELETE (POST público para usuarios)
  - `/api/settings` — GET y PUT (usado por admin)
- **Rutas públicas (sin token):**
  - `/api/auth/*` — login
  - `/api/cms/content` — GET (la página principal necesita leer el contenido CMS sin auth)
  - `/api/newsletter/*` — suscripción newsletter
  - `/api/payments/*` — pagos MercadoPago/PayPal
  - `/api/memberships/*` — suscripción a membresías
  - `/api/resources/public` — recursos públicos
- **Security headers aplicados a TODAS las rutas:**
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
  - Cache-Control: no-store (solo en rutas /api/*)
- **Endpoint de login:** `POST /api/auth/login`
  - Body: `{"password": "..."}`
  - Response OK: `{"success": true, "token": "<ADMIN_API_SECRET>"}`
  - Error 401: `{"error": "Contrasena incorrecta"}`
- **Env vars en Vercel (agregadas 14/05/2026):**
  - `ADMIN_API_SECRET` (encrypted) = etersomos_sec_d292595c6232ec53b47c7657254b9b401c6a74ce515aa1db67e778097968aa0f
  - `ADMIN_PASSWORD` (encrypted) = eter2024admin
- **Admin panel (src/app/admin/page.tsx) actualizado:**
  - `authFetch()` wrapper: agrega header `Authorization: Bearer <token>` a todas las requests
  - Login async via `/api/auth/login` (ya no valida password en cliente)
  - sessionStorage clave: `admin_token` (antes era `admin_auth`)
  - `ExportButton` acepta `fetchFn` prop para auth en descargas CSV

### Comandos de emergencia para limpiar secrets:
```bash
cd /home/z/my-project
~/.local/bin/git-filter-repo --blob-callback '
    blob.data = blob.data.replace(b"SECRET_A_REEMPLAZAR", b"****")
' --force
# Re-agregar remote y force push
source .env.local
git remote add origin "https://${GITHUB_TOKEN}@github.com/gpaulero/etersomos.git"
git push --force origin main
```

---

## CHECKLIST OBLIGATORIO - INICIO DE CADA SESIÓN

**ESTA SECCIÓN ES LO PRIMERO QUE DEBE LEERSE AL ARRANCAR CADA NUEVA SESIÓN.**
No saltar este paso. Si se salta, el sitio puede quedar sin emails, sin pagos, sin base de datos.

### PASO 1: Verificar variables de entorno en Vercel

Vercel ha borrado las variables de entorno SOLO entre sesiones (ocurrió el 23/04 y 24/04/2026).
TODAS las funcionalidades del sitio (emails, pagos, DB) dejan de funcionar si las variables desaparecen.

**Verificar con este comando:**
```bash
cd /home/z/my-project
curl -s "https://api.vercel.com/v10/projects/prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY/env" \
  -H "Authorization: Bearer vcp_52GvKUqT6kZxgfW8ymTCysvu0X1R7F4JfdRwjWBAqm5mFtvn3x1lHd1F" | python3 -c "
import sys, json
data = json.load(sys.stdin)
envs = data.get('envs', [])
print(f'Variables en Vercel: {len(envs)}')
for e in envs:
    print(f'  {e[\"key\"]}: {\"OK\" if e.get(\"value\") else \"VACIA\"}')
"
```

**Resultado esperado: 16 variables.** Si muestra 0 o menos de 16, EJECUTAR INMEDIATAMENTE el PASO 2.

### PASO 2: Restaurar variables (solo si faltan)

**⚠️ NOTA (10/06/2026): `scripts/restore-vercel-env.sh` NO existe actualmente.** Usar el método manual:

Restaurar manualmente con la API de Vercel:
```bash
cd /home/z/my-project && source .env.local

create_env() {
  curl -s -X POST "https://api.vercel.com/v10/projects/prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY/env" \
    -H "Authorization: Bearer vcp_52GvKUqT6kZxgfW8ymTCysvu0X1R7F4JfdRwjWBAqm5mFtvn3x1lHd1F" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$1\",\"value\":\"$2\",\"type\":\"$3\",\"target\":[\"production\",\"preview\"]}" > /dev/null 2>&1
  echo "OK: $1"
}

create_env "RESEND_API_KEY" "$RESEND_API_KEY" "encrypted"
create_env "ADMIN_EMAIL" "$ADMIN_EMAIL" "plain"
create_env "DATABASE_URL" "$DATABASE_URL" "encrypted"
create_env "DATABASE_AUTH_TOKEN" "$DATABASE_AUTH_TOKEN" "encrypted"
create_env "PAYPAL_CLIENT_ID" "$PAYPAL_CLIENT_ID" "encrypted"
create_env "PAYPAL_CLIENT_SECRET" "$PAYPAL_CLIENT_SECRET" "encrypted"
create_env "PAYPAL_MODE" "$PAYPAL_MODE" "plain"
create_env "MERCADOPAGO_ACCESS_TOKEN" "$MERCADOPAGO_ACCESS_TOKEN" "encrypted"
create_env "NEXT_PUBLIC_MP_PUBLIC_KEY" "$NEXT_PUBLIC_MP_PUBLIC_KEY" "plain"
create_env "NEXT_PUBLIC_BASE_URL" "$NEXT_PUBLIC_BASE_URL" "plain"
create_env "ADMIN_API_SECRET" "$ADMIN_API_SECRET" "encrypted"
create_env "ADMIN_PASSWORD" "$ADMIN_PASSWORD" "encrypted"
create_env "R2_ACCOUNT_ID" "$R2_ACCOUNT_ID" "plain"
create_env "R2_ACCESS_KEY_ID" "$R2_ACCESS_KEY_ID" "plain"
create_env "R2_SECRET_ACCESS_KEY" "$R2_SECRET_ACCESS_KEY" "plain"
create_env "R2_BUCKET_NAME" "$R2_BUCKET_NAME" "plain"
```

### PASO 3: Redeploy (obligatorio después de recrear variables)

Las variables nuevas NO se aplican al deploy actual. Hay que forzar un nuevo deploy:
```bash
cd /home/z/my-project && source .env.local
SHA=$(git rev-parse HEAD)
curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer vcp_52GvKUqT6kZxgfW8ymTCysvu0X1R7F4JfdRwjWBAqm5mFtvn3x1lHd1F" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"etersomos\",
    \"target\": \"production\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repoId\": 1217270869,
      \"ref\": \"main\",
      \"sha\": \"$SHA\"
    }
  }"
```

### PASO 4: Verificar que el sitio responde

```bash
curl -s -o /dev/null -w "HTTP %{http_code}" "https://etersomos-iota.vercel.app"
# Debe devolver 200

curl -s -X POST "https://etersomos-iota.vercel.app/api/memberships/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","membershipId":"raiz-de-luz","membershipName":"Raíz de Luz"}'
# Debe devolver {"success":true} (no 500)
```

### Las 18 variables que DEBEN estar siempre:

| Variable | Tipo | Valor |
|----------|------|-------|
| SMTP_USER | plain | etersomos@gmail.com |
| SMTP_APP_PASSWORD | encrypted | qarpqbgcdhlkxksa |
| RESEND_API_KEY | encrypted | ver .env.local (legacy) |
| ADMIN_EMAIL | plain | ver .env.local |
| DATABASE_URL | plain | ver .env.local |
| DATABASE_AUTH_TOKEN | encrypted | ver .env.local |
| PAYPAL_CLIENT_ID | encrypted | ver .env.local |
| PAYPAL_CLIENT_SECRET | encrypted | ver .env.local |
| PAYPAL_MODE | plain | sandbox |
| MERCADOPAGO_ACCESS_TOKEN | encrypted | ver .env.local |
| NEXT_PUBLIC_MP_PUBLIC_KEY | plain | ver .env.local |
| NEXT_PUBLIC_BASE_URL | plain | https://etersomos-iota.vercel.app |
| ADMIN_API_SECRET | encrypted | etersomos_sec_d292... (ver sección Seguridad) |
| ADMIN_PASSWORD | encrypted | eter2024admin |
| R2_ACCOUNT_ID | plain | ver .env.local |
| R2_ACCESS_KEY_ID | plain | ver .env.local |
| R2_SECRET_ACCESS_KEY | plain | ver .env.local |
| R2_BUCKET_NAME | plain | etersomos-recursos |

---

## ARQUITECTURA TÉCNICA

### Stack:
- Next.js 16 (App Router, Turbopack), Tailwind CSS 4, shadcn/ui, Framer Motion
- Turso (libSQL) para DB, Nodemailer + Gmail SMTP para emails (reemplazó Resend), Sonner (toasts)
- PayPal REST API (sandbox), MercadoPago Checkout Pro (producción)
- Prisma ORM, TypeScript, React 19

### Directorio del proyecto:
- **Repo clonado en:** `/home/z/my-project/etersomos/`
- **Raíz del proyecto Next.js:** `/home/z/my-project/` (NO la subcarpeta etersomos/)
- **next.config.ts:** Turbopack root apunta a ".."
- **.vercel/project.json:** Linkeado a etersomos (prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY)

### Base de datos:
- **Motor:** Turso (libSQL) — configurado via DATABASE_URL en .env
- **Proxy:** src/lib/db.ts tiene un proxy Prisma→Turso que traduce llamadas Prisma a SQL directo
- **Tablas:** ReadingBooking, Membership, CrystalOrder, NewsletterSubscriber, Settings, SiteContent, Resource, CourseInterest, Student, StudentEnrollment, EnrollmentAttachment, CourseContent
- **Settings proxy especial:** createSettingsProxy() maneja key/value (form_toggles, pause_message)
- **ensureSchema():** Crea tablas automáticamente si no existen (CREATE TABLE IF NOT EXISTS)
- **Auto-migración:** Columnas nuevas se agregan con ALTER TABLE (ej: deliveryDate en ReadingBooking)
- **LOCAL (sin Turso):** Usa Prisma con SQLite file:./db/custom.db (NO tiene modelo Settings en schema.prisma — usa SQL raw via ensureSchema)
- **IMPORTANTE:** data/settings.json ya NO se usa — todo se guarda en DB Turso
- **DB Proxy JavaScript:** Imita PrismaClient sobre libSQL en producción (ver src/lib/db.ts)

### Componentes UI:
- Exclusivamente shadcn/ui primitives bajo src/components/ui/
- Componente custom: src/components/form-paused-banner.tsx (banner para formularios pausados)
- Toda la UI está inline en los archivos de página (no hay componentes custom de aplicación separados)

### Fuentes:
- **Títulos/Serif:** Playfair Display
- **Cuerpo/Sans:** Josefin Sans

### Paleta de colores (violeta/místico):
- Variables CSS en globals.css: violet-400, violet-500, gold-400, mystic-900, mystic-950, etc.
- Estilo glass: backdrop-blur con bordes semitransparentes

---

## DECISIÓN DE ARQUITECTURA: Admin Panel

El admin panel está **en el mismo proyecto** que el sitio público bajo `/admin`. Esto es correcto porque:
- Comparte la misma DB, env vars, y librerías
- Es un panel pequeño/mediano, no una app separada
- Simplifica el deploy (un solo repo, un solo Vercel project)
- El acceso está protegido por contraseña

**No se recomienda separarlo** a menos que el panel crezca significativamente (múltiples usuarios, roles, permisos).

---

## PANEL DE ADMIN (/admin)

### Acceso:
- Triple-click en logo del Eter en la home → redirige a /admin
- Direct URL: https://etersomos-iota.vercel.app/admin
- Password: eter2024admin
- Auth: sessionStorage (persiste mientras la pestaña esté abierta)

### Navegación: Sidebar con secciones agrupadas (rediseño sesión 27-28):
- **Layout**: Sidebar fija en desktop (240px) + Sheet drawer en mobile, reemplazó Tabs (commit 1043243)
- **Sección activa**: `activeSection` state con renderizado condicional
- **Animaciones**: Framer Motion (AnimatePresence) para transiciones entre secciones

| Grupo | Sección | ID | Icono |
|-------|---------|-----|-------|
| PRINCIPAL | Dashboard | dashboard | LayoutDashboard |
| PRINCIPAL | Lecturas | lecturas | BookOpen |
| PRINCIPAL | Cristales | cristales | ShoppingCart |
| PRINCIPAL | Cursos | cursos | GraduationCap |
| PRINCIPAL | Membresías | membresias | Crown |
| AULA VIRTUAL | Alumnos | alumnos | Users |
| AULA VIRTUAL | Contenido Cursos | curso-contenido | Video |
| SITIO WEB | Contenido (CMS) | cms | FileText |
| SITIO WEB | Recursos | recursos | FolderOpen |
| SITIO WEB | Formularios | formularios | Power |
| DATOS | Suscriptores | suscriptores | Users |

### Contenido por sección:
1. **Dashboard** — Stats overview (5 cards: lecturas, cristales, cursos, membresías, ingresos) + revenue breakdown
2. **Lecturas** — Kanban: Pendientes → En Proceso → Entregadas
3. **Cristales** — Kanban: Pendientes de Envío → Preparando → Entregados
4. **Cursos** — Kanban: Inscritos → En Curso → Completados
5. **Membresías** — Kanban: Activas → Pendientes → Vencidas/Canceladas
6. **Formularios** — 6 toggles individuales + pausar/activar todos + mensaje de pausa
7. **Suscriptores** — Listado de suscriptores a recursos gratuitos, eliminar, exportar CSV
8. **Contenido** — CMS: editor de textos, precios, productos, testimonios, FAQ (34 campos, 7 secciones)
9. **Recursos** — Upload/download de archivos a Cloudflare R2, gestionar metadata, activar/desactivar
10. **Alumnos** — Gestión de alumnos del Aula Virtual (lista, detalle, inscripciones con tabs de filtro: Pendientes/Entregadas/Cursos/Todas, crear, eliminar)
11. **Contenido Cursos** — Gestión de contenido de cursos (upload video/audio/PDF, playlist)

### Features del Admin:
- Drag & drop kanban (HTML5 Drag API nativo, sin librerías externas)
- Expandir tarjetas para ver detalles completos
- Copiar ID al portapapeles
- Eliminar con confirmación (doble click)
- Exportar contactos a CSV (por tab o todos)
- Búsqueda global por nombre o email
- Stats overview (5 cards: lecturas, cristales, cursos, membresías, ingresos)
- Revenue breakdown (métodos de pago + estados)
- Actualizaciones optimistas (refresca datos después de cada cambio)

### Kanban — Estados por sección:

| Sección | Columna 1 | Columna 2 | Columna 3 | Estados válidos |
|----------|-----------|-----------|-----------|------------------|
| Lecturas | Pendientes | En Proceso | Entregadas | pendiente, en_progreso, entregada, cancelada |
| Cristales | Pendiente Envío | Preparando | Entregados | pendiente, preparando, entregado, cancelado |
| Cursos | Inscritos | En Curso | Completados | inscrito, en_curso, completado, cancelado |
| Membresías | Activas | Pendientes | Vencidas | activa, pendiente, cancelada, vencida |

### Control de Formularios (Tab "Formularios"):
- 6 formularios con toggle individual: Lecturas, N1 Teórico, N1 Práctica, N2, Ambos, Membresías
- Botones "Pausar todos" y "Activar todos"
- Campo editable para mensaje de pausa personalizado
- Los toggles se guardan en DB Turso (tabla Settings, key="form_toggles")
- Cuando un formulario está pausado, los usuarios ven un banner de aviso (componente FormPausedBanner)
- API: GET/PUT /api/settings

### APIs del Admin:
- GET /api/admin/stats — Estadísticas generales
- GET/POST /api/bookings — Lecturas (CRUD)
- GET /api/admin/orders — Pedidos (cristales + cursos)
- GET /api/admin/memberships — Membresías
- PUT /api/admin/bookings/[id] — Cambiar estado/fecha lectura
- PUT /api/admin/orders/[id] — Cambiar estado pedido
- PUT /api/admin/memberships/[id] — Cambiar estado membresía
- DELETE /api/admin/bookings/[id] — Eliminar lectura
- DELETE /api/admin/orders/[id] — Eliminar pedido
- DELETE /api/admin/memberships/[id] — Eliminar membresía (valida: activa, pendiente, cancelada, vencida)
- GET /api/admin/contacts?type=all|bookings|crystals|courses|memberships — Exportar contactos CSV

---

## SECCIONES DEL SITIO

### 1. NAVBAR (fija arriba)
- Logo + "ETER SOMOS" a la izquierda
- Links: Inicio | Lecturas | Cursos | Mentorías (/mentorias) | Membresías (/membresias) | Recursos (/recursos) | Tienda (/tienda) | Aula (/aula)
- Icono de Instagram
- Icono de carrito: ELIMINADO de la navbar global (sesión 34). El carrito existe únicamente dentro de /tienda
- NO hay botón flotante de carrito abajo
- Menu hamburguesa en mobile con Sheet lateral
- **IMPORTANTE**: Los labels del navbar vienen del CMS (nav.link_sesiones=Lecturas, nav.link_mentorias=Mentorías, nav.link_membresia=Membresías, nav.link_recursos=Recursos)

### 2. HERO SECTION (#inicio)
- Imagen de fondo (hero-bg-v2.webp - foto real de Pexels, 5441x3661 → 2560x1440 WebP)
- Overlay oscuro bg-mystic-950/80
- Logo circular animado (float) con **opacidad al 85%** (opacity-85)
- Título visible: ELIMINADO (sesión 34). El hero muestra solo logo + tagline + botones. El key CMS site.hero_title queda sin usar (H1 sr-only SEO intacto)
- Tagline: CMS (hero_tagline: "Un espacio para vivir tu espiritualidad de forma cercana, humana y sobre todo desde la consciencia")
- 2 botones: "Ver servicios" (→ #espacios) y "Pedí tu Lectura" (→ /lecturas) con icono BookOpen

### 3. ESPACIOS (#espacios)
- 4 cards: Lectura de Registros Akáshicos ($20.000 ARS · US$20), Cursos (contribución voluntaria), Membresías (Desde $5.000 ARS · US$5/mes), Cristales (Solo envío en Argentina)
- Cada card con icono, título, descripción, precio y link a la sección/página correspondiente

### 4. SOBRE FER (#sobre)
- Foto de Fer Cardozo (public/images/fer-sobre.webp) con overlay violeta
- Bio: "Soy Fer Cardozo, Viajera, emprendedora, guía espiritual..."
- 3 stats: 500+ lecturas realizadas, 200+ alumnos, 5 años de experiencia
- Título CMS: "Fer Cardozo", subtítulo: "Conoce a tu guía"

### 5. TESTIMONIOS
- 3 cards con nombre, ubicación, testimonio, rating estrellas
- Datos CMS-driven (testimonials.section)

### 6. FAQ
- Accordion con 6 preguntas frecuentes
- Datos CMS-driven (faq.section)
- Items: ¿Qué son los Registros Akáshicos?, ¿Cómo funciona una lectura?, ¿Es confidencial?, ¿Qué cursos ofrecen?, ¿Qué incluyen las membresías?, ¿Envíos de cristales?

### 7. FOOTER (#contacto)
- Links de navegación, Instagram, Copyright
- Email de contacto: etersomos@gmail.com
- WhatsApp: +54 9 3518 62-9325
- Disclaimer legal

### 8. BOTÓN "VOLVER ARRIBA"
- Flecha ArrowUp fija abajo a la derecha
- Solo se muestra al hacer scroll

### PÁGINAS SEPARADAS (no están en la homepage):

### /membresías (DISEÑO DEDICADO)
- **Fondo**: membresias-bg.webp con overlay mystic-950/80
- **Estrellas animadas** (twinkle) en el hero
- **Sección "Cómo suscribirte"** con 4 pasos:
  1. Elegí la membresía (Star)
  2. Dejá tu correo (Mail) - completar formulario de inscripción
  3. Suscribite (CreditCard) - MercadoPago o PayPal
  4. ¡Listo! (Check)
- **Tarjetas de membresía** (con collapsible):
  - Emojis personalizados (mismos PNG que index)
  - Badge de frecuencia centrado (flex justify-center)
  - **FLUJO**: Primero formulario, después botones de pago:
    1. Se muestran campos: nombre + email + botón "Continuar al pago"
    2. Al enviar → POST a /api/memberships/subscribe → email al admin
    3. Se reemplazan por botones de MP y PayPal (misma estética mystic del index)
    4. Confirmación: nombre y email del suscriptor con check dorado
  - Botones de pago con space-y-5 entre ellos y display:block en los links
- **Nota importante**: Texto sobre que la suscripción se completa al pagar en MP/PayPal
- **Contacto**: Email (etersomos@gmail.com) + WhatsApp (+54 9 3518 62-9325)
- **Layout propio** (layout.tsx): header con "Volver al inicio" + footer

### /cursos (#cursos)
Grid 2x2 en desktop, 1 columna en mobile:

| ID | Nombre | Precio ARS | Precio USD | Badge | Link |
|----|--------|-----------|-----------|-------|------|
| n1-teorico | 1er Nivel Solo Teórico | Voluntario | Voluntario | sin badge | /cursos/n1-teorico |
| n1-practica | 1er Nivel con Práctica | $45.000 | $35 | "Más Elegido" | /cursos/n1-practica |
| n2 | 2do Nivel Completo | $60.000 | $50 | sin badge | /cursos/n2 |
| ambos | Ambos Cursos | $85.000 | $65 | "Mejor Precio" | /cursos/ambos |

IMPORTANTE: Cada card lleva a su página dedicada con formulario completo de inscripción.
Los links de pago que estaban en los formularios originales de Google NO se usan.
TODOS los pagos pasan por la pasarela del sitio web (MercadoPago o PayPal).

### /tienda (TIENDA DE CRISTALES — PÁGINA SEPARADA desde sesión 8)
- Página propia en /tienda (NO está en la página principal)
- Fondo: crystals-banner.webp (imagen cósmica oscura, 4000x2251 → 2560x1440 WebP, oscurecida)
- Filtros por categoría (Todos, Amatista, Cuarzo Rosa, etc.)
- Grid de productos con imagen, nombre, precio, descripción
- Botón "Agregar al carrito"
- Carrito se abre desde navbar
- **Solo MercadoPago** (producto físico, sin PayPal)
- Navbar propio + footer con "Volver al inicio"

### /recursos (RECURSOS GRATUITOS — PÁGINA SEPARADA desde sesión 8)
- Página propia en /recursos (NO está en la página principal)
- Formulario de newsletter (email + suscribirme)
- Backend real de newsletter: POST /api/newsletter/subscribe → DB + email admin
- Grid de recursos gratuitos cargados desde la DB (tabla Resource, active=1)
- Cada recurso muestra título, descripción, tipo de archivo, botón de descarga
- **Modelo de contribución voluntaria**: Recursos gratuitos + links opcionales de MP/PayPal para contribuir
- ProtectedPlayer para video/audio (anti-descarga)
- Navbar propio con links correctos (Inicio, Lecturas, Cursos, Mentorías, Membresías, Recursos, Tienda) + footer
- API: GET /api/resources?public=true
- Descarga: GET /api/resources/download?key=... (stream desde R2)

### /mentorias (MENTORÍAS — PÁGINA DEDICADA, agregada sesión 21)
- Título: "Mentorías para Lectores de Registros Akáshicos"
- Badge: "MENTORÍAS"
- Info cards: Videollamada 1:1 · 2 horas · Semanal
- Para graduados de Nivel 1 y Nivel 2
- **Precios**: Sesión individual $20.000 ARS / Pack 3+ sesiones $15.000 ARS/sesión
- Acuerdo/condiciones (collapsible) con checkbox de aceptación
- Formulario de inscripción: email, nombre, nacionalidad, ciudad, teléfono, nivel completado, cantidad de encuentros, motivo, disponibilidad horaria, cómo te enteraste, método de pago
- Métodos de pago: MercadoPago, Transferencia bancaria (Brubank), PayPal, Western Union
- Soporte de form pause via /api/settings
- Navbar propio + footer

---

## PÁGINAS DEDICADAS (formulario completo)

### /membresías
- Página dedicada con diseño completo
- 3 tarjetas de membresía con formulario de suscriptor integrado
- API: POST /api/memberships/subscribe → envía email al admin con datos del suscriptor

### /cursos/n1-teorico
- 1er Nivel Solo Teórico — Contribución voluntaria (~12 campos)

### /cursos/n1-practica
- 1er Nivel con Práctica Incluida — $45.000 ARS / US$35 (~25 campos)

### /cursos/n2
- 2do Nivel Completo — $60.000 ARS / US$50 — 10% descuento si ya hizo 1er nivel ($54.000 / US$45) (~28 campos)

### /cursos/ambos
- Ambos Cursos (1er + 2do Nivel) — $85.000 ARS / US$65 (~25 campos)

### /lecturas
- Lectura Akáshica Individual — $20.000 ARS / US$20 (~21 campos)

### /mentorias
- Mentorías para Lectores de Registros Akáshicos
- Sesión individual $20.000 ARS / Pack 3+ sesiones $15.000 ARS/sesión
- Formulario completo con aceptación de condiciones
- Métodos de pago: MercadoPago, Transferencia bancaria, PayPal, Western Union

---

## PRECIOS ACTUALIZADOS

### Membresías (suscripción mensual)
| Membresía | Precio ARS | Precio USD | Frecuencia |
|-----------|-----------|-----------|-----------|
| Raíz de Luz | $5.000 | $5 | 2 envíos mensuales |
| Corazón Solar | $10.000 | $8 | 3 envíos mensuales |
| Puente Estelar | $15.000 | $12 | 4 envíos mensuales (semanal) |

### Cristales
| Producto | Precio ARS | Precio USD |
|----------|-----------|-----------|
| Amatista | $15.000 | $15 |
| Cuarzo Rosa | $12.000 | $12 |
| Cuarzo Claro | $10.000 | $10 |
| Citrino | $13.000 | $13 |
| Turmalina Negra | $11.000 | $11 |
| Selinita | $14.000 | $14 |

### Servicios
| Servicio | Precio ARS | Precio USD |
|----------|-----------|-----------|
| Lectura Akáshica | $20.000 | $20 |
| Mentoría Individual | $20.000 | — |
| Mentoría Pack (3+) | $15.000/sesión | — |
| N1 Solo Teórico | Voluntario | Voluntario |
| N1 con Práctica | $45.000 | $35 |
| N2 Completo | $60.000 | $50 |
| Ambos Cursos | $85.000 | $65 |

---

## FLUJO DE PAGO

### Membresías:
1. En el index, el botón "Suscribirme a [nombre]" redirige a /membresias
2. En /membresías, usuario completa nombre + email
3. POST /api/memberships/subscribe → email al admin
4. Aparecen botones de MercadoPago y PayPal (links directos de suscripción)
5. El usuario elige y es redirigido a la plataforma de pago
6. IMPORTANTE: Las suscripciones usan links directos de suscripción de MP/PayPal (no pasan por API del sitio)

### Cristales:
1. Agregar al carrito → Abrir carrito desde navbar → "Pagar"
2. Dialog de datos de envío (nombre, email, teléfono, dirección, ciudad, provincia, CP, notas)
3. **Solo MercadoPago** (producto físico, se vende solo en Argentina)
4. Se guarda en localStorage (checkoutSession_ID)
5. Redirige a plataforma de pago
6. Página de éxito lee localStorage → llama a /api/payments/confirm-order (type: crystal_order)
7. Se guarda en DB Turso + se envía email al admin + email de confirmación al cliente

### Cursos:
1. Elegir curso → "Inscribirme" → página dedicada con formulario
2. Completar formulario completo
3. Elegir MercadoPago o PayPal.me personal (paypal.me/registrosakashicos9)
4. Se guarda en localStorage (checkoutSession_ID) con type: "course_enrollment"
5. Redirige a plataforma de pago
6. Página de éxito → confirm-order (type: course_enrollment)
7. DB + emails (admin + cliente)

### Lecturas:
1. "Solicitar mi Lectura" → página /lecturas con formulario
2. Completar formulario
3. Elegir pago → mismo flujo localStorage (type: "reading")
4. Success page → confirm-order (type: reading)
5. Se guarda en ReadingBooking + emails

---

## SISTEMA DE EMAILS

### Proveedor de emails:
- **Nodemailer + Gmail SMTP** (reemplazó Resend en sesión 29)
- Cuenta: etersomos@gmail.com
- App Password: qarpqbgcdhlkxksa (almacenada en SMTP_APP_PASSWORD)
- Env vars: SMTP_USER, SMTP_APP_PASSWORD
- Sender: "Eter Somos" <etersomos@gmail.com>
- **Ventaja**: Envía a cualquier email (no limitado como Resend sandbox)

### Tipos de email (7 templates con estética Eter Somos):
1. **sendAdminNotification** — Notificación al admin de nuevo pedido/inscripción/solicitud (5 variantes: crystal, course, mentoria, reading, resource)
2. **sendCustomerConfirmation** — Confirmación al cliente de su pedido/inscripción/solicitud
3. **sendAulaWelcomeEmail** — Credenciales del Aula Virtual para NUEVOS alumnos (solo cuando generatedPassword && isNewStudent)
4. **sendAulaExistingStudentEmail** — Notificación de nueva inscripción para alumnos EXISTENTES (sin credenciales)
5. **sendLecturaReadyEmail** — Notificación al alumno cuando la lectura está lista (status → "entregada")

### Diseño visual de emails (BRAND tokens):
Todos los emails usan el sistema de design tokens `BRAND` que replica la estética del sitio web:
- **Fondos**: bg (#0a0908), card (#161310), cardInner (#1a1714)
- **Texto**: text (#f0ebe5), muted (#8a7e72), mutedDark (#5c5349)
- **Violeta**: violet (#a78bfa), violetDark (#8b5cf6), violetDeep (#7c3aed), violetDeeper (#5b21b6)
- **Bordes**: border (#2a2520), borderLight, borderAccent
- **Fuentes**: Serif (Georgia, Playfair Display) para títulos, Sans (Helvetica, Josefin Sans) para cuerpo
- **CTA**: Botones pill con bg violet-500, box-shadow violet glow
- **Componentes compartidos**: emailShell(), headerBlock(), footerBlock(), ctaButton(), sectionLabel()

### Auto-enrollment (inscripción automática):
- **Archivo**: src/lib/student-auth.ts → `ensureStudentWithEnrollment()`
- **Flujo**: Cuando alguien paga por lectura/curso/mentoria → crea Student + StudentEnrollment automáticamente
- **Alumno nuevo**: Genera password aleatorio, envía `sendAulaWelcomeEmail` con credenciales
- **Alumno existente**: NO regenera password, envía `sendAulaExistingStudentEmail` recordando usar credenciales existentes
- **Deduplicación**: Verifica type + referenceId + title para evitar inscripciones duplicadas
- **referenceId**: Para lecturas, usa `booking.id` para que cada lectura sea una inscripción única
- **Resultado**: `AutoEnrollResult { studentId, isNewStudent, generatedPassword, enrollmentId, isNewEnrollment }`

### Email de lectura lista:
- **Trigger**: Admin cambia status a "entregada" en el panel kanban
- **Archivo**: src/app/api/admin/bookings/[id]/route.ts
- **Flujo**: Busca student por email → envía `sendLecturaReadyEmail` con nombre y título de lectura
- **Contenido**: Notifica que la lectura está disponible en el Aula Virtual + botón CTA "Escuchar mi lectura"

### Puntos de envío:
- `/api/bookings` (POST) → Auto-enroll + sendAulaWelcomeEmail o sendAulaExistingStudentEmail + sendAdminNotification + sendCustomerConfirmation
- `/api/payments/confirm-order` (POST) → Auto-enroll + emails según tipo (crystal/course/mentoria/reading/resource)
- `/api/admin/bookings/[id]` (PUT) → sendLecturaReadyEmail cuando status cambia a "entregada"
- `/api/memberships/subscribe` (POST) → Email simple de notificación al admin

### Archivos:
- src/lib/email.ts - Sistema completo de emails (7 templates con estética Eter Somos, Nodemailer + Gmail SMTP)
- src/lib/student-auth.ts - Auto-enrollment: ensureStudentWithEnrollment(), createStudent(), createEnrollment()
- src/app/api/bookings/route.ts - Lecturas: auto-enroll + emails
- src/app/api/payments/confirm-order/route.ts - Pagos: auto-enroll + emails por tipo
- src/app/api/admin/bookings/[id]/route.ts - Admin: email lectura lista al cambiar status

---

## IMÁGENES Y ASSETS

### Fondos de secciones:
| Archivo | Ubicación | Origen | Dimensiones |
|---------|-----------|--------|------------|
| hero-bg-v2.webp | public/ | Pexels (galaxia, 5441x3661) | 2560x1440 WebP |
| membresias-bg.webp | public/ | Unsplash (nebulosa, 3840x2160) | 2560x1440 WebP |
| crystals-banner.webp | public/ | Dark cosmic (4000x2251), oscurecida | 2560x1440 WebP |
| akashic-bg.png | public/images/ | Fondo lecturas/cursos | — |
| fer-sobre.webp | public/images/ | Foto de Fer (800x1066), brillo -12%, tinte violeta 15% | — |

### Emojis personalizados de membresías:
| Archivo | Membresía | Notas |
|---------|-----------|-------|
| membresia-emoji-1.png | Raíz de Luz | Solo el dibujo, sin texto ni fondo |
| membresia-emoji-2.png | Corazón Solar | Solo el dibujo, sin texto ni fondo |
| membresia-emoji-3.png | Puente Estelar | Solo el dibujo, sin texto ni fondo |

### Logo:
- public/images/logo-etersomos.jpg - Logo circular del hero (con opacity-85)
- public/logo.svg - Favicon del sitio

---

## ARCHIVOS CLAVE

### Páginas
- src/app/page.tsx - Página principal (~2350 líneas, sin Tienda ni Recursos desde sesión 8, sin carrito/checkout desde sesión 34)
- src/app/tienda/page.tsx - Página tienda de cristales (carrito, checkout, filtros)
- src/app/tienda/layout.tsx - Layout de tienda (metadata)
- src/app/recursos/page.tsx - Página recursos gratuitos (newsletter, contribución voluntaria)
- src/app/recursos/layout.tsx - Layout de recursos (metadata)
- src/app/mentorias/page.tsx - Página Mentorías para Lectores de Registros Akáshicos (formulario)
- src/app/mentorias/layout.tsx - Layout de mentorías (metadata)
- src/app/admin/page.tsx - Panel admin completo (~3800 líneas): sidebar nav, dashboard, kanban, form toggles, recursos, alumnos, aula virtual, tabs de filtro inscripciones
- src/app/aula/page.tsx - Aula Virtual dashboard (~1164 líneas): sidebar nav, hero, cursos, lecturas, mentorías, perfil
- src/app/aula/curso/[courseId]/page.tsx - Reproductor de curso (~604 líneas): video/audio/PDF, playlist, navegación
- src/app/aula/login/page.tsx - Login aula virtual (~264 líneas): orbes animados, toggle password
- src/app/aula/registro/page.tsx - Registro de alumnos
src/app/aula/recuperar/page.tsx - Recuperación de contraseña: pedido de enlace por email (S36)
src/app/aula/reset/page.tsx - Reset de contraseña con token (?token=..., S36)
src/app/cursos/gracias/page.tsx - Confirmación post-inscripción de cursos (S36, no indexable)
- src/app/membresias/page.tsx - Página dedicada de membresías con formulario
- src/app/membresias/layout.tsx - Layout de membresías (header volver + footer)
- src/app/payment/success/page.tsx - Página post-pago
- src/app/lecturas/page.tsx - Formulario completo de lectura
- src/app/cursos/page.tsx - Listado 4 cursos en tarjetas glass
- src/app/cursos/layout.tsx - Layout compartido de cursos
- src/app/cursos/n1-teorico/page.tsx - Formulario N1 Teórico
- src/app/cursos/n1-practica/page.tsx - Formulario N1 con Práctica
- src/app/cursos/n2/page.tsx - Formulario N2 Completo
- src/app/cursos/ambos/page.tsx - Formulario Ambos Cursos
- src/app/layout.tsx - Layout raíz con fuentes Playfair + Josefin + SiteContentProvider

### APIs - Auth
- src/app/api/auth/login/route.ts - POST login admin (valida password, devuelve Bearer token)

### APIs - Públicas
- src/app/api/payments/create-paypal/route.ts - Crear orden PayPal
- src/app/api/payments/create-mercadopago/route.ts - Crear preferencia MP
- src/app/api/payments/capture-paypal/route.ts - Capturar pago PayPal
- src/app/api/payments/confirm-order/route.ts - Confirmar orden (DB + emails)
- src/app/api/memberships/subscribe/route.ts - Registro de suscriptor + email
- src/app/api/bookings/route.ts - GET/POST reservas de lecturas
- src/app/api/settings/route.ts - GET/PUT settings (DB Turso, form toggles)
- src/app/api/newsletter/subscribe/route.ts - POST suscribir newsletter (DB + email admin)

### APIs - Recursos (Cloudflare R2)
- src/app/api/resources/route.ts - GET (listar), POST (crear metadata), PUT (actualizar), DELETE (eliminar + R2)
- src/app/api/resources/presign/route.ts - POST generar presigned URL para upload directo a R2
- src/app/api/resources/download/route.ts - GET stream archivo desde R2
- src/app/api/resources/public/route.ts - GET recursos públicos (active=1)
- src/app/api/resources/delete/route.ts - DELETE eliminar archivo de R2
- src/app/api/resources/migrate/route.ts - POST migración de schema Resource

### APIs - Admin Panel
- src/app/api/admin/stats/route.ts - GET estadísticas del dashboard
- src/app/api/admin/bookings/[id]/route.ts - PUT (cambiar estado/fecha) + DELETE (eliminar lectura)
- src/app/api/admin/orders/route.ts - GET listar pedidos (cristales + cursos)
- src/app/api/admin/orders/[id]/route.ts - PUT (cambiar estado) + DELETE (eliminar pedido)
- src/app/api/admin/memberships/route.ts - GET listar membresías
- src/app/api/admin/memberships/[id]/route.ts - PUT (cambiar estado) + DELETE (eliminar membresía)
- src/app/api/admin/subscribers/route.ts - GET listar suscriptores newsletter + DELETE
- src/app/api/admin/subscribers/[id]/route.ts - DELETE eliminar suscriptor
- src/app/api/admin/contacts/route.ts - GET exportar contactos (CSV, por sección o todos)
- src/app/api/admin/students/route.ts - GET/POST alumnos (listar, crear)
- src/app/api/admin/students/[id]/route.ts - GET/DELETE alumno
- src/app/api/admin/students/[id]/enrollments/route.ts - POST asignar inscripción
- src/app/api/admin/lectura-upload/route.ts - POST subir audio de lectura (direct S3 upload)
- src/app/api/admin/enrollments/[id]/upload-audio/route.ts - POST/PUT/DELETE audio de inscripción
- src/app/api/admin/enrollments/[id]/attachments/route.ts - GET/POST/DELETE archivos adjuntos de inscripción (PDF, imágenes, Word, TXT)
- src/app/api/admin/cleanup-lecturas/route.ts - POST limpiar lecturas expiradas
- src/app/api/admin/course-content/route.ts - GET/POST/PUT/DELETE contenido de cursos
- src/app/api/admin/course-content/presign/route.ts - POST presigned URL para upload curso

### APIs - Aula Virtual (Student)
- src/app/api/student/auth/login/route.ts - POST login alumno (JWT + httpOnly cookie)
- src/app/api/student/auth/register/route.ts - POST registro alumno
- src/app/api/student/auth/me/route.ts - GET perfil alumno
- src/app/api/student/auth/logout/route.ts - POST logout alumno
src/app/api/student/auth/forgot-password/route.ts - POST solicitud de reset de contraseña (S36, pública, respuesta genérica)
src/app/api/student/auth/reset-password/route.ts - POST reset efectivo con token (S36, pública)
- src/app/api/student/enrollments/route.ts - GET inscripciones del alumno
- src/app/api/student/course-content/route.ts - GET contenido de curso (verifica inscripción)
- src/app/api/student/stream/route.ts - GET streaming protegido (cursos/ y lecturas/)
- src/app/api/student/download-lectura/route.ts - GET descarga de lectura (verifica expiración)

### Librerías
- src/lib/db.ts - Proxy Prisma→Turso, createSettingsProxy, ensureSchema
- src/lib/r2.ts - Cloudflare R2: upload, download, delete, presigned URLs (recursos/, cursos/, lecturas/ prefixes)
- src/lib/student-auth.ts - Auth de alumnos: JWT, httpOnly cookies, enrollment management
- src/lib/pricing.ts - Precios centralizados
- src/lib/email.ts - Sistema de emails (admin + cliente) para cristales/cursos/lecturas
- src/lib/course-payment.ts - Función de pago para cursos/lecturas (usa PayPal.me)
- src/lib/paypal.ts - Funciones PayPal REST API (mantenido por compatibilidad, no se usa activamente)
- src/lib/mercadopago.ts - Funciones MercadoPago
- src/lib/notifications.ts - Notificaciones
- src/lib/cms-defaults.ts - Valores por defecto del CMS (34+ campos en 16 secciones)
- src/lib/cms-helpers.ts - Funciones helper para CMS (fetchCmsContent, cmsValue, cmsJson, cmsNumber)
- src/lib/resource-payment.ts - Funciones de pago para recursos
- src/middleware.ts - Middleware de seguridad (auth Bearer + security headers)

### Componentes
- src/components/form-paused-banner.tsx - Banner reutilizable para formularios pausados
- src/components/protected-player.tsx - Reproductor de video/audio protegido contra descarga (ProtectedVideoPlayer + ProtectedAudioPlayer)
- src/components/ui/* - Componentes shadcn/ui (tabs, card, badge, button, input, etc.)

### Hooks
- src/hooks/use-site-content.ts - Hook React para CMS (SiteContentProvider, getValue, getJson, auto-refresh cross-tab/focus/visibility)
- src/hooks/use-toast.ts - Hook de toasts
- src/hooks/use-mobile.ts - Hook para detección mobile

### Configuración
- prisma/schema.prisma - Schema Prisma (ReadingBooking, Membership, CrystalOrder) — NO tiene Settings model
- src/app/globals.css - Variables CSS de colores + animaciones custom
- next.config.ts - Turbopack root + CORS headers
- tailwind.config.ts - Configuración Tailwind
- package.json - Dependencias
- .env.local - Variables de entorno con credenciales reales (NO se commitea)
- .env.example - **NO EXISTE ACTUALMENTE** — debe ser creado con placeholders
- .gitignore - Incluye .env.local
- .vercel/project.json - Config link a Vercel
- components.json - Configuración shadcn/ui

### Scripts
- scripts/restore-vercel-env.sh - **NO EXISTE ACTUALMENTE** — usar restauración manual (ver PASO 2 del Checklist)

---

## CAMBIOS REALIZADOS - HISTORIAL COMPLETO POR SESIÓN

### SESIÓN 1 (23/04/2026 — Estética + Membresías)
1. Logo del hero con opacidad al 85% (opacity-85)
2. Corregido "EterSomos" → "Eter Somos" en toda la página (3 lugares)
3. Formulario de suscriptor agregado en cada tarjeta de /membresías
4. API /api/memberships/subscribe creada (registra suscriptor + email al admin)
5. Flujo membresías: formulario → validación → email al admin → botones de pago
6. Index → /membresías: botones redirigen a página dedicada (no pago directo)
7. Fondo de /membresías: membresias-bg.webp con overlay 80%
8. Botones de pago: misma estética mystic (bg-foreground y variant outline)
9. Separación entre botones: space-y-5 + display:block en links
10. Emojis personalizados: mismos PNG que el index en /membresías
11. Badge de frecuencia centrado con flex justify-center
12. Pasos "Cómo suscribirte": orden corregido
13. Limpieza de historial git: eliminado .env con credenciales reales
14. git-filter-repo: reemplazadas todas las keys expuestas (Resend, PayPal, MP, Vercel, GitHub)
15. Force push: historial reescrito sin secrets
16. Repositorio cambiado a privado

### SESIÓN 2 (24/04/2026 — Infraestructura)
1. URLs BASE_URL corregidas a etersomos-iota.vercel.app en 4 archivos
2. Variables de entorno Vercel recreadas (se habían borrado solas entre sesiones)
3. Deploy de producción forzado (variables nuevas requieren redeploy)
4. Script de restauración creado: scripts/restore-vercel-env.sh
5. Checklist de inicio de sesión agregado a PROJECT_SPEC.md
6. Limpieza de archivos: permisos + uploads obsoletos

### SESIÓN 3 (23/04/2026 — Admin Panel Dashboard inicial)
1. Página /admin creada: Dashboard con stats, tablas de datos
2. Stats cards: Total lecturas, cristales, cursos, membresías, ingresos totales
3. Métodos de pago: Breakdown por MercadoPago/PayPal
4. Tabla de lecturas con búsqueda y filtros
5. API /api/admin/stats: Estadísticas agregadas
6. API /api/admin/orders: Listado pedidos (cristales + cursos separados)
7. API /api/admin/memberships: Listado con GET + PUT
8. API /api/admin/bookings/[id]: Actualizar estado y fecha de entrega
9. Campo deliveryDate agregado a ReadingBooking
10. ensureSchema(): Auto-migración de columnas nuevas en Turso

### SESIÓN 4 (23/04/2026 — Admin Panel Kanban)
1. Lecturas: Kanban 3 columnas con drag & drop
2. Cristales: Kanban 3 columnas con drag & drop
3. Cursos: Kanban 3 columnas con drag & drop
4. Membresías: Kanban 3 columnas con drag & drop
5. Normalización de estados: "pagado" → columna correcta según tipo
6. Fechas en lecturas: fecha de entrada + fecha límite + badge "VENCIDA"
7. Botón eliminar en TODAS las secciones con confirmación de doble click
8. APIs DELETE nuevas: bookings/[id], orders/[id], memberships/[id]
9. Botón "Descargar Mails" en cada sección + "Exportar Todo" en header
10. API /api/admin/contacts: ?type=bookings|crystals|courses|memberships|all

### SESIÓN 5 (24/04/2026 — PayPal Cleanup)
1. Reemplazado PayPal REST API por PayPal.me personal en toda la app
2. src/lib/course-payment.ts: Nueva función openPayPalMe() → paypal.me/registrosakashicos9
3. Cursos (n1-practica, n2, ambos): Usan PayPal.me link
4. Lecturas: Usan PayPal.me link
5. src/lib/paypal.ts: Mantenido por compatibilidad pero ya no se usa activamente
6. Decisión del usuario: No quiere PayPal Business, prefiere PayPal.me personal

### SESIÓN 6 (24/04/2026 — Limpieza de código + Backups)
1. Eliminado endpoint temporal /api/admin/memberships/repair
2. Eliminado placeholder /api/route.ts ("Hello World")
3. Optimizado /api/memberships/subscribe (eliminado ensureSchema duplicado)
4. Eliminado botón PayPal de cristales (producto físico, solo MercadoPago en Argentina)
5. Eliminada función handlePayWithPayPal de page.tsx (-42 líneas)
6. Backup GitHub: repo sincronizado
7. Backup Turso DB: Dump SQL completo (4 tablas, 2 registros)
8. Backup .env.local: variables de entorno con credenciales
9. Backup comprimido: .tar.gz con código + dump DB + env vars

### SESIÓN 7 (12-13/05/2026 — Form toggles + Admin fixes)
1. Panel admin completo reconstruido en /admin (~1630 líneas)
2. Sistema de pausa/reactivación de formularios:
   - API /api/settings migrada de filesystem a DB Turso
   - createSettingsProxy() en db.ts para key/value
   - Componente FormPausedBanner en 5 formularios + membresías
   - Tab "Formularios" con toggles individuales + pausar/activar todos
3. Fix: admin panel roto (dead JSX fuera del componente)
4. Fix: triple-click en logo ahora redirige a /admin (antes abría mini-admin inline)
5. Vercel project config corregido
6. Deploy a etersomos-iota.vercel.app
7. Home page rediseñada: 11 secciones, paleta violeta, tarjetas glass
8. UX audit: 19 correcciones aplicadas (WhatsApp flotante, footer, FAQ, etc.)
9. Git email corregido permanentemente a gpaulero@gmail.com

### SESIÓN 8 (13/05/2026 — Tienda + Recursos + Newsletter + CMS)
1. Secciones "Tienda de Cristales" y "Recursos Gratuitos" eliminadas de la página principal
2. Creada página /tienda con tienda de cristales completa (carrito, checkout, filtros por categoría)
3. Creada página /recursos con formulario de newsletter y diseño mystic
4. Creados layouts: src/app/tienda/layout.tsx y src/app/recursos/layout.tsx
5. Navbar actualizado: Recursos → /recursos (antes #recursos), Tienda → /tienda (antes #cristales)
6. Email de contacto cambiado: hola@etersomos.com → etersomos@gmail.com en page.tsx, tienda y recursos
7. Deploy a etersomos-iota.vercel.app
8. Investigación de pasarelas de pagos para LatAm (Mercado Pago, dLocal, Stripe, PayU, Wompi, etc.)
9. Nota: dLocal rechazó la temática espiritual hace años; Mercado Pago SÍ acepta contenido espiritual
10. Newsletter de /recursos conectado a backend real:
    - Tabla NewsletterSubscriber en DB Turso (id, email UNIQUE, subscribedAt)
    - API POST /api/newsletter/subscribe — guarda en DB + envía email al admin (Resend)
    - Manejo de emails duplicados (409 + mensaje amigable)
11. Admin: nueva pestaña "Suscriptores" con listado, eliminación individual, exportar CSV
    - API GET/DELETE /api/admin/subscribers y /api/admin/subscribers/[id]
12. **CMS Nivel 1 implementado — Editor de contenido del sitio:**
    - Tabla SiteContent en DB Turso (key, value, section, label, type, updatedAt)
    - 34 campos editables en 7 secciones: Site, Cristales, Cursos, Lecturas, Membresías, Testimonios, Home
    - Seed automático con valores actuales del sitio
    - Pestaña "Contenido" en admin con accordion por sección
    - Inputs según tipo (text, number, url, textarea, json, boolean)
    - Guardar por sección o todo junto, dirty state tracking, reset a defaults
    - APIs: GET/PUT /api/cms/content, PUT /api/cms/content/bulk, POST /api/cms/content/seed
    - Hook useSiteContent() + SiteContentProvider en layout raíz
    - Las páginas leen del CMS con fallback a valores hardcodeados
    - Archivos: src/lib/cms-defaults.ts, src/lib/cms-helpers.ts, src/hooks/use-site-content.ts

### SESIÓN 9 (14/05/2026 — Seguridad: Middleware + Auth)
1. **Middleware de seguridad implementado (src/middleware.ts):**
   - Protección de APIs admin, CMS, bookings y settings con Bearer token
   - Security headers en todas las rutas (X-Content-Type-Options, X-Frame-Options, etc.)
   - Cache-Control: no-store en todas las rutas API
   - Rutas públicas: /api/auth/*, /api/newsletter/*, /api/payments/*, /api/memberships/*
2. **Endpoint de login creado (src/app/api/auth/login/route.ts):**
   - POST /api/auth/login — valida contraseña y devuelve token ADMIN_API_SECRET
   - La contraseña ya no se expone en el código cliente
3. **Admin panel actualizado (src/app/admin/page.tsx):**
   - Eliminada constante ADMIN_PASSWORD del cliente
   - authFetch() wrapper con Authorization header para todas las requests protegidas
   - Login async via /api/auth/login con estado de loading
   - sessionStorage clave cambiada: "admin_auth" → "admin_token"
   - ExportButton actualizado con fetchFn prop para auth en descargas CSV
   - KanbanColumn recibe fetchFn prop
4. **Env vars en Vercel creadas:**
   - ADMIN_API_SECRET (encrypted)
   - ADMIN_PASSWORD (encrypted)
5. **Deploy a producción:** commit 37ed091, deploy dpl_6hQ24vKehdeUd3DWJ3GTC2rLXsp6
6. **Verificación de seguridad exitosa:**
   - / → 200 ✅
   - /api/admin/stats → 401 ✅
   - /api/bookings → 401 ✅
   - /api/cms/content → 401 ✅
7. **Archivos clave de seguridad:**
   - src/middleware.ts — middleware principal
   - src/app/api/auth/login/route.ts — endpoint login
   - src/app/admin/page.tsx — admin panel con auth

### SESIÓN 10 (14/05/2026 — Foto de Fer + Fix Tienda)
1. Agregada foto de Fer a sección "Sobre Fer" (public/images/fer-sobre.webp, 800x1066)
2. Foto adaptada con PIL: brillo -12%, tinte violeta 15%, viñeta 25%, contraste +10%
3. Fix texto tienda desactivada: FormPausedBanner ahora soporta prop customTitle
4. Tienda envía customTitle="Tienda en construcción" y customMessage fijo
5. Deploy producción con target: "production"
6. Commits: 10d5f62 (foto original), 0dae3c2 (ajuste brillo), 0fcfe5f (fix tienda)
7. Backup: etersomos-src-backup-20260514.tar.gz (3.2MB, sin node_modules ni .git)

### SESIÓN 11 (15/05/2026 — Font System Audit + Typography)
1. Auditoría completa del sistema de fuentes en toda la app
2. Fixed bugs de variables de font en múltiples archivos
3. Establecidas reglas tipográficas: Playfair Display (títulos/serif), Josefin Sans (cuerpo/sans)
4. Consistencia de fonts verificada en layout.tsx, globals.css y componentes

### SESIÓN 12 (15/05/2026 — Navbar + Hero Adjustments)
1. Navbar: Logo simplificado — removida imagen circular, mantenido solo texto "Eter Somos"
2. Hero: Logo reducido de 208px a 192px, padding agregado
3. Backup: session15

### SESIÓN 13 (15/05/2026 — Fer Cardozo + CMS Persistence)
1. "Fer" → "Fer Cardozo" en guide-section y cms-defaults (guideName default)
2. **CMS: Cambios no persistían después de F5** — Múltiples intentos de fix:
   - Intento 1: UPSERT + cache-busting headers → no funcionó
   - Intento 2: Rewritten bulk update sin raw SQL + /api/cms/debug endpoint → no funcionó
   - Intento 3 (EXITOSO): `force-dynamic` + `revalidate = 0` en GET /api/cms/content + headers no-cache → **los saves ahora persisten**
3. Nuevo endpoint: GET /api/cms/debug (diagnóstico de contenido DB)
4. src/lib/cms-helpers.ts: `force-dynamic` + `revalidate = 0` + Cache-Control no-store en GET handler
5. seed call removido del fetch público (causaba delay de 10s)
6. Backup: session16
7. PROJECT_SPEC actualizado con cambios de sesión 16

### SESIÓN 14 (15/05/2026 — Hero Animation Fix + CMS Flash)
1. **Hero animation overlay fix:** Estrellas twinkle se interponían sobre los botones
   - Stars container: z-0, opacity reducida a 30 (de 40)
   - Contenido del hero: z-10
2. **CMS flash de contenido viejo al hacer F5** — Problema reportado por usuario:
   - Al editar "años de experiencia" a 10 en admin, al F5 se veía "5" por un segundo
   - Intento con localStorage cache → peor, 10s de delay
   - Intento con cmsReady conditional → no funcionó
   - Intento con Server Component (page.tsx → async, home-content.tsx → client) → pendiente de verificación en producción

### SESIÓN 15-16 (16/05/2026 — CMS Flash Fix continued)
1. Conversión de page.tsx a Server Component que obtiene datos CMS antes de renderizar
2. Creación de home-content.tsx como Client Component que recibe cmsData como props
3. Eliminación de fetch del lado del cliente en la página principal
4. Objetivo: Eliminar flash de valores viejos al hacer F5

### SESIÓN 17 (16/05/2026 — Backup + PROJECT_SPEC update)
1. Backup creado: etersomos-backup-session17.tar.gz (3.2MB)
2. PROJECT_SPEC.md actualizado con sesiones 10-17
3. Nota: Los cambios de Server Component (sesión 15-16) pueden necesitar ser re-aplicados al código restaurado desde backup

### SESIÓN 18 (17/05/2026 — Recuperación + Recursos/R2 + CORS fix)
1. **GitHub PAT expirado** — reemplazado por nuevo token: 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
2. **Vercel Token expirado** — reemplazado por nuevo token: vcp_52GvKUqT6kZxgfW8ymTCysvu0X1R7F4JfdRwjWBAqm5mFtvn3x1lHd1F
3. **Repo clonado y restaurado** desde GitHub (gpaulero/etersomos)
4. **Variables de entorno Vercel restauradas** — 16 variables (antes 0), incluyendo R2, DB, PayPal, MP, Resend
5. **3 proyectos Vercel duplicados eliminados:**
   - etersomos-v2 (prj_uvhmQF7GoiZlgWHqsJUpzz8sv9lO) → eliminado
   - etersomos-fix (prj_FnwQtcBGuKjWeQ9Bq4RBTMjB2JtF) → eliminado
   - my-project (prj_CvpXH0m5oIznssMK5wsDYYYd4nqg) → eliminado (creado por accidente)
   - Solo queda: etersomos (prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY)
6. **rootDirectory corregido** — proyecto etersomos tenía rootDirectory="etersomos" (carpeta inexistente) → cambiado a null (raíz del repo). Esto causaba que todos los deployments fallaran.
7. **.vercel/project.json corregido** — apuntaba a proyecto my-project equivocado → corregido a etersomos
8. **Deploy de producción exitoso** — etersomos-iota.vercel.app funciona correctamente
9. **CORS configurado en Cloudflare R2:**
   - Problema: El bucket R2 no tenía CORS → el navegador bloqueaba uploads con error 403 "CORS not configured"
   - Solución: Configurado CORS via PutBucketCorsCommand (S3 SDK) con AllowedOrigins: *, AllowedMethods: GET/PUT/POST/DELETE
   - Verificado: preflight OPTIONS devuelve 204 con headers CORS correctos
10. **Sistema de Recursos completamente funcional:**
    - API: GET/POST/PUT/DELETE /api/resources
    - Presigned URLs: POST /api/resources/presign
    - Download: GET /api/resources/download?key=...
    - Tabla Resource en DB Turso: id, title, description, category, fileType, r2Key, fileName, fileSize, price/priceArs/priceUsd, active, sortOrder
    - Admin: Tab "Recursos" con upload de archivos, lista, activar/desactivar, eliminar
    - Público: /recursos muestra grid de recursos activos
    - Almacenamiento: Cloudflare R2 (bucket: etersomos-recursos, prefix: recursos/)
    - Librería: src/lib/r2.ts (S3Client, presigned URLs, upload, delete, getStream)
11. **CMS content changes not reflecting on main page — FIX COMPLETO:**
    - **Problema raíz:** El middleware protegía `/api/cms/*` con TODOS los métodos (incluido GET), lo que impedía que la página principal leyera el contenido CMS editado. La home siempre caía a los defaults hardcodeados.
    - **Fix 1 — Middleware refactorizado:** `/api/cms/content` GET ahora es público; solo PUT/POST (escritura) requieren auth. PROTECTED_ROUTES ya no incluye `/api/cms` directamente.
    - **Fix 2 — revalidatePath() agregado:** Los endpoints PUT /api/cms/content y PUT /api/cms/content/bulk ahora llaman `revalidatePath('/')` y otras rutas después de guardar, invalidando la cache de Next.js/Vercel.
    - **Fix 3 — SiteContentProvider montado en layout:** `src/app/layout.tsx` ahora envuelve children con `<SiteContentProvider>`, que antes estaba definido pero nunca montado (era dead code).
    - **Fix 4 — Cache-busting en fetch:** `src/lib/cms-helpers.ts` y `src/hooks/use-site-content.ts` ahora agregan `?t=${Date.now()}` y headers `Cache-Control: no-cache` + `cache: 'no-store'` para evitar cache del navegador/CDN.
    - **Fix 5 — Anti-cache headers en GET:** `src/app/api/cms/content/route.ts` tiene `export const dynamic = 'force-dynamic'` y headers explícitos `Cache-Control: no-store`, `Pragma: no-cache`, `Expires: 0`.
    - **Fix 6 — Seed removido de fetch público:** `fetchCmsContent()` ya no llama `/api/cms/content/seed` antes de cada fetch (era overhead innecesario en cada carga de página pública).
12. **Backup v2 (post-R2 CORS + CMS fix):**
    - /download/backup-etersomos-20260517-v2/ (9.5MB source + 36KB DB + env + git history)
11. **Backups creados:**
    - /download/backup-etersomos-20260517/ (primera sesión)
    - /download/backup-etersomos-20260517-s2/ (segunda sesión)
    - Incluyen: source tar.gz, DB dump SQL, env vars, git history

---

## BACKUPS

### Backup más reciente (11/06/2026):
- **Full file backup (98 archivos)**: /home/z/my-project/etersomos/etersomos-backup-files/backup-20260611/ (1.3MB)
  - Incluye: todas las páginas, APIs, librerías, hooks, componentes, config files, prisma schema, PROJECT_SPEC.md
- **GitHub**: https://github.com/gpaulero/etersomos (repo privado, main branch, commit 1043243)
- **Git tag**: v2026-06-10-session27

### Backups anteriores:
- **03/06/2026**: /home/z/my-project/download/backup-etersomos-20260603/ (3.3MB)
- **29/05/2026**: /home/z/my-project/download/backup-etersomos-20260529/
- **17/05/2026 (session18-s2)**: /home/z/my-project/download/backup-etersomos-20260517-s2/
- **17/05/2026 (session18-s1)**: /home/z/my-project/download/backup-etersomos-20260517/
- **17/05/2026 (session17)**: /home/z/my-project/download/etersomos-backup-session17.tar.gz

### Crear nuevo backup manual:
```bash
# 1. Dump de DB (via Python REST API — turso CLI no disponible sin auth)

# 2. Backup de env vars
cp /home/z/my-project/.env.local /home/z/my-project/download/env.local.backup

# 3. Backup completo del código fuente
cd /home/z/my-project && tar czf "download/etersomos-backup-$(date +%Y%m%d-%H%M%S).tar.gz" \
  --exclude='node_modules' --exclude='.next' --exclude='.git/objects' \
  --exclude='backups' --exclude='etersomos' --exclude='etersomos-backup-20260423-164958' \
  src/ prisma/ public/ data/ .env* .vercel/ package.json package-lock.json next.config.ts tailwind.config.ts tsconfig.json postcss.config.mjs components.json

# 4. Sync con GitHub
cd /home/z/my-project && git add -A && git -c user.name="gpaulero" -c user.email="gpaulero@gmail.com" commit -m "backup" && git push origin main
```

### Estrategia de recuperación:
1. **Restaurar código**: Descomprimir backup → git init → push a GitHub → Vercel lo detecta y deploya
2. **Restaurar DB**: Turso tiene replicación automática (no se pierde). Si se pierde: recrear tablas con el dump SQL
3. **Restaurar env vars**: Usar script `scripts/restore-vercel-env.sh` o API de Vercel
4. **Redeploy**: Forzar deploy via API de Vercel con gitSource y repoId: 1217270869

---

## PENDIENTES / FUTUROS
1. Configurar dominio custom en Resend para emails a cualquier destinatario
2. ~~PayPal Live~~: NO requerido — se usa PayPal.me personal (paypal.me/registrosakashicos9)
3. ~~Optimizar SEO (meta descriptions, alt text en imágenes, Google Search Console)~~ — HECHO (sesión 31)
4. Posible blog/contenidos adicionales (mayor impacto en SEO orgánico)
5. Auth robusta para admin panel (actualmente solo sessionStorage + password hardcodeada)
6. ~~Dominio custom para el sitio (etersomos.com u otro)~~ — HECHO (sesión 31: www.etersomos.com)
7. Notificaciones WhatsApp mejoradas (CallMeBot/Meta API)
8. ~~Google Business Profile (gratuito, ayuda al SEO local)~~ — PENDIENTE REGISTRO (sesión 31: JSON-LD listo, falta crear cuenta)
9. ~~Configurar Cloudflare R2 para storage de archivos~~ — HECHO (sesión 18)
10. Página de política de privacidad y términos
11. Testimonios reales (reemplazar placeholders actuales)
12. Ajuste de precios a rango de mercado
13. ~~Google Analytics / Search Console~~ — Search Console VERIFICADO (sesión 32: propiedad sin-www verificada, sitemap enviado, indexación solicitada para /, /lecturas, /cursos). GA4 PENDIENTE CREAR CUENTA.
14. ~~Construir página /recursos~~ — HECHO (sesión 18)
15. Obtener token de Vercel con acceso al proyecto original (etersomos-gpauleros-projects.vercel.app) si se necesita
16. ~~Verificar que todos los cambios del CMS persisten correctamente en producción~~ — PARCIALMENTE RESUELTO (sesión 24-25)
17. **Crear `.env.example`** con placeholders para las 16 variables obligatorias
18. **Crear `scripts/restore-vercel-env.sh`** para restaurar variables Vercel automáticamente
19. **Corregir handleOpenAdmin()** en page.tsx para usar validación server-side en vez de client-side
20. **Agregar toggle "mentorias"** a formLabels en index y admin (soporte de form pause)
21. **Limpiar archivos innecesarios del repo**: `etersomos-backup-files/`, `skills/`, `upload/PROJECT_SPEC.md`, `Caddyfile`, `worklog.md`
22. ~~Agregar navbar propio a /mentorias~~ — HECHO (sesión 31: layout con navbar + BreadcrumbJsonLd + MentoriaJsonLd)

---

## NOTAS IMPORTANTES
- Cristales se pagan SOLO con MercadoPago (producto físico, solo Argentina). No hay botón de PayPal.
- Membresías usan links directos de suscripción de MP y PayPal (no pasan por API propia).
- Cursos y lecturas pueden pagarse con MercadoPago o PayPal.me personal (paypal.me/registrosakashicos9).
- Mentorías se pagan con MercadoPago, Transferencia bancaria (Brubank), PayPal o Western Union.
- El admin panel se accede en `/admin` con contraseña `eter2024admin` (o triple-click en logo del Eter).
- Los formularios de cursos y lecturas guardan en localStorage antes del pago.
- Después del pago, se guarda en DB y se envían emails.
- data/settings.json fue ELIMINADO (sesión 25) — todo se guarda en DB Turso (tabla Settings con key/value).
- **CMS IMPORTANTE**: Los cambios en código (defaults) se ven un segundo y luego se revierten si la DB tiene valores viejos. Para cambios persistentes: actualizar BOTH cms-defaults.ts AND la DB via API bulk (PUT /api/cms/content/bulk).
- El sitio usa fuentes: Playfair Display + Josefin Sans
- Tema oscuro mystic con acentos dorados (gold-400) y violetas (violet-400)
- El nombre correcto es "Eter Somos" (con espacio), NO "EterSomos"
- Siempre que se necesite forzar deploy: usar API de Vercel POST /v13/deployments con gitSource y repoId: 1217270869
- Los fondos usan fotos REALES de alta resolución (Pexels/Unsplash), NO imágenes generadas por IA
- La DB usa un Proxy JavaScript que imita PrismaClient sobre libSQL en producción (ver src/lib/db.ts)
- Los estados de órdenes se normalizan al cargar: "pagado" → "pendiente"/"inscrito" según el tipo
- El drag & drop del Kanban usa HTML5 Drag API nativo (sin librerías externas)
- Los CSV de contactos se deduplican por email y exportan la entrada más reciente
- Recursos usan modelo de contribución voluntaria: todos gratuitos, con links opcionales de MP/PayPal
- ProtectedPlayer protege video/audio contra descarga (Blob URL, controlsList="nodownload", etc.)
- SiteContentProvider en layout.tsx provee CMS a toda la app con auto-refresh cross-tab/focus/visibility
- Commit actual: b4867eb (sesión 41)

### SESIÓN 19 (17/05/2026 — Revisión completa del sistema + Fix CMS revalidation)

**Revisión exhaustiva de todos los sistemas del sitio:**

1. **CMS Content Edit Bug — FIX APLICADO:**
   - Problema: Las ediciones del admin no se reflejaban en la página principal
   - Causa: La página es "use client" y el SiteContentProvider solo hacía fetch on mount
   - Solución implementada en src/hooks/use-site-content.ts:
     - Agregado refetch automático al volver a la pestaña (visibilitychange)
     - Agregado refetch al ganar foco de ventana (focus event)
     - Agregado listener de localStorage para notificación cross-tab (cms_updated_at)
     - Debounce de 2-3 segundos para evitar requests excesivos
   - Admin actualizado (src/app/admin/page.tsx):
     - Después de guardar CMS (saveCmsSection/saveCmsAll), escribe localStorage.setItem('cms_updated_at', Date.now())
     - Esto dispara el storage event en otras pestañas para que refresquen
   - Commit: 042f89b — "fix: CMS content auto-refresh on tab focus and cross-tab notification"

2. **Emails — Verificación completa:**
   - Resend API funcional: test directo a etersomos@gmail.com exitoso (ID: 55f7c344-ce4c-4fb4-99c3-afeb8b690090)
   - Los emails de notificación al admin funcionan correctamente para:
     - Lecturas (booking) → sendAdminNotification + sendWhatsAppNotification
     - Cristales (order) → sendAdminNotification
     - Cursos (enrollment) → sendAdminNotification
     - Newsletter → email directo via Resend
     - Membresías → email directo via Resend
   - IMPORTANTE: onboarding@resend.dev (sandbox) solo envía al email de la cuenta Resend
   - Los emails de confirmación al CLIENTE fallarán hasta configurar dominio custom en Resend
   - El usuario confirmó que solo necesita notificaciones para sí mismo, no para clientes

3. **Base de datos (Turso) — Verificada:**
   - Conexión: Funcional
   - Tablas: 8 tablas operativas
   - Datos actuales: 1 booking, 0 orders, 2 memberships, 4 subscribers (limpiado 1 test)
   - SiteContent: 16 secciones con 126+ keys CMS

4. **Páginas — Todas funcionando:**
   - / → HTTP 200
   - /lecturas → HTTP 200
   - /cursos → HTTP 200
   - /membresias → HTTP 200
   - /recursos → HTTP 200
   - /tienda → HTTP 200
   - /admin → HTTP 200

5. **Admin Panel — Verificado:**
   - Login funciona correctamente (POST /api/auth/login)
   - Stats, bookings, orders, memberships, subscribers, CMS, resources, formularios — todos operativos
   - CMS bulk update funciona y persiste en la DB
   - revalidatePath() ya estaba implementado en el bulk route

6. **Limpieza:**
   - Eliminado subscriber de test (test-dry-run@example.com) creado durante la verificación
   - No se eliminaron otros datos de test (test-apitest, test@test) — decisión del usuario

7. **Deploy:**
   - Commit: 042f89b → deploy automático via Vercel → READY
   - Sitio en producción: https://etersomos-iota.vercel.app

### SESIÓN 20 (17/05/2026 — Video protection + System review)
1. **Protección de video/audio contra descarga:**
   - Creado componente `src/components/protected-player.tsx` con ProtectedVideoPlayer y ProtectedAudioPlayer
   - Medidas anti-descarga implementadas:
     - Blob URL (URL.createObjectURL) — la URL del video nunca está en el HTML
     - controlsList="nodownload" — elimina botón de descarga del reproductor nativo
     - disablePictureInPicture — previene extracción vía PiP
     - onContextMenu bloqueado — no "Guardar video como..."
     - CSS ::-webkit-media-controls-download-button display:none
   - Modal de video con Dialog (shadcn/ui) para reproducción en pantalla completa
   - Audio player inline (se despliega al hacer click en "Reproducir")
   - Botón "Reproducir" (violeta) para video/audio/meditación en lugar de "Descargar ahora"
   - Botón "Descargar ahora" se mantiene solo para documentos, imágenes y guías
2. **Protección del endpoint de descarga (/api/resources/download):**
   - Archivos de video/audio (.mp4, .webm, .mov, .avi, .mkv, .mp3, .wav, .ogg, .m4a, .flac, .aac) requieren header `X-Stream-Request: true` o auth admin
   - Respuesta 403 para acceso directo a archivos multimedia desde navegador
   - El reproductor protegido envía el header `X-Stream-Request: true` al hacer fetch
   - El admin puede descargar cualquier archivo vía authFetch (Bearer token)
   - Cache-Control: no-store para archivos multimedia (previene cacheo del navegador)
3. **Admin: descarga de recursos actualizada:**
   - Cambiado de `<a href>` directo a `authFetch` + blob download
   - Esto permite que el admin descargue archivos multimedia que están protegidos
4. **Revisión completa del sistema:**
   - Emails admin: ✅ Todos los flujos envían notificación al admin (Resend configurado)
     - Lecturas: sendAdminNotification + WhatsApp
     - Cristales: sendAdminNotification
     - Cursos: sendAdminNotification
     - Newsletter: email directo con Resend
     - Membresías: email directo con Resend
   - Base de datos Turso: ✅ Conectada y funcionando
   - CMS revalidation: ✅ El código está correctamente implementado (SiteContentProvider + CMS_UPDATED_EVENT + localStorage)
   - Vercel env vars: ✅ 16 variables configuradas
   - Admin panel: ✅ 8 tabs funcionando
5. **Deploy a producción:** etersomos-iota.vercel.app
6. **Nuevos archivos:**
   - src/components/protected-player.tsx — Reproductor de video/audio protegido contra descarga
7. **Archivos modificados:**
   - src/app/recursos/page.tsx — Reproductor embebido, botón Reproducir para video/audio
   - src/app/api/resources/download/route.ts — Protección de archivos multimedia
   - src/app/admin/page.tsx — Descarga de recursos via authFetch

### SESIÓN 20 (17/05/2026 — Contribución Voluntaria + Security Fixes + MP Webhook)

1. **Modelo de Contribución Voluntaria para Recursos:**
   - Eliminado el gate de pago obligatorio de la API de descarga (`/api/resources/download`)
   - Todos los recursos no-streamable son de descarga libre (sin token de compra)
   - Videos/audio siguen protegidos: solo reproducibles, no descargables (stream via X-Stream-Request header)
   - Cada tarjeta de recurso muestra: "Descargar" (gratis) + "Contribuir con MercadoPago" + "Contribuir con PayPal"
   - Eliminado el diálogo de compra (nombre/email/método de pago) — ya no se necesita
   - Links de contribución voluntaria: `link.mercadopago.com.ar/etersomos` y `paypal.me/registrosakashicos9`
   - Sección inferior "Contribución Voluntaria Consciente" con texto explicativo y links

2. **Bug fix: Admin content editing revalidation (CRÍTICO):**
   - `/api/settings` PUT no tenía `revalidatePath()` → los cambios de form toggles no se reflejaban
   - Agregado `dynamic = 'force-dynamic'` + headers anti-caché al GET de settings
   - Agregado `revalidatePath()` a TODAS las páginas relevantes después de PUT
   - Agregado cache-busting (`?t=${Date.now()}` + `cache: 'no-store'`) a TODOS los `fetch("/api/settings")` en 8 páginas:
     page.tsx, tienda, lecturas, membresias, n1-teorico, n1-practica, ambos, n2, form-paused-banner
   - `/api/cms/content/seed` agregado `revalidatePath()` + `dynamic = 'force-dynamic'`

3. **Seguridad: Middleware auth protection:**
   - Agregado `/api/settings` PUT a `METHOD_PROTECTED` en middleware (antes cualquiera podía cambiar settings)
   - Agregado `/api/resources` POST/PUT/DELETE a `METHOD_PROTECTED` (antes solo tenía auth inline)

4. **MercadoPago Webhook implementado (antes era no-op):**
   - Verifica payment status via MP API (`GET /v1/payments/{id}`)
   - Si pago aprobado + orden existente pendiente → marca como pagado
   - Si pago aprobado + sin orden → envía email al admin con alerta de "pago sin orden"
   - Maneja tanto POST (webhook) como GET (IPN verification)

5. **Admin CRUD revalidation:**
   - Agregado `revalidatePath()` a PUT/DELETE de:
     - `/api/admin/orders/[id]` → revalida `/` y `/tienda`
     - `/api/admin/bookings/[id]` → revalida `/` y `/lecturas`
     - `/api/admin/memberships/[id]` → revalida `/` y `/membresias`

6. **Email template para recursos (antes usaba crystal template):**
   - Agregado tipo "resource" a `OrderType` en email.ts
   - Nuevo template `buildResourceAdminHtml()` con título "Nueva Contribución a Recurso"
   - Subject: "📥 Nueva contribución a recurso - {nombre}"
   - Template de cliente: "Contribución Recibida" con steps de descarga
   - `handleResourcePurchase` en confirm-order ahora usa `type: "resource"` en vez de `type: "crystal"`

7. **Commits:**
   - `39d038a` — feat: voluntary contribution model - remove payment gate, all resources free + optional MP/PayPal contribution
   - `c7a5f2f` — fix: admin revalidation bug - add revalidatePath + dynamic=force-dynamic to settings API, cache-busting on all settings fetches, fix CMS seed revalidation
   - `90412b2` — fix: critical security + revalidation + MP webhook + resource email template

### SESIÓN 21 (29/05/2026 — Restauración baseline + Mentorías + Expansión)
1. **Restauración a baseline limpia (16/05)**: git reset --hard a commit base pre-carrusel
2. **Cherry-pick de páginas**: Mentorías (/mentorias) y Expansión restauradas con selectividad
3. **Página /mentorias creada**: Formulario de inscripción para mentorías 1:1
   - Badge "MENTORÍAS", info cards (Videollamada 1:1, 2 horas, Semanal)
   - Dos precios: Sesión individual $20.000 ARS / Pack 3+ $15.000 ARS/sesión
   - Acuerdo/condiciones con checkbox de aceptación
   - Formulario completo: ~15 campos + método de pago
   - Layout propio: src/app/mentorias/page.tsx + layout.tsx
4. **Página /recursos renombrada** de "Expansión" a "Recursos" en navbar
5. **Backup creado**: /home/z/my-project/download/backup-etersomos-20260529/

### SESIÓN 22 (29/05/2026 — Múltiples cambios de contenido y estructura)
1. **Navbar**: "Sesiones" → "Lecturas", "Membresía" → "Membresías", "Expansión" → "Recursos"
2. **Hero**: Título y subtítulo vacíos en CMS (usan fallback hardcodeado), tagline actualizado
3. **Espacios**: Card 1 "Lectura de Registros Akáshicos" (no "Lecturas Akáshicas"), precio $20.000 ARS · US$20
4. **Sobre Fer**: Título "Fer Cardozo", bio completa con "Viajera, emprendedora, guía espiritual..."
5. **FAQ**: Textos corregidos (Akasha, esencia no alma, Nivel 1 con Práctica)
6. **Membresías**: Precio Raíz de Luz confirmado US$5
7. **Mentorías**: Título en color blanco (unificado con otras secciones)
8. **Commit**: `2b9aa18` — feat: múltiples cambios de contenido, colores y estructura

### SESIÓN 23 (29/05/2026 — CMS defaults + navLinks fix)
1. **cms-defaults.ts actualizado**: Valores sincronizados con textos correctos del sitio
   - hero_title: "" (vacío para usar fallback), hero_subtitle: ""
   - nav.link_sesiones: "Lecturas" (era "Sesiones")
   - nav.link_membresia: "Membresías" (era "Membresía")
   - nav.link_recursos: "Recursos" (era "Expansión")
   - espacios.card1_title: "Lectura de Registros Akáshicos"
   - espacios.card1_price: "$20.000 ARS · US$20"
   - sobre_bio con Fer Cardozo completo
   - FAQ items corregidos
2. **navLinks en Recursos page**: Corregidos labels y URLs (quitado "Sesiones", "Expansión", "Membresía" sin í)
3. **Mentorías**: Color del título cambiado de violet-400 a white
4. **Commit**: `aea52e1` — fix: sincronizar CMS defaults con textos actualizados

### SESIÓN 24 (03/06/2026 — CMS revert bug fix + PROJECT_SPEC update)
1. **BUG CRÍTICO — "Los cambios se ven un segundo y vuelven al estado anterior"**:
   - Causa raíz: El CMS carga valores desde la DB (Turso) que sobreescriben los defaults del código
   - Al cargar la página, React renderiza primero con defaults del código → luego el CMS fetch reemplaza con valores de la DB
   - Solución: Actualizar CMS defaults en cms-defaults.ts + actualizar valores en DB via API bulk
   - Valores corregidos en DB: hero_title/subtitle, nav links, espacios card1, sobre_bio, FAQ items
2. **GitHub PAT actualizado**: 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 (token anterior expirado)
3. **Commit**: `170d48a` — fix: corregir CMS defaults y fallbacks - cambios ya no se revierten
4. **PROJECT_SPEC.md actualizado** con sesiones 21-24, navbar actualizado, /mentorias documentado, precios actualizados
5. **Backup creado**: /home/z/my-project/download/backup-etersomos-20260603/

### SESIÓN 25 (10/06/2026 — Auditoría completa + Bug fixes + PROJECT_SPEC update)

**Auditoría exhaustiva del código vs PROJECT_SPEC.md — discrepancias encontradas y corregidas:**

1. **BUG: Precio de lecturas incorrecto en código ($18.000 → $20.000)**:
   - `src/app/lecturas/page.tsx` fallback: 18000 → 20000
   - `src/lib/pricing.ts` readingPrice.ars: 18000 → 20000
   - `src/app/api/bookings/route.ts` fallback: 18000 → 20000 (2 lugares)
   - El cms-defaults.ts ya tenía 20000 correcto, pero los fallbacks hardcodeados estaban desactualizados

2. **BUG: Email incorrecto en footer de Recursos**:
   - `src/app/recursos/page.tsx` footer: `contacto@etersomos.com` → `etersomos@gmail.com`
   - Todas las demás páginas ya usaban el email correcto

3. **Archivo eliminado: src/app/api/route.ts ("Hello World")**:
   - La sesión 6 decía que se eliminó, pero aún existía
   - Eliminado definitivamente

4. **Archivo eliminado: data/settings.json**:
   - El spec decía "ya NO se usa", pero seguía en el repo
   - Eliminado definitivamente

5. **Discrepancias documentadas en PROJECT_SPEC.md**:
   - `.env.example` NO existe (spec decía que sí) — nota actualizada
   - `scripts/restore-vercel-env.sh` NO existe (spec decía que sí) — nota actualizada, restauración manual documentada con las 16 variables completas
   - Token Vercel corregido en todos los comandos (antes usaba token expirado)
   - Nota sobre admin password client-side en page.tsx
   - Directorio del proyecto clarificado (repo clonado en /etersomos/)

6. **Discrepancias conocidas NO corregidas (requieren decisión del usuario)**:
   - `src/app/page.tsx` handleOpenAdmin() valida password client-side (menos seguro)
   - Admin form toggles: tiene "tienda" pero no "mentorias"; spec dice 6 toggles pero hay 7
   - `nav.link_contacto` en cms-defaults.ts está huérfano (ninguna página lo usa)
   - Página /mentorias no tiene navbar propio inline (usa layout padre)
   - Archivos en repo que no deberían estar: `etersomos-backup-files/`, `skills/`, `upload/PROJECT_SPEC.md`, `Caddyfile`, `worklog.md`

7. **Backup creado**: /home/z/my-project/download/backup-etersomos-20260610/

### SESIÓN 26 (10/06/2026 — Aula Virtual MVP)

**Feature completa: Aula Virtual con auth de alumnos, dashboard personal y admin de alumnos.**

1. **Nuevas tablas en Turso DB**:
   - `Student` (id, email UNIQUE, passwordHash, nombre, phone, createdAt, updatedAt)
   - `StudentEnrollment` (id, studentId, type, referenceId, title, status, assignedBy, notes, createdAt, updatedAt)
   - `CourseContent` (id, courseId, title, description, fileType, r2Key, fileName, sortOrder, active, createdAt)
   - Índices: idx_student_email, idx_enrollment_student, idx_coursecontent_course

2. **Sistema de autenticación para alumnos**:
   - Archivo: `src/lib/student-auth.ts`
   - JWT con `jose` + cookies httpOnly (cookie: `student_token`, 7 días)
   - Passwords hasheados con `bcryptjs`
   - Registro directo en /aula/registro (email + password + nombre)
   - Login en /aula/login
   - Logout vía POST /api/student/auth/logout

3. **APIs de alumno** (públicas, sin auth admin):
   - POST /api/student/auth/login — login con email + password
   - POST /api/student/auth/register — registro de nuevo alumno
   - GET /api/student/auth/me — perfil del alumno logueado
   - POST /api/student/auth/logout — cerrar sesión
   - GET /api/student/enrollments — inscripciones del alumno
   - GET /api/student/course-content?courseId= — contenido de curso (verifica inscripción)

4. **APIs de admin para alumnos** (requieren auth admin):
   - GET /api/admin/students — listar alumnos
   - POST /api/admin/students — crear alumno (auto-genera password si no se provee)
   - GET /api/admin/students/[id] — detalle + inscripciones
   - DELETE /api/admin/students/[id] — eliminar alumno + inscripciones
   - POST /api/admin/students/[id]/enrollments — asignar curso/lectura/mentoría

5. **Páginas del Aula Virtual**:
   - `/aula/login` — login con email + contraseña (diseño mystic)
   - `/aula/registro` — registro de nuevo alumno (nombre, email, teléfono, contraseña)
   - `/aula` — dashboard personal: stats, mis cursos, mis lecturas, mis mentorías, perfil
   - `/aula/curso/[courseId]` — contenido de curso (archivos descargables)

6. **Admin — Tab "Alumnos"** (9no tab en panel admin):
   - Lista de alumnos registrados (panel izquierdo)
   - Detalle del alumno con inscripciones (panel derecho)
   - Crear alumno desde admin (con auto-generación de contraseña)
   - Asignar curso/lectura/mentoría a un alumno
   - Eliminar alumno
   - Contraseña generada se muestra una sola vez con botón de copiar

7. **Middleware actualizado**:
   - Rutas públicas: /api/student/auth/login, /register, /logout
   - Rutas protegidas por cookie student_token: /api/student/enrollments, /api/student/auth/me
   - Admin sigue requiriendo Bearer token para /api/admin/students

8. **Dependencias nuevas**: bcryptjs, jose (ya estaban instaladas en node_modules)

9. **Commit**: `589fd98` — feat: aula virtual - student auth, dashboard, admin alumnos tab, course content API

### SESIÓN 27 (10/06/2026 — Lectura upload fix + Course dropdown + Aula Virtual Redesign)

1. **Fix lectura audio upload**: El endpoint `/api/admin/lectura-upload` existía pero usaba presigned URL + fetch desde el servidor que fallaba silenciosamente. Reescrito con `uploadLecturaResource()` (subida directa S3 client). Agregada validación de tipo de archivo (solo audio) y tamaño (200MB max).

2. **Nueva función en r2.ts**: `uploadLecturaResource(file)` — sube archivo directamente a R2 bajo `lecturas/` prefix sin pasar por presigned URL.

3. **Mensajes de progreso en admin**: Nuevo estado `lecturaUploadStep` que muestra paso a paso: "Subiendo audio...", "Audio subido. Guardando inscripción...", "Procesando...". Badge verde con nombre de archivo al seleccionar. Inputs deshabilitados durante upload.

4. **Desplegable de cursos en admin**: Al asignar inscripción tipo "curso", el campo "ID referencia" se reemplaza por un `<Select>` con opciones predefinidas: RA N1 Teórico (`n1-teorico`), RA N1 con Práctica (`n1-practica`), RA N2 Completo (`n2`), Ambos Niveles (`ambos`). Al seleccionar, el título se autocompleta.

5. **Botones de contenido de cursos actualizados**: Los botones rápidos en "Contenido de Cursos" ahora muestran las etiquetas de Registros Akáshicos (RA N1 Teórico, etc.) en vez de los IDs crudos.

6. **Rediseño completo del Aula Virtual** (inspirado en Moodle/Canvas/LMS modernos):
   - **Dashboard** (`/aula/page.tsx`, ~1164 líneas): Hero de bienvenida con saludo personalizado + hora del día + frase espiritual rotativa. Sidebar fija en desktop (240px) con Sheet drawer en mobile. Nav: Inicio, Mis Cursos, Mis Lecturas, Mentorías, Mi Perfil. Stats visuales con barras de progreso animadas. Cards de cursos con gradiente, icono de tipo, badge de estado, botón "Continuar". Lecturas con estilo album-art, badge "Nueva", reproductor waveform, countdown de expiración colorizado. Animaciones Framer Motion (AnimatePresence, staggered entrance, hover lift). Perfil con avatar inicial.
   - **Reproductor de curso** (`/aula/curso/[courseId]/page.tsx`, ~604 líneas): Breadcrumb (Aula > Curso > Clase). Barra de progreso. Título + descripción arriba del player. Botones Anterior/Siguiente. Checkmarks de completación en playlist. Transiciones fade con Framer Motion.
   - **Login** (`/aula/login/page.tsx`, ~264 líneas): Orbes místicos flotantes animados. Estrellas titilantes. Toggle mostrar/ocultar contraseña. Frase espiritual. Logo animado con hover.

7. **Fix JSX syntax**: Corregido `}))}` → `))}` en dropdown de cursos del admin (error de TypeScript).

8. **Git tag backup**: `v2026-06-10-session27`

### SESIÓN 28 (11/06/2026 — Full backup + PROJECT_SPEC update + Admin sidebar redesign documentation)

1. **Backup completo de todos los archivos del proyecto**:
   - 98 archivos respaldados en `/home/z/my-project/etersomos/etersomos-backup-files/backup-20260611/` (1.3MB)
   - Incluye: todas las páginas (admin, aula, home, cursos, lecturas, membresías, mentorías, recursos, tienda, payment), todas las API routes, todas las librerías (db, r2, student-auth, email, paypal, mercadopago, pricing, cms, etc.), hooks, componentes custom, config files, prisma schema, PROJECT_SPEC.md
   - Cada archivo tiene extensión `.bak` para diferenciar de los originales

2. **PROJECT_SPEC.md actualizado con cambios de la sesión 27-28**:
   - Sección "Admin Panel" reescrita: Tabs → Sidebar con secciones agrupadas (4 grupos: PRINCIPAL, AULA VIRTUAL, SITIO WEB, DATOS, 11 secciones)
   - Agregada tabla de navegación con IDs e iconos para cada sección del admin
   - Dashboard agregado como sección principal (antes era solo un header en el Tabs)
   - Alumnos y Contenido Cursos documentados como secciones propias
   - Líneas del admin actualizadas: ~3400 → ~3741
   - Backup section actualizada con backup del 11/06
   - Commit actualizado: ecdbddc → 1043243

3. **Admin panel sidebar — documentación del rediseño** (commit 1043243, aplicado en sesión previa):
   - `Tabs` import reemplazado por `Sheet` (sidebar mobile drawer)
   - Nuevos imports: `Menu`, `LogOut`, `LayoutDashboard` de lucide-react
   - Import `framer-motion` agregado (`motion`, `AnimatePresence`)
   - `navGroups` array definido fuera del componente (4 grupos, 11 items)
   - `SidebarContent` componente separado (reutilizado en desktop y mobile Sheet)
   - State: `activeSection` (default "dashboard") y `mobileMenuOpen`
   - Layout: sidebar fija 240px desktop + Sheet drawer mobile
   - Sección activa con Framer Motion AnimatePresence para transiciones suaves
   - Header con breadcrumb dinámico (muestra grupo + sección activa)
   - Botón logout en sidebar

### SESIÓN 30 (11/06/2026 — Adjuntos múltiples + Admin UI rediseño + Tabs filtro inscripciones)

1. **Multi-file attachments para lectura enrollments** (commit cc4fed8):
   - Nueva tabla `EnrollmentAttachment` en DB con campos: id, enrollmentId, r2Key, fileName, fileType, fileSize, mimeType, sortOrder, createdAt
   - Nuevo endpoint `GET/POST/DELETE /api/admin/enrollments/[id]/attachments` para gestionar adjuntos
   - Función `uploadLecturaAttachment()` en r2.ts — sube a prefijo `lecturas/adjuntos/`
   - `getStudentEnrollments()` en student-auth.ts ahora devuelve attachments por enrollment
   - `/api/student/stream` y `/api/student/download-lectura` verifican acceso tanto en audio principal como en attachments
   - `/api/admin/cleanup-lecturas` ahora también elimina archivos adjuntos de R2 y DB
   - Aula Virtual (aula/page.tsx): componente `AttachmentsSection` con previews de imágenes, links de descarga, íconos por tipo
   - Admin: sección de adjuntos por enrollment con upload, lista, delete

2. **Rediseño cards de lecturas en admin** (commit 761a017):
   - Espaciado entre inscripciones: `space-y-2` → `space-y-5`
   - Cada inscripción ahora es una card con borde colorado (violeta=lectura, azul=curso, dorado=mentoría)
   - Header bar separado con ícono en cuadradito, título, badges agrupados a la derecha
   - Body con más padding (`px-4 py-4`, `space-y-4` entre secciones)
   - Sub-íconos en cuadraditos para "Audio de la lectura" y "Archivos adjuntos"
   - Badge de adjuntos en el header de la inscripción

3. **Tabs de filtro para inscripciones** (commit 75b5caa):
   - Pestañas: Pendientes (amber), Entregadas (emerald), Cursos/Otras (blue), Todas (mystic)
   - Filtrado: Pendientes = lectura sin r2Key, Entregadas = lectura con r2Key, Cursos = type !== lectura
   - Pestañas con 0 elementos se ocultan automáticamente (excepto Todas)
   - Al seleccionar alumno nuevo, resetea a "Pendientes"
   - Cada tab muestra count con badge

4. **Fix Vercel deploy** — git user corregido a `Gonzalo Paulero <etersomos@gmail.com>` para evitar bloqueo COMMIT_AUTHOR_REQUIRED. Deploy vía API con `target: production`

### SESIÓN 29 (11/06/2026 — Bug fixes + Email branding + PROJECT_SPEC update)
1. **Fix: Alumnos existentes recibian credenciales de nuevo** — `ensureStudentWithEnrollment()` ya NO regenera password para alumnos existentes. `generatedPassword = null` para alumnos existentes. Solo se envía `sendAulaWelcomeEmail` cuando `generatedPassword && isNewStudent`.
2. **Fix: Nuevas lecturas no aparecian en kanban admin** — El sistema de deduplicacion verificaba `type + referenceId + title`. Como `referenceId` estaba vacio para todas las lecturas, una segunda "Lectura Akashica Individual" se consideraba duplicada. Fix: pasar `booking.id` como `referenceId` para que cada lectura sea una inscripcion unica.
3. **Nuevo: Email de lectura lista** — Cuando admin cambia status a "entregada" en el kanban, se envia automaticamente `sendLecturaReadyEmail` al alumno notificando que su lectura esta disponible en el Aula Virtual. Archivo: `src/app/api/admin/bookings/[id]/route.ts`.
4. **Nuevo: Email para alumnos existentes** — `sendAulaExistingStudentEmail()` notifica al alumno existente sobre su nueva inscripcion sin enviar credenciales (recordandole que use las existentes).
5. **Email branding Eter Somos** — Todos los emails usan BRAND tokens que replican la estetica del sitio: fondos oscuros (#0a0908, #161310), violeta (#a78bfa, #8b5cf6), bordes sutiles, tipografia serif/sans, CTA pill con glow violeta. Componentes compartidos: `emailShell()`, `headerBlock()`, `footerBlock()`, `ctaButton()`, `sectionLabel()`.
6. **Proveedor de emails: Nodemailer + Gmail SMTP** — Reemplazo Resend (sandbox). Cuenta: etersomos@gmail.com, App Password: qarpqbgcdhlkxksa. Ventaja: envia a cualquier email sin limitaciones.
7. **Nuevas env vars: SMTP_USER, SMTP_APP_PASSWORD** — Total: 18 variables (antes 16).
8. **Backup completo** — Archivos respaldados en `/home/z/my-project/etersomos-backups/2026-06-11/`.
9. **AutoEnrollResult actualizado** — Nuevo campo `isNewEnrollment: boolean` para distinguir entre inscripciones nuevas vs duplicadas.

### SESIÓN 31 (19/06/2026 — SEO Completo + Dominio etersomos.com + GEO)

1. **Dominio custom configurado**: etersomos.com y www.etersomos.com ya estaban verificados en Vercel. Redirección 308 de etersomos.com → www.etersomos.com funcionando correctamente.

2. **NEXT_PUBLIC_BASE_URL actualizado**: En Vercel de `etersomos.vercel.app` → `https://www.etersomos.com`. Fallbacks en mercadopago.ts, paypal.ts, email.ts actualizados.

3. **SEO técnico implementado** (commit 87eeff5):
   - **Root layout** (`layout.tsx`): metadata completa con title template `%s | Eter Somos`, description rica, keywords (17 términos), Open Graph (locale es_AR, siteName, images), Twitter Cards (summary_large_image), canonical URL, robots con googleBot config, authors, creator, publisher, category, dns-prefetch, preconnect
   - **Todas las páginas** con meta tags SEO individuales: /lecturas, /cursos, /membresias, /tienda, /recursos, /mentorias, /aula, + 4 sub-páginas de cursos
   - **Canonical URLs** en todas las páginas públicas apuntando a www.etersomos.com
   - **Aula Virtual** con `robots: { index: false, follow: false }` (no indexar contenido privado)

4. **Structured Data (JSON-LD)** — Nuevo componente `src/components/json-ld.tsx`:
   - `LocalBusinessJsonLd`: LocalBusiness con geo (Córdoba -31.4201, -64.1888), dirección, teléfono, email, horarios, founder (Fer Cardozo), offerCatalog con servicios y cursos, sameAs (Instagram)
   - `FAQJsonLd`: 6 preguntas frecuentes con respuestas detalladas
   - `CoursesJsonLd`: ItemList con 4 cursos (Course schema con provider, url, offers)
   - `LecturaJsonLd`: Service schema para lectura akáshica
   - `MentoriaJsonLd`: Service schema con 2 offers (individual + pack)
   - `BreadcrumbJsonLd`: Breadcrumbs en todas las páginas (Inicio > Sección > Sub-sección)
   - `ProductJsonLd`: Reutilizable para cristales y productos

5. **Sitemap actualizado** (`sitemap.ts`): 11 URLs con prioridades y frecuencias, todas apuntando a www.etersomos.com. Agregadas: /mentorias, /tienda, /recursos (antes faltaban).

6. **Robots.txt mejorado**: Disallow /admin, /aula, /api/ para todos los bots. Sitemap apuntando a www.etersomos.com/sitemap.xml.

7. **Navbar propio en /mentorias**: Layout actualizado con navbar "Volver a Inicio" + MentoriaJsonLd + BreadcrumbJsonLd (resuelve pendiente #22).

8. **next.config.ts simplificado**: Eliminado `experimental.turbo.root` que apuntaba a directorio incorrecto.

### SESIÓN 32 (29/06/2026 — SEO Quick Wins + Favicon fix + Search Console)

1. **H1 SEO agregado a la home** (`src/app/page.tsx`):
   - **PROBLEMA**: La home NO tenía ningún `<h1>` visible — solo H2/H3. Error SEO grave.
   - **FIX**: Agregado `<motion.h1>` con keyword principal: "Registros Akáshicos en Argentina".
   - Subtítulo nuevo (gold-300): "Lecturas, Cursos y Cristales con Fer Cardozo · Desde Córdoba al mundo".
   - Tagline enriquecida con "Lecturas de Registros Akáshicos personalizadas en audio, cursos de formación y mentorías para tu camino espiritual."
   - `heroTitle` y `heroSubtitle` CMS defaults actualizados con keywords.

2. **H1 + intro SEO en `/lecturas`** (`src/app/lecturas/page.tsx`):
   - H1 anterior era "ACUERDO DE LECTURA DEL CAMPO AKÁSHICO" (genérico, no keyword).
   - H1 nuevo: "Lectura de Registros Akáshicos Personalizada" (incluye keyword principal).
   - Agregado párrafo intro SEO con long-tail: "lectura akáshica personalizada", "Campo Akáshico", contexto geográfico (Córdoba → mundo), formato (audio en Aula Virtual).
   - CardTitle del Collapsible actualizado: "Acuerdo de Lectura Akáshica — Marco y Condiciones" (mantiene el acuerdo pero con keyword).

3. **Intro SEO en `/cursos`** (`src/app/cursos/page.tsx`):
   - H1 mantenido: "Cursos de Registros Akáshicos" (ya era correcto).
   - Intro enriquecido: ahora 2 párrafos con keyword + long-tail ("Campo Akáshico", "lecturas akáshicas", "práctica individual", "mundo hispanohablante", "meditaciones guiadas", "acompañamiento personalizado de Fer Cardozo").

4. **Favicon fix — eliminado logo Z.ai default** (CRÍTICO):
   - **PROBLEMA**: `public/logo.svg` era el favicon default de Z.ai (letra Z dibujada en SVG con animación CSS `z-breathe`). Era visible en la pestaña del browser y dañaba la marca. Nunca debió quedar en el repo.
   - **ELIMINADO**: `public/logo.svg` (1065 bytes).
   - **CREADO**: `public/favicon.ico` — multi-resolución (16/32/48/64px) generado desde `logo-etersomos.jpg` con Pillow. 19KB.
   - **CREADO**: `public/images/apple-touch-icon.png` — 180x180 PNG optimizado para iOS. 68KB.
   - `src/app/layout.tsx` actualizado: `icons.icon[0]` ahora apunta a `/favicon.ico` (sizes: any) + JPG como fallback con tamaño explícito. `icons.apple` ahora usa `/images/apple-touch-icon.png` (estándar Apple).
   - Script generador persistido en `/home/z/my-project/scripts/make_favicon.py`.

5. **Google Search Console — configurado por el usuario**:
   - Propiedad verificada: `etersomos.com` (sin www) — **PENDIENTE**: agregar también `www.etersomos.com` como propiedad separada.
   - Sitemap enviado hace días (correcta, 11 URLs descubiertas).
   - Indexación solicitada para: `/`, `/lecturas`, `/cursos` (post-cambios SEO S32).

6. **GA4 — PENDIENTE**:
   - El usuario aún no tiene Google Analytics 4 configurado.
   - Próximo paso: crear cuenta en analytics.google.com → pasar Measurement ID `G-XXXXXXXXXX` → integrar en `layout.tsx`.

7. **Dominio legacy `etersomos.ga`** (información, no código):
   - Era un dominio gratuito Freenom que dejó de existir en 2023 cuando Freenom perdió la licencia de `.ga`.
   - DNS no resuelve, HTTP/HTTPS fallan. No es recuperable ni redirigible.
   - Google puede seguir mostrándolo indexado por un tiempo.
   - **ACCIÓN USUARIO**: buscar `site:etersomos.ga` en Google, anotar URLs, pedir eliminación temporal en Search Console → "Eliminaciones temporales". En 6 meses Google lo desindexará definitivamente.

8. **Commits de la sesión**:
   - `11ac493` — feat(seo): S32 - H1 en home + keyword density en /lecturas y /cursos
   - `84aea6c` — fix(seo): S32 - favicon correcto (eliminado logo Z.ai default)

9. **Backup de sesión**: `etersomos-backup-files/backup-20260629-s32/` con 8 archivos (page.tsx, lecturas/page.tsx, cursos/page.tsx, layout.tsx, json-ld.tsx, favicon.ico, apple-touch-icon.png, PROJECT_SPEC-pre-s32.md).

10. **Worklog actualizado** en `/home/z/my-project/worklog.md` (fuera del repo, en workspace principal).

### SESIÓN 33 (23/07/2026 — 38 correcciones pendientes: Home + Lecturas + CMS + JSON-LD)

**2 push pendientes que se perdieron al resetear el entorno — re-implementados completamente.**

Commit: `778f20d` — 4 archivos, 135 insertions, 161 deletions.

#### GRUPO 1 — Home page (`src/app/page.tsx`) — 16 cambios:

1. **Hero logo achicado en desktop**: `md:w-52 md:h-52` (208px) → `md:w-44 md:h-44` (176px)
2. **Hero padding**: Agregado `pt-24 sm:pt-20` al contenedor hero para compensar navbar
3. **H1 visible eliminado del Hero**: Removido `<motion.h1>` con "Registros Akáshicos en Argentina" visible
4. **Subtítulo visible eliminado del Hero**: Removido subtítulo "Lecturas, Cursos y Cristales con Fer Cardozo"
5. **"Eter Somos" restaurado como `<motion.h2>`**: Título principal del Hero vuelve a ser brand name
6. **H1 sr-only SEO**: Agregado `<h1 className="sr-only">` con keywords: "Registros Akáshicos en Argentina · Lecturas, Cursos y Cristales · Fer Cardozo · Córdoba"
7. **Tagline corta restaurada**: "Lecturas de Registros Akáshicos personalizadas en audio, cursos y mentorías" (reemplaza tagline enriquecida S32)
8. **Espacios card 4**: "Cristales" → "Tienda", descripción actualizada
9. **FAQ pregunta 10**: Rewording de la pregunta (envíos/cristales)
10. **FAQ respuesta 10**: Rewording de la respuesta correspondiente
11. **Footer descripción**: Texto actualizado con nueva descripción del sitio
12. **Footer texto legal**: Actualizado
13. **Footer link "Mentorías"**: Agregado link a `/mentorias` en footer
14. **Footer link "Aula"**: Agregado link a `/aula` en footer
15. **cms-defaults sync**: 6 defaults actualizados en `src/lib/cms-defaults.ts` para reflejar cambios del Hero, Espacios, Footer
16. **Precio lectura en home**: `$20.000 ARS` → `$18.000 ARS` en cms-defaults (`espacios.card1_price`)

#### GRUPO 2 — Lecturas page (`src/app/lecturas/page.tsx`) — 22 cambios:

17. **Paleta gold → violet**: Todos los `text-gold-400` migrados a `text-foreground` / `text-violet-400` / `text-violet-500` / `text-violet-600`
18. **H1 color**: `text-gold-400` → `text-foreground`
19. **Badges color**: `text-gold-400` → `text-foreground` / violet
20. **Asteriscos obligatorios**: `text-gold-400` → `text-violet-500`
21. **Stepper active step**: `text-gold-400` → `text-violet-500`
22. **Inputs focus ring**: `focus:border-gold-400` → `focus:border-violet-500` + `focus:ring-violet-500`
23. **Radio buttons selected**: `text-gold-400` → `text-violet-500`
24. **Checkbox check color**: `text-gold-400` → `text-violet-500`
25. **Campo "Estado civil"**: ELIMINADO del formulario
26. **Campo "¿Tomás medicación?" general**: ELIMINADO (se mantiene solo el campo específico de medicación psiquiátrica)
27. **Label Preguntas N° 1**: Rewording
28. **Label Preguntas N° 2**: Rewording
29. **Label "¿Cómo nos conociste?"**: Rewording
30. **Label "Método de Pago"**: Rewording
31. **Label "Nombre de quien te recomendó"**: Rewording
32. **Label "terapia psicológica"**: Rewording
33. **Label "terapia psiquiátrica / medicación"**: Rewording
34. **Label "enfermedad crónica"**: Rewording
35. **Help text "Contexto adicional"**: Agregado texto largo del Google Form como ayuda contextual
36. **Checkbox texto y color**: Texto actualizado, `text-foreground/90` → `text-foreground`
37. **Precio lectura ARS en lecturas page + cms-defaults**: `$20.000` → `$18.000` (USD $20 sin cambios)
38. **Precio lectura en JSON-LD**: Actualizado en `src/components/json-ld.tsx` (2 lugares: `LecturaJsonLd` + `LocalBusinessJsonLd.offerCatalog`)

#### Extra — Botón "Volver arriba" (floating):
- Botón flotante que aparece al scrollear >600px
- Ícono ArrowUp, estilo violet (bg-violet-600 hover:bg-violet-500)
- Position: fixed bottom-right, z-50
- Smooth scroll al top

#### Archivos modificados:
| Archivo | Cambios |
|---------|---------|
| `src/app/page.tsx` | Hero, Espacios, FAQ, Footer (items 1-14) |
| `src/app/lecturas/page.tsx` | Paleta, campos, labels, precio, volver arriba (items 17-37 + extra) |
| `src/lib/cms-defaults.ts` | 6 defaults + 2 precios (items 15-16, 37) |
| `src/components/json-ld.tsx` | 2 precios JSON-LD (item 38) |

### PENDIENTES POST-SESIÓN 33 (lo que sigue):
- Crear cuenta GA4 y pasar Measurement ID → integrar al sitio
- Verificar propiedad `www.etersomos.com` en Search Console (aparte de la sin-www)
- Desindexar `etersomos.ga` (acciones del usuario, ver punto 7 de S32)
- Arrancar con **Blog SEO** (Opción B) — próximo paso grande para rankear "registros akáshicos"
- **PENDIENTE CRÍTICO**: Rotar el GitHub PAT que el usuario pasó por chat (quedó expuesto)

SESIÓN 34 (12/08/2026 — Home cleanup + Lecturas: acuerdo sincronizado con Google Form)
GRUPO 1 — Home (src/app/page.tsx):
- Eliminado el título visible "Eter Somos" (motion.h2) del Hero. Quedan: logo + tagline + botones. El H1 sr-only SEO se mantiene intacto.
- Eliminado el ícono del carrito del navbar (desktop y mobile). El carrito queda solo en /tienda.
- Eliminado el código muerto del carrito/checkout de cristales (~700 líneas): interfaces Product/CartItem, array products de cristales, crystalCategories, CMS reads cart.*/checkout.*, cmsProducts/cmsCategories, estados cart/cartOpen/activeCategory/checkout*, addToCart, updateQuantity, removeFromCart, cartTotal/cartCount, filteredProducts, saveCheckoutSession, validateCheckoutForm, handleCheckoutChange, handlePayWithMercadoPago, Cart Sheet, Checkout Dialog e imports sin uso (ShoppingBag, Plus, Minus, CreditCard). La home no vende cristales desde la sesión 8; el botón de carrito vacío apuntaba a #cristales que ya no existía.
GRUPO 2 — Lecturas (src/app/lecturas/page.tsx):
- Eliminada la frase del intro "Solicitá tu lectura akáshica personalizada con Fer Cardozo."
- ACUERDO DE LECTURA sincronizado con el Google Form actualizado (textos acortados por Fer): entrega ~10 días hábiles (antes "dentro de la semana siguiente"), enfoque espiritual sin predicciones, 2 preguntas entregadas en audio, ejemplos de preguntas, duración 30-40 min o más, condiciones, confidencialidad, derecho de admisión con reintegro.
- Limpieza visual: sin negritas en el acuerdo, sin label "NOTA IMPORTANTE" en mayúsculas, sin separadores redundantes.
- Recuadros solo blanco/violeta: buenas preguntas y no respondidas ahora usan fondo neutro + borde violeta. Tilde verde (sí se responden) y cruz roja (no se responden; antes AlertTriangle, ahora icono X).
- Checkbox de aceptación del acuerdo con visibilidad mejorada: borde violeta notorio, fondo violeta sutil, checkbox size-5 que se rellena en violeta (antes casi invisible sobre fondo oscuro).
- Agregado ícono X de lucide-react.
Notas:
- Los errores de validación del formulario mantienen texto rojo chico (funcional, no son recuadros).
- El precio del acuerdo ya no está duplicado en el texto: se muestra en los badges CMS arriba del acuerdo.

SESIÓN 35 (12/08/2026 — Cursos: intro limpia + pantalla de agradecimiento) — realizada en sesión paralela
Commits: d94eba1, 3b08821
- Cursos: intro sin frases redundantes ("con Fer Cardozo", "al mundo (de todos lados)") y cards más claras (ajuste glass-light).
- Pantalla de agradecimiento post-inscripción (inline) en los 4 formularios de cursos: al enviar con transferencia/WU mostraba "¡Gracias por completar tu inscripción!" + recordatorio de contribución.
- /payment/success: mensaje recordando los accesos al Aula Virtual.
Nota: En la sesión 36 la pantalla inline fue reemplazada por redirección a /cursos/gracias (pedido del usuario: "que te saque de esa página").

SESIÓN 36 (12/08/2026 — Tipografías unificadas + violeta total + cards claras + /cursos/gracias + recuperación de contraseña)
Commits: 3e116fc, 8dc348a, 8089865 + commit docs
GRUPO 1 — Tipografías (auditoría global):
- H1 unificados a escala text-2xl sm:text-3xl md:text-4xl en /cursos, /tienda y /recursos.
- Regla vigente: Playfair Display (font-serif) = títulos, precios y CTAs principales; Josefin Sans (sans) = resto.
GRUPO 2 — gold → violet (completa la migración iniciada en /lecturas en S33):
- 4 formularios de cursos (n1-teorico, n1-practica, n2, ambos): ~190 clases gold migradas a violet (text/border/bg/focus/checked), glow dorado eliminado, H1 a text-foreground.
- /membresias y /payment/success migrados. Ya no quedan clases gold en el código.
GRUPO 3 — Cards de cursos más claras:
- .glass-light (globals.css): fondo rgba(52,44,62,0.55) → rgba(66,56,84,0.78), borde violeta 0.25 → 0.45. Solo afecta páginas de /cursos.
GRUPO 4 — Meta de /cursos: description y twitter card sin "con Fer Cardozo".
GRUPO 5 — Página de agradecimiento /cursos/gracias:
- Nueva página dedicada (robots noindex) con confirmación de inscripción + recordatorio de contribución + comprobante por WhatsApp/email.
- Los 4 formularios de cursos ahora hacen router.push("/cursos/gracias") tras enviar (reemplaza la pantalla inline de S35; eliminados el estado submitted y el bloque inline, agregado useRouter).
GRUPO 6 — Recuperación de contraseña del Aula Virtual:
- Tabla Student: columnas resetToken/resetExpiry (auto-migración ALTER TABLE en ambas ramas de ensureSchema: Turso y local/Prisma).
- student-auth.ts: createPasswordResetToken(email) — token randomBytes(32) hex, expira a los 30 min, búsqueda case-insensitive; resetPasswordWithToken(token, password) — valida expiración, un solo uso, actualiza passwordHash (bcrypt) y limpia el token.
- email.ts: sendPasswordResetEmail con estética BRAND (headerBlock + ctaButton), asunto "Eter Somos - Restablecer tu contrasena del Aula Virtual".
- APIs públicas: POST /api/student/auth/forgot-password (respuesta genérica para no revelar si el email existe) y POST /api/student/auth/reset-password (mínimo 8 caracteres).
- Páginas: /aula/recuperar (email → estado "Revisá tu email") y /aula/reset?token=... (nueva contraseña + confirmación; estados éxito / enlace inválido; Suspense por useSearchParams).
- /aula/login: link "¿Olvidaste tu contraseña?" bajo el formulario.
- Middleware: ambas rutas agregadas a PUBLIC_ROUTES.
Pendiente de verificar: flujo completo con un alumno real (pedido → email → link → reset → login).

SESIÓN 37 (12/08/2026 — Lecturas: página de agradecimiento post-solicitud)
Commits: b86dc50 + commit docs
- Nueva página /lecturas/gracias (robots noindex): confirmación de solicitud + aviso de accesos al Aula Virtual por email + recordatorio de contribución/comprobante (WhatsApp/email). Header y footer propios con la estética de /lecturas.
- handleSubmit de /lecturas (flujo transferencia/WU): el toast inline de éxito fue reemplazado por router.push("/lecturas/gracias") — el usuario ahora sale de la página al completar el formulario (consistencia con /cursos/gracias de S36).
- Agregado useRouter en lecturas/page.tsx.
Nota: Los flujos MercadoPago/PayPal ya salían de la página (redirigen a la plataforma de pago y vuelven a /payment/success).

SESIÓN 38 (18/08/2026 — Lecturas: precio $20.000 + acuerdo actualizado + casillas de confirmación)
Commit: b3572f8 (lecturas/page.tsx +52/-64, json-ld.tsx, cms-defaults.ts)
- Precio de lectura: $18.000 → $20.000 ARS (vuelve al valor original; USD $20 sin cambios). Actualizado en código, cms-defaults, JSON-LD y DB del CMS.
- Eliminado "desde Córdoba hacia todo el mundo" del párrafo introductorio.
- Acuerdo actualizado según el Google Form de lecturas: entrega 10 días hábiles, enfoque espiritual sin predicciones, duración 30-40 min, incluye 2 temas/preguntas respondidos en audio personalizado por email.
- Recuadros de preguntas (sí se responden / no se responden) sin cambios.
- El checkbox único de aceptación fue reemplazado por "Confirmá los siguientes puntos antes de continuar:" con 5 casillas obligatorias (mayor de 18/datos verdaderos, propósito espiritual no reemplaza atención médica, sin reembolsos, no responsabilidad por decisiones, derecho de admisión con reintegro). El formulario de datos solo aparece cuando las 5 están tildadas.

SESIÓN 39 (18-19/08/2026 — Cursos: precios nuevos + formularios sincronizados con Google Forms)
Commits: 524769c, 54a3c49, 2dcdbbb, dc0d57f
Decisión: los Google Forms pasados por el usuario (N1 Práctica, N2, Ambos) son REFERENCIA de contenido — se mantienen los formularios propios del sitio (conservan DB, emails y auto-enrollment al Aula Virtual). Precios confirmados por el usuario.
GRUPO 1 — Precios nuevos (commit 524769c):
- N1 con Práctica: $35.000/US$30 → $45.000/USD 35
- N2 Completo: $45.000/US$45 → $60.000/USD 50 (descuento 10%: $40.500/US$40 → $54.000/USD 45)
- Ambos Cursos: $70.000/US$55 → $85.000/USD 65 (PayPal/WU ya no tienen precio alternativo)
- Actualizado en: pricing.ts, cms-defaults.ts, json-ld.tsx (LocalBusiness + CoursesJsonLd), fallbacks de /cursos y DB del CMS (bulk update verificado).
GRUPO 2 — Formularios sincronizados con los Google Forms:
- /cursos/n1-practica (54a3c49): acuerdo nuevo (qué incluye, prácticas con plazo de 30 días y disponibilidad Lun-Vie 13.30-20hs ARG + sábados, material, valor con beneficio 10% para Nivel 2) + 6 casillas obligatorias "Confirmá los siguientes puntos antes de continuar:".
- /cursos/n2 (2dcdbbb): acuerdo nuevo (dirigido a quienes ya abren sus Registros, etapa teórica de 10 módulos + autoevaluación, etapa práctica de 4 clases con detalle clase por clase, 3 consultantes voluntarios, plazo 2 meses, valor con descuento por Nivel 1 hecho con Fer) + 8 casillas obligatorias.
- /cursos/ambos (dc0d57f): acuerdo nuevo (ambos niveles con contenidos, cómo se desarrolla, prácticas de cada nivel, plazos 2 meses y medio máximo, disponibilidad, valor promocional) + 9 casillas obligatorias.
- Los 3 usan el mismo mecanismo que /lecturas (S38): confirmations state + allConfirmed gate del formulario, persistencia en localStorage (_confirmations).
- Meta description de /cursos actualizada con los precios nuevos (dc0d57f).

SESIÓN 40 (19/08/2026 — N1 Práctica limpieza de campos + Prácticas legibles + Membresías fondo/ideal-para + N2/Ambos habilitados)
Commits: b149c8e, 3fc1cbe + cambios runtime (CMS bulk + settings)
GRUPO 1 — /cursos/n1-practica (b149c8e):
- Eliminados campos que NO están en el Google Form original: "¿A qué te dedicás? ¿Profesión?", "¿Con qué regularidad meditas?" y "¿Qué tipo de meditaciones?" (estados, arrays meditationOptions/medFrequencyOptions, restore localStorage, autosave, validación, enrollmentData y JSX).
- Sección "Prácticas" del acuerdo reescrita en párrafos claros (antes bullets que se leían como columnas): duración de encuentros, disponibilidad de Fer (Lun-Vie 13.30-20hs ARG + sábados), plazo 30 días, confidencialidad, encuentros adicionales.
- Fix placeholder roto con caracteres chinos ("Si经历的..." → "Si tuviste algún episodio...").
GRUPO 2 — /membresias (3fc1cbe + CMS bulk):
- Fondo nuevo: starfield uniforme sin núcleo brillante (reemplaza membresias-bg.webp galaxia con blanco concentrado que competía con el texto). WebP 71KB (antes 601KB).
- Bordes difuminados para integración con header y sección "Cómo suscribirte": gradientes top (h-24), bottom (h-56 con via), laterales (w-16/w-32) + overlay subido a bg-mystic-950/85 para legibilidad.
- Fix "Ideal para" vacío: la DB del CMS (memberships.tiers) tenía versión vieja sin idealFor/extendedDescription → actualizada via PUT /api/cms/content/bulk con los valores del código. Verificado: las 3 membresías muestran idealFor.
GRUPO 3 — Form toggles (runtime):
- Habilitados n2-completo y ambos (estaban en false/pausados). Estado final forms: lecturas✅ n1-teorico❌ n1-con-practica✅ n2-completo✅ ambos✅ membresias✅ tienda❌.

SESIÓN 41 (19/08/2026 — DTP global: auditoría y normalización tipográfica completa)
Commit: b4867eb (14 archivos)
Auditoría de 35 archivos TSX → normalización aplicada:
GRUPO 1 — Jerarquía de títulos unificada:
- H1 estándar en TODO el sitio: text-2xl sm:text-3xl md:text-4xl · font-semibold · serif · text-foreground. Ajustados: membresias (4xl-6xl→ estándar), mentorias (text-white→foreground), aula dashboard/login/registro (sin semibold y escalas fijas→estándar), recuperar/reset y payment/success (faltaba md:text-4xl y semibold), not-found.
- H2 de secciones de membresias: 2xl-4xl violet-400 → text-xl sm:text-2xl md:text-3xl · text-foreground (un paso bajo el H1, mismo color que el resto del sitio).
- H3 de secciones de /lecturas: text-lg sin peso → text-base font-semibold violet-300 (patrón de acuerdos de cursos).
GRUPO 2 — Botones: CTAs siempre sans. Removido font-serif del submit de /lecturas y del botón primario del hero de la home.
GRUPO 3 — Gold residual eliminado (la paleta del sitio es violeta desde S33/S36):
- Hover del botón "Volver" en layouts de /cursos, /membresias, /mentorias: gold → violet.
- Checkbox de aceptación de /mentorias: checked gold → violet-500.
- /not-found: icono y 404 gold-400/bold → violet-400/semibold.
- Orbe decorativo de /aula/registro: gold → violet.
- Aula dashboard: tipo "Mentoría" gold → AMBER (mantiene la diferenciación por tipo: curso=azul, lectura=violeta, mentoría=ámbar). 7 lugares: typeConfig, stats card, iconos, badge, hover de card próxima sesión.
Resultado: 0 clases gold en el sitio público; escalas tipográficas coherentes (H1 2xl→4xl en todas las páginas, H2 de sección, H3 de subsección).
