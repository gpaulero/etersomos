# ETÉR SOMOS - Especificación Completa del Proyecto
## (Archivo de referencia CRÍTICO - NO BORRAR)
## Última actualización: 2026-04-24 (Session 6 — Limpieza de código + Backups)

Este documento describe TODO el estado actual, credenciales, estructura y requisitos del sitio web.
**Siempre consultar antes de hacer cambios.**

### REGLA OBLIGATORIA - GIT BACKUP
**DESPUÉS DE CADA CAMBIO (por más chico que sea), hacer git commit inmediatamente.**
No esperar a que el usuario lo pida. Todo cambio a cualquier archivo = commit.
Comando: `git add -A && git -c user.name="gpaulero" -c user.email="gpaulero@gmail.com" commit -m "descripcion del cambio"`
IMPORTANTE: Usar SIEMPRE gpaulero@gmail.com como email de git. NO usar etersomos@gmail.com porque no está vinculado a GitHub y Vercel bloquea el deploy.
Esto asegura que nunca se pierda trabajo entre sesiones.

---

## URL Producción
https://etersomos-iota.vercel.app

## Proyecto Vercel
- ID: prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY
- Org ID: team_LvzyzJEg1ssYCZ0GgvvVmZMH
- Nombre: etersomos
- Dominio: etersomos-iota.vercel.app (verificado)
- GitHub Repo ID: 1217270869 (necesario para deploy via API)

## Repositorio GitHub
- URL: https://github.com/gpaulero/etersomos.git
- Visibilidad: PRIVADO (cambiado de público a privado el 23/04/2026)
- IMPORTANTE: El historial fue limpiado con git-filter-repo para eliminar secrets expuestos
- Los commits viejos fueron reescritos (force push) - los hashes cambiaron

---

## CREDENCIALES Y CONFIGURACIÓN

**TODAS las credenciales están en `.env.local` (archivo local, NO se commitea).**
Copiar `.env.example` a `.env.local` y completar los valores.
BACKUP de `.env.local` en: `/home/z/my-project/etersomos-backups/2026-04-23/env.local.backup`

### Vercel Token
- Ver variable `VERCEL_TOKEN` en `.env.local`

### Resend (Emails)
- Ver variables `RESEND_API_KEY` y `ADMIN_EMAIL` en `.env.local`
- Estado: SANDBOX (solo envía a emails verificados en Resend)
- Nota: Hay que configurar dominio custom para enviar a cualquier email

### PayPal
- Modo: SANDBOX (testeo)
- Ver variables `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` en `.env.local`
- **IMPORTANTE (24/04)**: PayPal NO se usa para cristales (producto físico, solo Argentina)
- PayPal se usa para: membresías (links de suscripción), cursos y lecturas (via PayPal.me personal: paypal.me/registrosakashicos9)
- La función `handlePayWithPayPal` fue eliminada de page.tsx (checkout de cristales)
- No se planea pasar a PayPal Business (decisión del usuario)

### MercadoPago (PRODUCCIÓN)
- Ver variables `MERCADOPAGO_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY` en `.env.local`

### Turso DB
- Ver variable `DATABASE_URL` en `.env.local`
- `DATABASE_AUTH_TOKEN`: obtener con `turso db tokens create etersomos-db-gpaulero`

### Git (para commits)
- Nombre: gpaulero
- Email: gpaulero@gmail.com (DEBE coincidir con GitHub account para que Vercel no bloquee el deploy)
- Repositorio: https://github.com/gpaulero/etersomos.git
- Ver variables `GITHUB_TOKEN`, `GITHUB_USER`, `GITHUB_EMAIL` en `.env.local`

---

## SEGURIDAD - SECRETS

### Estado actual (23/04/2026):
- TODAS las credenciales se guardan en `.env.local` (NO se commitea)
- `.env.example` contiene placeholders sin valores reales (SÍ se commitea)
- `.gitignore` tiene regla `!.env.example` para permitir el archivo de ejemplo
- El historial de git fue limpiado con `git-filter-repo` para eliminar:
  - Resend API Key del archivo `.env` que existía en commit viejo
  - Tokens de PayPal, MercadoPago, Vercel y GitHub que estaban en PROJECT_SPEC.md
- GitGuardian detectó la Resend API Key expuesta - RESUELTO: eliminada del historial completo
- Si se vuelve a exponer un secret: usar `git-filter-repo --blob-callback` para reemplazarlo y luego `git push --force`

