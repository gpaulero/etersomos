# ETÉR SOMOS - Especificación Completa del Proyecto
## (Archivo de referencia CRÍTICO - NO BORRAR)
## Última actualización: 2026-04-22

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
https://etersomos.vercel.app

## Proyecto Vercel
- ID: prj_UILXUZpkaP07581Na4u1bVlUEHwf
- Nombre: etersomos
- Dominio: etersomos.vercel.app (verificado)

---

## CREDENCIALES Y CONFIGURACIÓN

### Vercel Token
- Token: vcp_5XNIPInepU47WBs7glwu7xnzKUXIqMI22TTfcHrYJ6vNtNLUYb0MqFg8

### Resend (Emails)
- API Key: re_b4aFipRM_oxZi3EDGhLfZBMYsWTJfyD9x
- Admin Email: etersomos@gmail.com
- Estado: SANDBOX (solo envía a emails verificados en Resend)
- Nota: Hay que configurar dominio custom para enviar a cualquier email

### PayPal
- Modo: SANDBOX (testeo)
- Client ID: AVaPPW1_KcO2OPxxY2TLYirYmtEWnPGeH5bkRzoXFeWNZiOekEuNxmtB7vX6vHM7OqC5gEg_QlFWpwAh
- Secret: EN6Xk7l41V-p2stgF9iStzHcRgTFl6DfA-sqQCidMA5nWvLW1grZUJVsYhAuNq1nuYYGX_JbTRzaEWlY

### MercadoPago (PRODUCCIÓN)
- Access Token: APP_USR-6220685525330739-042121-2b5a0e70065b2a840f83dbb680c874db-3350937487
- Public Key: APP_USR-3fc1b00e-2d7e-4b78-99bc-75585ba37943

### Turso DB
- URL: libsql://etersomos-db-gpaulero.aws-us-east-1.turso.io

### Git (para commits)
- Nombre: gpaulero
- Email: gpaulero@gmail.com (DEBE coincidir con GitHub account para que Vercel no bloquee el deploy)

---

## VARIABLES DE ENTORNO (Vercel) - VERIFICAR SIEMPRE

**IMPORTANTE**: Estas variables se han borrado solas entre sesiones. Siempre verificar que estén configuradas:

### Requieren configuración manual (NO vienen de npm install):
- RESEND_API_KEY=re_b4aFipRM_oxZi3EDGhLfZBMYsWTJfyD9x (production + preview)
- ADMIN_EMAIL=etersomos@gmail.com (production + preview)
- DATABASE_URL=libsql://etersomos-db-gpaulero.aws-us-east-1.turso.io (production)
- DATABASE_AUTH_TOKEN=<verificar con Turso CLI> (production)

### Vienen del archivo .env:
- PAYPAL_CLIENT_ID (production, preview, development)
- PAYPAL_CLIENT_SECRET (production, preview, development)
- PAYPAL_MODE=sandbox (production, preview, development)
- MERCADOPAGO_ACCESS_TOKEN (production, preview, development)
- NEXT_PUBLIC_MP_PUBLIC_KEY (production, preview, development)
- NEXT_PUBLIC_BASE_URL=https://etersomos.vercel.app (production, preview, development)

---

## SECCIONES DEL SITIO

### 1. NAVBAR (fija arriba)
- Logo + "ETER SOMOS" a la izquierda
- Links: Inicio | Lecturas | Cursos | Cristales
- Icono de Instagram
- Icono de carrito (ShoppingBag) con badge de cantidad - SIEMPRE visible en navbar
- NO hay botón flotante de carrito abajo
- Menu hamburguesa en mobile con Sheet lateral

### 2. HERO SECTION (#inicio)
- Imagen de fondo con overlay oscuro
- Logo circular animado (float)
- Título: "Eter Somos"
- Subtítulo sobre Registros Akáshicos
- 2 botones: "Pedí tu Lectura" y "Ver Cristales"
- Indicador de scroll abajo

### 3. SOBRE LOS REGISTROS (#sobre)
- 3 cards: "Qué son", "Cómo funciona", "Beneficios"

### 4. LECTURAS (#lecturas)
- Card de "Lectura Akáshica Individual" con features
- Botón "Solicitar mi Lectura" → link a /lecturas (página dedicada con formulario completo)
- Precio: $18.000 ARS / US$20
- Badge de plazo: 5 días hábiles

### 5. CURSOS (#cursos)
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

### 6. CRISTALES / TIENDA (#cristales)
- Filtros por categoría (Todos, Amatista, Cuarzo Rosa, etc.)
- Grid de productos con imagen, nombre, precio, descripción
- Botón "Agregar al carrito"
- Carrito se abre desde navbar

### 7. TESTIMONIOS
- 3 cards con nombre, ubicación, testimonio, rating estrellas

### 8. FOOTER
- Links de navegación, Instagram, Copyright

### 9. BOTÓN "VOLVER ARRIBA"
- Flecha ArrowUp fija abajo a la derecha
- Solo se muestra al hacer scroll

---

## PÁGINAS DEDICADAS (formulario completo)

