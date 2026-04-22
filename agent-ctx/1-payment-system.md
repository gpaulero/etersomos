# Task 1-8: Payment System Implementation for Eter Somos

## Summary
Rebuilt the complete payment system for the spiritual website "Eter Somos" after an accidental version restore.

## Files Created

### Payment Libraries
- `/src/lib/pricing.ts` - Centralized crystal/reading/course prices in ARS and USD
- `/src/lib/paypal.ts` - PayPal REST API v2 integration (order create + capture)
- `/src/lib/mercadopago.ts` - MercadoPago SDK integration (preference create)

### API Routes
- `/src/app/api/payments/create-paypal/route.ts` - POST: creates PayPal order from cart
- `/src/app/api/payments/create-mercadopago/route.ts` - POST: creates MP preference from cart
- `/src/app/api/payments/capture-paypal/route.ts` - POST: captures PayPal payment
- `/src/app/api/payments/confirm-order/route.ts` - POST: saves order to DB + sends admin email

### Pages
- `/src/app/payment/success/page.tsx` - Payment success/processing/error page

## Files Modified

### Database
- `/prisma/schema.prisma` - Added `CrystalOrder` model

### Frontend
- `/src/app/page.tsx` - Major modifications:
  - Added checkout form state + validation
  - Added `saveCheckoutSession` function (localStorage)
  - Added `handlePayWithPayPal` and `handlePayWithMercadoPago` functions
  - Replaced WhatsApp checkout button with "Pagar" button → checkout dialog
  - Added crystal buyer form dialog with all shipping fields
  - Added trust badges (Pago seguro, Datos encriptados, Plataformas verificadas)
  - Added security badge text near payment buttons
  - Added Lock, CreditCard, Landmark icon imports

### Packages
- Installed `mercadopago` and `resend` packages

## Environment Variables Required
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret
- `PAYPAL_MODE` - sandbox|live (default: sandbox)
- `MERCADOPAGO_ACCESS_TOKEN` - MP access token
- `NEXT_PUBLIC_BASE_URL` - Base URL (default: https://etersomos.vercel.app)
- `ADMIN_EMAIL` - Admin email (default: etersomos@gmail.com)
- `RESEND_API_KEY` - Resend API key for email notifications

## Key Design Decisions
- PayPal uses USD, MercadoPago uses ARS
- Checkout session stored in localStorage before redirect
- Success page reads session, captures PayPal if needed, confirms order via API
- Admin email uses Resend with beautiful HTML template matching mystic theme
- All existing functionality (bookings, admin panel) preserved