### Comandos de emergencia para limpiar secrets:
```bash
cd /home/z/my-project/etersomos
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
Esto causó que el sitio mostrara "Servicio de email no configurado" cuando un usuario intentó suscribirse.
TODAS las funcionalidades del sitio (emails, pagos, DB) dejan de funcionar si las variables desaparecen.

**Verificar con este comando (desde el directorio del proyecto):**
```bash
cd /home/z/my-project/etersomos
source .env.local
curl -s "https://api.vercel.com/v10/projects/prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import sys, json
data = json.load(sys.stdin)
envs = data.get('envs', [])
print(f'Variables en Vercel: {len(envs)}')
for e in envs:
    print(f'  {e[\"key\"]}: {\"OK\" if e.get(\"value\") else \"VACIA\"}')
"
```

**Resultado esperado: 9 variables.** Si muestra 0 o menos de 9, EJECUTAR INMEDIATAMENTE el PASO 2.

### PASO 2: Restaurar variables (solo si faltan)

Ejecutar el script de restauración:
```bash
cd /home/z/my-project/etersomos
source .env.local
bash scripts/restore-vercel-env.sh
```

O manualmente con la API de Vercel:
```bash
cd /home/z/my-project/etersomos && source .env.local

create_env() {
  curl -s -X POST "https://api.vercel.com/v10/projects/prj_oW3VNypSr0K7xkv8dm0wBRQbXZGY/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$1\",\"value\":\"$2\",\"type\":\"$3\",\"target\":[\"production\",\"preview\"]}" > /dev/null 2>&1
  echo "OK: $1"
}

create_env "RESEND_API_KEY" "$RESEND_API_KEY" "encrypted"
create_env "ADMIN_EMAIL" "$ADMIN_EMAIL" "plain"
create_env "DATABASE_URL" "$DATABASE_URL" "encrypted"
create_env "PAYPAL_CLIENT_ID" "$PAYPAL_CLIENT_ID" "encrypted"
create_env "PAYPAL_CLIENT_SECRET" "$PAYPAL_CLIENT_SECRET" "encrypted"
create_env "PAYPAL_MODE" "$PAYPAL_MODE" "plain"
create_env "MERCADOPAGO_ACCESS_TOKEN" "$MERCADOPAGO_ACCESS_TOKEN" "encrypted"
create_env "NEXT_PUBLIC_MP_PUBLIC_KEY" "$NEXT_PUBLIC_MP_PUBLIC_KEY" "plain"
create_env "NEXT_PUBLIC_BASE_URL" "$NEXT_PUBLIC_BASE_URL" "plain"
```

### PASO 3: Redeploy (obligatorio después de recrear variables)

Las variables nuevas NO se aplican al deploy actual. Hay que forzar un nuevo deploy:
```bash
cd /home/z/my-project/etersomos && source .env.local
SHA=$(git rev-parse HEAD)
curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
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

### Las 9 variables que DEBEN estar siempre:

| Variable | Tipo | Valor |
|----------|------|-------|
| RESEND_API_KEY | encrypted | ver .env.local |
| ADMIN_EMAIL | plain | ver .env.local |
| DATABASE_URL | encrypted | ver .env.local |
| PAYPAL_CLIENT_ID | encrypted | ver .env.local |
| PAYPAL_CLIENT_SECRET | encrypted | ver .env.local |
| PAYPAL_MODE | plain | sandbox |
| MERCADOPAGO_ACCESS_TOKEN | encrypted | ver .env.local |
| NEXT_PUBLIC_MP_PUBLIC_KEY | plain | ver .env.local |
| NEXT_PUBLIC_BASE_URL | plain | https://etersomos-iota.vercel.app |

### Nota sobre DATABASE_AUTH_TOKEN:
- Obtener con: `turso db tokens create etersomos-db-gpaulero`
- No está en `.env.local` actualmente — se obtiene bajo demanda

---

## SECCIONES DEL SITIO

### 1. NAVBAR (fija arriba)
- Logo + "ETER SOMOS" a la izquierda
- Links: Inicio | Lecturas | Membresías | Cursos | Cristales
- Icono de Instagram
- Icono de carrito (ShoppingBag) con badge de cantidad - SIEMPRE visible en navbar
- NO hay botón flotante de carrito abajo
- Menu hamburguesa en mobile con Sheet lateral

