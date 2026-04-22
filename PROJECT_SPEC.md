# ETÉR SOMOS - Especificación del Proyecto
## (Archivo de referencia - NO BORRAR)

Este documento describe el estado actual y requerimientos del sitio web.
Siempre consultar antes de hacer cambios.

---

## URL Producción
https://etersomos.vercel.app

---

## SECCIONES DEL SITIO

### 1. NAVBAR (fija arriba)
- Logo + "ETER SOMOS" a la izquierda
- Links: Inicio | Lecturas | Cursos | Cristales
- Icono de Instagram
- **Icono de carrito (ShoppingBag)** con badge de cantidad - SIEMPRE visible en navbar, tanto desktop como mobile
- **NO hay botón flotante de carrito** abajo
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
- Botón "Reservar mi Lectura" que abre Dialog
- **Formulario de lectura**: nombre, email, teléfono, mensaje/pregunta
- Al enviar: guarda en localStorage y redirige a pago (MercadoPago / PayPal)
- Badge de plazo: 5 días hábiles

### 5. CURSOS (#cursos)
**IMPORTANTE**: 4 opciones de curso en grid (2x2 en desktop, 1 columna en mobile):

| ID | Nombre | Precio | Badge |
|----|--------|--------|-------|
| n1-teorico | Nivel 1 - Solo Teórico | $25.000 | sin badge |
| n1-completo | Nivel 1 - Completo | $45.000 | "Más Elegido" |
| n2-completo | Nivel 2 - Completo | $55.000 | sin badge |
| ambos-cursos | Nivel 1 + Nivel 2 | $85.000 | "Mejor Precio" (tachado $100.000) |

Cada card muestra: nombre, descripción, duración, precio, features, botón "Inscribirme".
Al hacer clic abre **Dialog de inscripción** con:
- Nombre, Email, Teléfono (obligatorios)
- Mensaje/consulta (opcional)
- Botones de pago: MercadoPago + PayPal
- Trust badges
- Flujo: formulario → localStorage → pago → success page → DB + email admin

### 6. CRISTALES / TIENDA (#cristales)
- Filtros por categoría (Todos, Amatista, Cuarzo Rosa, etc.)
- Grid de productos con imagen, nombre, precio, descripción
- Botón "Agregar al carrito" (NO "Comprar por WhatsApp")
- Carrito se abre desde navbar

### 7. TESTIMONIOS
- 3 cards con nombre, ubicación, testimonio, rating estrellas

### 8. FOOTER
- Links de navegación
- Instagram
- Copyright

### 9. BOTÓN "VOLVER ARRIBA"
- Flecha ArrowUp fija abajo a la derecha
- Solo se muestra al hacer scroll (navScrolled)
- **NO debe superponerse con nada** (no hay carrito flotante)

---

## ELEMENTOS ADICIONALES

### Carrito (Sheet lateral desde navbar)
- Lista de items con imagen, nombre, precio, +/- cantidad, eliminar
- Total
- Botón "Pagar" → abre Dialog de checkout con datos de envío
- Trust badges: "Pago seguro", "Datos encriptados", "Plataformas verificadas"

### Checkout Dialog (para cristales)
- Nombre, Email, Teléfono, Dirección, Ciudad, Provincia, Código Postal, Notas
- Botones: MercadoPago + PayPal

### Admin Panel (triple-click en logo)
- Lista de reservas con filtros por estado
- Cambiar estado, eliminar reservas

---

## FLUJO DE PAGO

### Cristales:
1. Agregar al carrito
2. Abrir carrito desde navbar
3. "Pagar" → Dialog de datos de envío
4. Elegir MercadoPago o PayPal
5. Se guarda en localStorage (checkoutSession_ID)
6. Redirige a plataforma de pago
7. Página de éxito lee localStorage → llama a /api/bookings/confirm-order
8. Se guarda en DB Turso + se envía email al admin

### Cursos:
1. Elegir opción → "Inscribirme"
2. Dialog con datos del alumno
3. Elegir MercadoPago o PayPal
4. Se guarda en localStorage (checkoutSession_ID) con type: "course_enrollment"
5. Redirige a plataforma de pago
6. Página de éxito → confirm-order

### Lecturas:
1. "Reservar mi Lectura" → Dialog
2. Completar formulario
3. Elegir pago → mismo flujo localStorage

---

## ARCHIVOS CLAVE

- `src/app/page.tsx` - Página principal (TODO el sitio)
- `src/app/payment/success/page.tsx` - Página post-pago
- `src/app/api/payments/create-paypal/route.ts` - Crear orden PayPal
- `src/app/api/payments/create-mercadopago/route.ts` - Crear preferencia MP
- `src/app/api/payments/capture-paypal/route.ts` - Capturar pago PayPal
- `src/app/api/payments/confirm-order/route.ts` - Confirmar orden post-pago
- `src/app/api/bookings/route.ts` - CRUD reservas (admin)
- `lib/pricing.ts` - Precios USD/ARS
- `lib/paypal.ts` - Funciones PayPal
- `lib/mercadopago.ts` - Funciones MercadoPago

---

## VARIABLES DE ENTORNO (Vercel)
- PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE=sandbox
- MERCADOPAGO_ACCESS_TOKEN, NEXT_PUBLIC_MP_PUBLIC_KEY
- DATABASE_URL (Turso), RESEND_API_KEY, ADMIN_EMAIL
- NEXT_PUBLIC_BASE_URL=https://etersomos.vercel.app
- TURSO_AUTH_TOKEN

---

## TECNOLOGÍAS
- Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, Framer Motion
- Turso (libSQL), Resend (emails), Sonner (toasts)
- PayPal REST API (sandbox), MercadoPago Checkout Pro (producción)