### /cursos/n1-teorico
- 1er Nivel Solo Teórico
- Contribución voluntaria (el alumno elige cuánto pagar)
- ~12 campos del formulario
- Incluye: nombre, email, teléfono, fecha nacimiento, nacionalidad, ciudad nacimiento, ciudad residencia, estado civil, nivel educativo, ocupación, motivación, consulta

### /cursos/n1-practica
- 1er Nivel con Práctica Incluida
- Precio: $35.000 ARS / US$30
- ~25 campos del formulario
- Incluye todo lo del teórico + WhatsApp, dirección, CP, provincia, país, experiencia previa, expectativas, disponibilidad horaria, modalidad preferida, dispositivos, motivación adicional, términos y condiciones

### /cursos/n2
- 2do Nivel Completo
- Precio: $45.000 ARS / US$45
- 10% de descuento si ya hizo el 1er nivel ($40.500 ARS / $40 USD)
- ~28 campos del formulario
- Incluye: todo lo anterior + certificado del 1er nivel, modalidad offline, consentimiento

### /cursos/ambos
- Ambos Cursos (1er + 2do Nivel)
- Precio: $70.000 ARS / US$55
- ~25 campos del formulario

### /lecturas
- Lectura Akáshica Individual
- Precio: $18.000 ARS / US$20
- ~21 campos del formulario
- Incluye: datos personales, fecha nacimiento, nacionalidad, ciudad, estado civil, datos de salud (enfermedad crónica, medicación, terapia psicológica/psiquiátrica), 2 preguntas al campo akáshico, contexto adicional, consentimiento

---

## PRECIOS ACTUALIZADOS

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

### Cristales:
1. Agregar al carrito → Abrir carrito desde navbar → "Pagar"
2. Dialog de datos de envío (nombre, email, teléfono, dirección, ciudad, provincia, CP, notas)
3. Elegir MercadoPago o PayPal
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

### Archivo: src/lib/email.ts
- `sendAdminNotification(params)` - Envia email detallado al admin
- `sendCustomerConfirmation(params)` - Envia confirmación al cliente

### Estado actual:
- Resend en modo sandbox → solo envía a emails verificados en Resend
- Para enviar a cualquier email → configurar dominio custom en Resend
- Sender: onboarding@resend.dev (sandbox)

---

## ARCHIVOS CLAVE

### Páginas
- src/app/page.tsx - Página principal (todo el sitio)
- src/app/payment/success/page.tsx - Página post-pago
- src/app/lecturas/page.tsx - Formulario completo de lectura
- src/app/cursos/n1-teorico/page.tsx - Formulario N1 Teórico
- src/app/cursos/n1-practica/page.tsx - Formulario N1 con Práctica
- src/app/cursos/n2/page.tsx - Formulario N2 Completo
- src/app/cursos/ambos/page.tsx - Formulario Ambos Cursos
- src/app/cursos/layout.tsx - Layout compartido de cursos
- src/app/layout.tsx - Layout raíz

### APIs
- src/app/api/payments/create-paypal/route.ts - Crear orden PayPal
- src/app/api/payments/create-mercadopago/route.ts - Crear preferencia MP
- src/app/api/payments/capture-paypal/route.ts - Capturar pago PayPal
- src/app/api/payments/confirm-order/route.ts - Confirmar orden (DB + emails)
- src/app/api/bookings/route.ts - CRUD reservas (admin panel)

### Librerías
- src/lib/pricing.ts - Precios centralizados
- src/lib/email.ts - Sistema de emails (admin + cliente)
- src/lib/course-payment.ts - Función de pago para cursos/lecturas
- src/lib/db.ts - Conexión Prisma/Turso
- src/lib/paypal.ts - Funciones PayPal
- src/lib/mercadopago.ts - Funciones MercadoPago

### Configuración
- prisma/schema.prisma - Schema de DB
- tailwind.config.ts - Configuración Tailwind
- next.config.ts - Configuración Next.js
- package.json - Dependencias
- .env - Variables de entorno locales

---

## TECNOLOGÍAS
- Next.js 16 (App Router, Turbopack), Tailwind CSS 4, shadcn/ui, Framer Motion
- Turso (libSQL) para DB, Resend para emails, Sonner (toasts)
- PayPal REST API (sandbox), MercadoPago Checkout Pro (producción)
- Prisma ORM, TypeScript, React 19

---

## PENDIENTES / FUTUROS
1. Configurar dominio custom en Resend para emails a cualquier destinatario
2. PayPal Live: pendiente hasta que Fernanda cree cuenta empresa
3. Optimizar SEO
4. Posible blog/contenidos adicionales

---

## NOTAS IMPORTANTES
- Todos los pagos van por la pasarela del sitio web, NUNCA por links externos
- El admin panel se abre con triple-click en el logo
- Los formularios de cursos y lecturas guardan en localStorage antes del pago
- Después del pago, se guarda en DB y se envían emails
- El sitio usa fuentes: Playfair Display + Josefin Sans
- Tema oscuro mystic con acentos dorados (gold-400)