### 2. HERO SECTION (#inicio)
- Imagen de fondo (hero-bg-v2.webp - foto real de Pexels, 5441x3661 → 2560x1440 WebP)
- Overlay oscuro bg-mystic-950/80
- Logo circular animado (float) con **opacidad al 85%** (opacity-85)
- Título: "Eter Somos"
- Subtítulo sobre Registros Akáshicos
- 2 botones: "Ver Membresías" (→ #membresias) y "Pedí tu Lectura" (→ /lecturas) con icono BookOpen
- Indicador de scroll abajo

### 3. SOBRE LOS REGISTROS (#sobre)
- 3 cards: "Qué son", "Cómo funciona", "Beneficios"

### 4. LECTURAS (#lecturas)
- Card de "Lectura Akáshica Individual" con features
- Botón "Solicitar mi Lectura" → link a /lecturas (página dedicada con formulario completo)
- Precio: $18.000 ARS / US$20
- Badge de plazo: 5 días hábiles

### 5. MEMBRESÍAS (#membresias)
- **IMPORTANTE (cambio 23/04)**: Los botones del index NO son de pago directo
- Cada tarjeta tiene un botón "Suscribirme a [nombre]" → redirige a `/membresias`
- Fondo: membresias-bg.webp (foto de nebulosa de Unsplash, 3840x2160 → 2560x1440 WebP)
- Overlay: bg-mystic-950/80
- 3 tarjetas con emojis personalizados (PNG, NO Unicode):
  - Raíz de Luz: /images/membresia-emoji-1.png ($5.000 AR / $5 USD)
  - Corazón Solar: /images/membresia-emoji-2.png ($10.000 AR / $8 USD) - Badge "Más Popular"
  - Puente Estelar: /images/membresia-emoji-3.png ($15.000 AR / $12 USD)
- Botones estética mystic: bg-foreground para sólido, variant="outline" para secundario

### 6. PÁGINA /membresías (DISEÑO DEDICADO)
- **Fondo**: membresias-bg.webp (mismo que la sección del index) con overlay mystic-950/80
- **Estrellas animadas** (twinkle) en el hero
- **Sección "Cómo suscribirte"** con 4 pasos:
  1. Elegí la membresía (Star)
  2. Dejá tu correo (Mail) - completar formulario de inscripción
  3. Suscribite (CreditCard) - MercadoPago o PayPal
  4. ¡Listo! (Check)
- **Tarjetas de membresía** (mismo diseño que index, con collapsible):
  - Emojis personalizados (mismos PNG que index)
  - Badge de frecuencia centrado (flex justify-center)
  - **FLUJO NUEVO**: Primero formulario, después botones de pago:
    1. Se muestran campos: nombre + email + botón "Continuar al pago"
    2. Al enviar → POST a /api/memberships/subscribe → email al admin
    3. Se reemplazan por botones de MP y PayPal (misma estética mystic del index)
    4. Confirmación: nombre y email del suscriptor con check dorado
  - Botones de pago con space-y-5 entre ellos y display:block en los links
- **Nota importante**: Texto sobre que la suscripción se completa al pagar en MP/PayPal
- **Contacto**: Email (etersomos@gmail.com) + WhatsApp (+54 9 3518 62-9325)
- **Layout propio** (layout.tsx): header con "Volver al inicio" + footer

### 7. CURSOS (#cursos)
Grid 2x2 en desktop, 1 columna en mobile:

| ID | Nombre | Precio ARS | Precio USD | Badge | Link |
|----|--------|-----------|-----------|-------|------|
| n1-teorico | 1er Nivel Solo Teórico | Voluntario | Voluntario | sin badge | /cursos/n1-teorico |
| n1-practica | 1er Nivel con Práctica | $35.000 | $30 | "Más Elegido" | /cursos/n1-practica |
| n2 | 2do Nivel Completo | $45.000 | $45 | sin badge | /cursos/n2 |
| ambos | Ambos Cursos | $70.000 | $55 | "Mejor Precio" | /cursos/ambos |

IMPORTANTE: Cada card lleva a su página dedicada con formulario completo de inscripción.
Los links de pago que estaban en los formularios originales de Google NO se usan.
TODOS los pagos pasan por la pasarela del sitio web (MercadoPago o PayPal).

### 8. CRISTALES / TIENDA (#cristales)
- Fondo: crystals-banner.webp (imagen cósmica oscura, 4000x2251 → 2560x1440 WebP, oscurecida para matchear estética mystic)
- Filtros por categoría (Todos, Amatista, Cuarzo Rosa, etc.)
- Grid de productos con imagen, nombre, precio, descripción
- Botón "Agregar al carrito"
- Carrito se abre desde navbar

### 9. TESTIMONIOS
- 3 cards con nombre, ubicación, testimonio, rating estrellas

### 10. FOOTER
- Links de navegación, Instagram, Copyright

### 11. BOTÓN "VOLVER ARRIBA"
- Flecha ArrowUp fija abajo a la derecha
- Solo se muestra al hacer scroll

---

## PÁGINAS DEDICADAS (formulario completo)

### /membresías (NUEVA - 23/04/2026)
- Página dedicada con diseño completo
- 3 tarjetas de membresía con formulario de suscriptor integrado
- API: POST /api/memberships/subscribe → envía email al admin con datos del suscriptor
- Archivos: src/app/membresias/page.tsx, src/app/membresias/layout.tsx
- Ver sección 6 arriba para detalles completos del flujo

### /cursos/n1-teorico
- 1er Nivel Solo Teórico
- Contribución voluntaria (el alumno elige cuánto pagar)
- ~12 campos del formulario

### /cursos/n1-practica
- 1er Nivel con Práctica Incluida
- Precio: $35.000 ARS / US$30
- ~25 campos del formulario

### /cursos/n2
- 2do Nivel Completo
- Precio: $45.000 ARS / US$45
- 10% de descuento si ya hizo el 1er nivel ($40.500 ARS / $40 USD)
- ~28 campos del formulario

### /cursos/ambos
- Ambos Cursos (1er + 2do Nivel)
- Precio: $70.000 ARS / US$55
- ~25 campos del formulario

### /lecturas
- Lectura Akáshica Individual
- Precio: $18.000 ARS / US$20
- ~21 campos del formulario

---

## PRECIOS ACTUALIZADOS

### Membresías (suscripción mensual)
| Membresía | Precio ARS | Precio USD | Frecuencia |
|-----------|-----------|-----------|-----------|
| Raíz de Luz | $5.000 | $5 | 2 envíos mensuales |
| Corazón Solar | $10.000 | $8 | 3 envíos mensuales |
| Puente Estelar | $15.000 | $12 | 4 envíos mensuales (semanal) |

### Cristales (ARS)
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
| Lectura Akáshica | $18.000 | $20 |
| N1 Solo Teórico | Voluntario | Voluntario |
| N1 con Práctica | $35.000 | $30 |
| N2 Completo | $45.000 | $45 |
| Ambos Cursos | $70.000 | $55 |

---

## FLUJO DE PAGO

### Membresías (NUEVO - 23/04/2026):
1. En el index, el botón "Suscribirme a [nombre]" redirige a /membresias
2. En /membresías, el usuario completa nombre + email en la tarjeta
3. Al enviar → POST /api/memberships/subscribe → email de notificación al admin
4. Aparecen los botones de MercadoPago y PayPal (estilo mystic)
5. El usuario elige y es redirigido a la plataforma de pago (links directos de suscripción)
6. IMPORTANTE: Las suscripciones usan links directos de suscripción de MP/PayPal (no pasan por API del sitio)
7. El admin recibe email con: nombre, email, membresía elegida, fecha/hora

### Cristales:
1. Agregar al carrito → Abrir carrito desde navbar → "Pagar"
2. Dialog de datos de envío (nombre, email, teléfono, dirección, ciudad, provincia, CP, notas)
3. **Solo MercadoPago** (producto físico, se vende solo en Argentina — sin PayPal)
4. Se guarda en localStorage (checkoutSession_ID)
5. Redirige a plataforma de pago
6. Página de éxito lee localStorage → llama a /api/payments/confirm-order (type: crystal_order)
7. Se guarda en DB Turso + se envía email al admin + email de confirmación al cliente

### Cursos:
1. Elegir curso → "Inscribirme" → página dedicada con formulario
2. Completar formulario completo
3. Elegir MercadoPago o PayPal
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

### Tipos de email:
1. **crystal_order**: "Nuevo pedido de cristales" → admin + confirmación al cliente
2. **course_enrollment**: "Nueva inscripción a curso" → admin + confirmación al cliente
3. **reading**: "Nueva solicitud de lectura" → admin + confirmación al cliente
4. **membership_subscription** (NUEVO - 23/04): "Nueva suscripción registrada" → solo al admin (etersomos@gmail.com)

### Archivos:
- src/lib/email.ts - Sistema de emails para cristales, cursos y lecturas
- src/app/api/memberships/subscribe/route.ts - Email de notificación de suscripción a membresía

### Estado actual:
- Resend en modo sandbox → solo envía a emails verificados en Resend
- Para enviar a cualquier email → configurar dominio custom en Resend
- Sender: onboarding@resend.dev (sandbox)

---

## IMÁGENES Y ASSETS

### Fondos de secciones:
| Archivo | Ubicación | Origen | Dimensiones |
|---------|-----------|--------|------------|
| hero-bg-v2.webp | public/ | Pexels (galaxia, 5441x3661) | 2560x1440 WebP |
| membresias-bg.webp | public/ | Unsplash (nebulosa, 3840x2160) | 2560x1440 WebP |
| crystals-banner.webp | public/ | Dark cosmic (4000x2251), oscurecida | 2560x1440 WebP |

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
- src/app/page.tsx - Página principal (todo el sitio, todas las secciones)
- src/app/membresias/page.tsx - Página dedicada de membresías con formulario
- src/app/membresias/layout.tsx - Layout de membresías (header volver + footer)
- src/app/payment/success/page.tsx - Página post-pago
- src/app/lecturas/page.tsx - Formulario completo de lectura
- src/app/cursos/n1-teorico/page.tsx - Formulario N1 Teórico
- src/app/cursos/n1-practica/page.tsx - Formulario N1 con Práctica
- src/app/cursos/n2/page.tsx - Formulario N2 Completo
- src/app/cursos/ambos/page.tsx - Formulario Ambos Cursos
- src/app/cursos/layout.tsx - Layout compartido de cursos
- src/app/layout.tsx - Layout raíz

### APIs - Públicas
- src/app/api/payments/create-paypal/route.ts - Crear orden PayPal
- src/app/api/payments/create-mercadopago/route.ts - Crear preferencia MP
- src/app/api/payments/capture-paypal/route.ts - Capturar pago PayPal
- src/app/api/payments/confirm-order/route.ts - Confirmar orden (DB + emails)
- src/app/api/memberships/subscribe/route.ts - Registro de suscriptor + email
- src/app/api/bookings/route.ts - GET/POST reservas de lecturas

### APIs - Admin Panel
- src/app/api/admin/stats/route.ts - GET estadísticas del dashboard
- src/app/api/admin/bookings/[id]/route.ts - PUT (cambiar estado/fecha) + DELETE (eliminar lectura)
- src/app/api/admin/orders/route.ts - GET listar pedidos (cristales + cursos)
- src/app/api/admin/orders/[id]/route.ts - PUT (cambiar estado) + DELETE (eliminar pedido)
- src/app/api/admin/memberships/route.ts - GET listar membresías
- src/app/api/admin/memberships/[id]/route.ts - PUT (cambiar estado) + DELETE (eliminar membresía)
- src/app/api/admin/contacts/route.ts - GET exportar contactos (CSV, por sección o todos)

### Librerías
- src/lib/pricing.ts - Precios centralizados
- src/lib/email.ts - Sistema de emails (admin + cliente) para cristales/cursos/lecturas
- src/lib/course-payment.ts - Función de pago para cursos/lecturas
- src/lib/db.ts - Conexión Prisma/Turso (Proxy dual-mode: Prisma local + libSQL producción)
- src/lib/paypal.ts - Funciones PayPal
- src/lib/mercadopago.ts - Funciones MercadoPago

### Configuración
- prisma/schema.prisma - Schema de DB
- tailwind.config.ts - Configuración Tailwind
- next.config.ts - Configuración Next.js
- package.json - Dependencias
- .env.local - Variables de entorno con credenciales reales (NO se commitea)
- .env.example - Template sin valores reales (SÍ se commitea)
- .gitignore - Incluye .env.local, permite .env.example con !.env.example

### Scripts
- scripts/restore-vercel-env.sh - Restaurar variables de entorno en Vercel (ejecutar si se borran)

---

## TECNOLOGÍAS
- Next.js 16 (App Router, Turbopack), Tailwind CSS 4, shadcn/ui, Framer Motion
- Turso (libSQL) para DB, Resend para emails, Sonner (toasts)
- PayPal REST API (sandbox), MercadoPago Checkout Pro (producción)
- Prisma ORM, TypeScript, React 19

---

## CAMBIOS REALIZADOS - SESIÓN 6 (24/04/2026 — Limpieza de código + Backups)

### Limpieza de código:
1. **Eliminado endpoint temporal**: `/api/admin/memberships/repair` (ya no necesario)
2. **Eliminado placeholder**: `/api/route.ts` (\"Hello World\" sin uso)
3. **Optimizado `/api/memberships/subscribe`**: Eliminado `ensureSchema()` que abría conexión duplicada a Turso
4. **Eliminado botón PayPal de cristales**: Producto físico, se vende solo en Argentina (MercadoPago)
5. **Eliminada función `handlePayWithPayPal`** de page.tsx (checkout de cristales) — -42 líneas

### Backups completos:
6. **Backup GitHub**: Repo sincronizado, todo commiteado y pusheado
7. **Backup Turso DB**: Dump SQL completo (4 tablas, 2 registros con datos)
8. **Backup .env.local**: Variables de entorno con credenciales reales
9. **Backup comprimido**: .tar.gz con código + dump DB + env vars + scripts
10. **PROJECT_SPEC.md actualizado**: Refleja todos los cambios de esta sesión

### Estado actual del proyecto:
- Código limpio sin endpoints innecesarios ni código muerto
- Cristales: solo MercadoPago (sin PayPal)
- Membresías: PayPal.me personal (paypal.me/registrosakashicos9) + MercadoPago
- Cursos/Lecturas: MercadoPago + PayPal.me personal
- DB Turso: 4 tablas, 2 registros (1 lectura + 1 curso)
- GitHub: sincronizado, repo privado
- Vercel: deploy en producción, 200 OK

---

## CAMBIOS REALIZADOS - SESIÓN 5 (24/04/2026 — PayPal Cleanup)

### PayPal Business → PayPal.me personal:
1. **Reemplazado PayPal REST API por PayPal.me** en toda la app
2. **`src/lib/course-payment.ts`**: Nueva función `openPayPalMe()` que abre paypal.me/registrosakashicos9
3. **Cursos (n1-practica, n2, ambos)**: Usan `initiateCoursePayment()` con PayPal.me link
4. **Lecturas**: Usan PayPal.me link en lugar de PayPal REST API
5. **`src/lib/paypal.ts`**: Mantenido por compatibilidad pero ya no se usa activamente
6. **`src/app/page.tsx` (cristales)**: Se mantuvo PayPal.me temporalmente (eliminado en sesión 6)

### Decisiones del usuario:
- No quiere pasar a PayPal Business
- Prefiere usar PayPal.me personal que ya tenía antes del sitio
- Cristales no necesitan PayPal (solo se venden en Argentina)

---

## CAMBIOS REALIZADOS - SESIÓN 4 (23/04/2026 — Admin Panel Kanban)

### Panel de Administración — Kanban Boards:
1. **Lecturas**: Tablero Kanban 3 columnas (Pendientes → En Proceso → Entregadas) con drag & drop
2. **Cristales**: Tablero Kanban 3 columnas (Pendiente Envío → Preparando → Entregado) con drag & drop
3. **Cursos**: Tablero Kanban 3 columnas (Inscritos → En Curso → Completados) con drag & drop
4. **Membresías**: Tablero Kanban 3 columnas (Activas → Pendientes → Vencidas) con drag & drop
5. **Normalización de estados**: Los estados de MercadoPago ("pagado") se mapean automáticamente a las columnas del Kanban
6. **Fechas en lecturas**: Se muestra fecha de entrada y fecha límite de entrega con badge "VENCIDA" si pasó

### Panel de Administración — Eliminar entradas:
7. **Botón eliminar en TODAS las secciones**: Icono de papelera en cada tarjeta
8. **Confirmación de doble click**: Evita eliminaciones accidentales
9. **APIs DELETE nuevas**: bookings/[id], orders/[id], memberships/[id]

### Panel de Administración — Exportar contactos:
10. **Botón "Descargar Mails" en cada sección**: Exporta CSV con nombre, email, fuente, fecha
11. **Botón "Exportar Todo" en header**: Descarga todos los contactos deduplicados
12. **API /api/admin/contacts**: Soporta ?type=bookings|crystals|courses|memberships|all

### Panel de Administración — APIs nuevas:
- PUT /api/admin/orders/[id] — Cambiar estado de cristales/cursos
- DELETE /api/admin/bookings/[id] — Eliminar lectura
- DELETE /api/admin/orders/[id] — Eliminar pedido
- DELETE /api/admin/memberships/[id] — Eliminar membresía (valida: activa, pendiente, cancelada, vencida)
- GET /api/admin/contacts?type=all — Exportar contactos para campañas de mailing

### Panel de Administración — Flujo Kanban por sección:

| Sección | Columna 1 | Columna 2 | Columna 3 | Estados válidos |
|----------|-----------|-----------|-----------|------------------|
| Lecturas | Pendientes | En Proceso | Entregadas | pendiente, en_progreso, entregada, cancelada |
| Cristales | Pendiente Envío | Preparando | Entregados | pendiente, preparando, entregado, cancelado |
| Cursos | Inscritos | En Curso | Completados | inscrito, en_curso, completado, cancelado |
| Membresías | Activas | Pendientes | Vencidas | activa, pendiente, cancelada, vencida |

### Notas sobre el admin panel:
- Acceso: URL directa /admin con contraseña "eter2024admin" (guardada en sessionStorage)
- El drag & drop usa HTML5 Drag API nativo (sin librerías externas)
- Las actualizaciones de estado son optimistas (refresca datos después de cada cambio)
- Los estados se normalizan al cargar: "pagado" → "pendiente" (cristales), "pagado" → "inscrito" (cursos)
- El CSV de contactos se deduplica por email y exporta la entrada más reciente

---

## CAMBIOS REALIZADOS - SESIÓN 3 (23/04/2026 — Admin Panel inicial)

### Panel de Administración — Dashboard inicial:
1. **Página /admin**: Dashboard completo con stats, tablas de datos
2. **Stats cards**: Total lecturas, cristales, cursos, membresías, ingresos totales
3. **Métodos de pago**: Breakdown por MercadoPago/PayPal
4. **Tabla de lecturas**: Lista completa con búsqueda y filtros
5. **API /api/admin/stats**: Estadísticas agregadas de todas las tablas
6. **API /api/admin/orders**: Listado de pedidos enriquecido (cristales + cursos separados)
7. **API /api/admin/memberships**: Listado de membresías con GET + PUT
8. **API /api/admin/bookings/[id]**: Actualizar estado y fecha de entrega
9. **Campo deliveryDate**: Agregado a ReadingBooking para fecha límite de entrega
10. **ensureSchema()**: Auto-migración de columnas nuevas en Turso

---

## CAMBIOS REALIZADOS - SESIÓN 23/04/2026 (Sesión 1 — Estética)

### Estética y branding:
1. Logo del hero con opacidad al 85% (opacity-85)
2. Corregido "EterSomos" → "Eter Somos" en toda la página (3 lugares: index hero, membresías hero, meta title)

### Membresías - Cambio mayor:
3. **Formulario de suscriptor**: Agregado nombre + email en cada tarjeta de /membresias
4. **API /api/memberships/subscribe**: Registra suscriptor y envía email al admin
5. **Flujo nuevo**: Formulario → validación → email al admin → botones de pago
6. **Index → /membresias**: Los botones del index redirigen a la página dedicada (no pago directo)
7. **Fondo de /membresías**: Cambiado a membresias-bg.webp (mismo que index, overlay 80%)
8. **Botones de pago**: Misma estética mystic del index (bg-foreground y variant outline)
9. **Separación entre botones**: space-y-5 + display:block en links
10. **Emojis personalizados**: Mismos PNG que el index en /membresías
11. **Badge de frecuencia**: Centrado con flex justify-center
12. **Pasos "Cómo suscribirte"**: Orden corregido (Paso 2: correo, Paso 3: suscribirte)

### Seguridad:
13. **Limpieza de historial git**: Eliminado .env con credenciales reales de todo el historial
14. **git-filter-repo**: Reemplazadas todas las keys expuestas (Resend, PayPal, MP, Vercel, GitHub)
15. **Force push**: Historial reescrito sin secrets
16. **Repositorio**: Cambiado de público a privado

---

## CAMBIOS REALIZADOS - SESIÓN 2 (24/04/2026 — Infraestructura)

### Infraestructura y estabilidad:
1. **URLs BASE_URL corregidas**: Cambiadas de `etersomos.vercel.app` a `etersomos-iota.vercel.app` en:
   - src/lib/mercadopago.ts
   - src/lib/paypal.ts
   - src/app/sitemap.ts
   - src/app/layout.tsx (metadataBase)
2. **Variables de entorno Vercel recreadas**: Todas las 9 variables se habían borrado solas
   - Reconfiguradas via API (production + preview)
   - Causó error "Servicio de email no configurado" en /membresias
3. **Deploy de producción forzado**: Variables nuevas requieren redeploy para tomar efecto
4. **Script de restauración creado**: `scripts/restore-vercel-env.sh` para restaurar variables rápido
5. **Checklist de inicio de sesión**: Agregado a PROJECT_SPEC.md con 4 pasos obligatorios
6. **Limpieza de archivos**: Commiteados permisos de archivos y eliminados uploads obsoletos

### Verificaciones realizadas:
- API /api/memberships/subscribe → {"success":true}
- Index, /membresias, /lecturas, /sitemap.xml → HTTP 200
- GitHub repo sync OK, working tree clean
- Código revisado: APIs de pagos, emails, membresías, confirm-order — sin errores

### Notas:
- Los emojis personalizados aún muestran el dibujo CON un cuadrado de fondo - pendiente de mejorar
- Los botones de pago de membresías usan links directos de suscripción de MP/PayPal (no pasan por API propia)
- Resend sigue en modo sandbox (solo envía a emails verificados en Resend)

---

## PENDIENTES / FUTUROS
1. Configurar dominio custom en Resend para emails a cualquier destinatario
2. ~~PayPal Live~~: NO requerido — se usa PayPal.me personal (paypal.me/registrosakashicos9)
3. Optimizar SEO (meta descriptions, alt text en imágenes, Google Search Console)
4. Posible blog/contenidos adicionales (mayor impacto en SEO orgánico)
5. ~~Mejorar emojis personalizados de membresías~~: RESUELTO en sesión anterior
6. Auth robusta para admin panel (actualmente solo sessionStorage + password hardcodeada)
7. Dominio custom para el sitio (etersomos.com u otro)
8. Notificaciones WhatsApp mejoradas (CallMeBot/Meta API)
9. Google Business Profile (gratuito, ayuda al SEO local)

## DECISIÓN DE ARQUITECTURA: Admin Panel

El admin panel está **en el mismo proyecto** que el sitio público bajo `/admin`. Esto es correcto porque:
- Comparte la misma DB, env vars, y librerías
- Es un panel pequeño/mediano, no una app separada
- Simplifica el deploy (un solo repo, un solo Vercel project)
- El acceso está protegido por contraseña

**No se recomienda separarlo** a menos que el panel crezca significativamente (múltiples usuarios, roles, permisos).

## BACKUPS

### Backup más reciente (24/04/2026):
- **GitHub**: https://github.com/gpaulero/etersomos (repo privado, main branch, commit 54f4a85)
- **DB Turso**: `/home/z/my-project/download/backups-2026-04-24/turso-db-dump.sql`
- **Env vars**: `/home/z/my-project/download/backups-2026-04-24/env.local.backup`
- **Backup completo**: `/home/z/my-project/download/backups-2026-04-24/etersomos-backup-completo.tar.gz`

### Crear nuevo backup manual:
```bash
# 1. Dump de DB (via Python REST API — turso CLI no disponible sin auth)
# Ver script en /home/z/my-project/download/backups-2026-04-24/

# 2. Backup de env vars
cp /home/z/my-project/etersomos/.env.local /home/z/my-project/download/env.local.backup

# 3. Backup completo del código fuente
cd /home/z && tar czf download/etersomos-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude="node_modules" --exclude=".next" --exclude="db/*.db" \
  eter-somos/

# 4. Sync con GitHub
cd /home/z/eter-somos && git add -A && git commit -m "backup" && git push origin main
```

### Estrategia de recuperación:
1. **Restaurar código**: Descomprimir backup → git init → push a GitHub → Vercel lo detecta y deploya
2. **Restaurar DB**: Turso tiene replicación automática (no se pierde). Si se pierde: recrear tablas con el dump SQL
3. **Restaurar env vars**: Usar script `scripts/restore-vercel-env.sh` o API de Vercel
4. **Redeploy**: Forzar deploy via API de Vercel con gitSource y repoId: 1217270869

### Nota: Turso CLI
- El CLI de Turso (`/home/z/.turso/turso`) requiere auth login que no funciona en este entorno (headless)
- Para dumps de DB: usar la API REST de Turso con DATABASE_AUTH_TOKEN del .env.local
- Ejemplo: `python3` con `urllib.request` al endpoint `https://etersomos-db-gpaulero.aws-us-east-1.turso.io/v2/pipeline`

---

## NOTAS IMPORTANTES
- Cristales se pagan SOLO con MercadoPago (producto físico, solo Argentina). No hay botón de PayPal.
- Membresías usan links directos de suscripción de MP y PayPal (no pasan por API propia).
- Cursos y lecturas pueden pagarse con MercadoPago o PayPal.me personal.
- El admin panel se accede en `/admin` con contraseña `eter2024admin`
- Los formularios de cursos y lecturas guardan en localStorage antes del pago
- Después del pago, se guarda en DB y se envían emails
- El sitio usa fuentes: Playfair Display + Josefin Sans
- Tema oscuro mystic con acentos dorados (gold-400)
- El nombre correcto es "Eter Somos" (con espacio), NO "EterSomos"
- Siempre que se necesite forzar deploy: usar API de Vercel POST /v13/deployments con gitSource y repoId: 1217270869
- Los fondos usan fotos REALES de alta resolución (Pexels/Unsplash), NO imágenes generadas por IA
- Para deploy via API, el repoId correcto es 1217270869 (puede cambiar si se recrea el repo)
- El deploy via API usa: `gitSource: { type: "github", repoId: 1217270869, ref: "main", sha: "<commit-sha>" }` con `target: "production"`
- La DB usa un Proxy JavaScript que imita PrismaClient sobre libSQL en producción (ver src/lib/db.ts)
- Los componentes UI son exclusivamente shadcn/ui primitives bajo src/components/ui/ (47 componentes)
- No hay componentes custom de aplicación — toda la UI está inline en los archivos de página
- El drag & drop del Kanban usa HTML5 Drag API nativo (sin librerías externas)
- Los estados de órdenes se normalizan al cargar: "pagado" → "pendiente"/"inscrito" según el tipo
