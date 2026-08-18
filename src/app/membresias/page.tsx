"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Toaster } from "sonner";
import { cmsValue, cmsJson } from "@/lib/cms-helpers";
import { useSiteContent } from "@/hooks/use-site-content";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FormPausedBanner from "@/components/form-paused-banner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Star,
  CreditCard,
  Mail,
  Check,
  ChevronDown,
  Heart,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Info,
  Loader2,
  User,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               ANIMATION VARS                               */
/* -------------------------------------------------------------------------- */

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* -------------------------------------------------------------------------- */
/*                            SECTION WRAPPER                                 */
/* -------------------------------------------------------------------------- */

function AnimatedSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MEMBERSHIP DATA                               */
/* -------------------------------------------------------------------------- */

interface MembershipTier {
  id: string;
  emoji: string;
  emojiImage?: string;
  name: string;
  price: string;
  frequency: string;
  description: string;
  extendedDescription: string;
  benefits: string[];
  idealFor: string;
  purpose: string;
  featured: boolean;
  badge?: string;
  mercadoPagoUrl: string;
  paypalUrl: string;
}

const memberships: MembershipTier[] = [
  {
    id: "raiz-de-luz",
    emoji: "🌱",
    emojiImage: "/images/membresia-emoji-1.png",
    name: "Raíz de Luz",
    price: "$5.000 AR / $5 USD",
    frequency: "2 envíos mensuales (uno cada 15 días)",
    description:
      "En esta suscripción recibirás contenido para reconectar con tu esencia, cultivar presencia y claridad interior. Cada envío alterna entre meditaciones guiadas y mensajes canalizados, acompañados por ejercicios simples y recomendaciones energéticas para aplicar en tu vida diaria.",
    extendedDescription:
      "Raíz de Luz, es la estructura, la base en lo humano. Abarca conexión/activaciones en chakras estrella de gaia, chakra raíz, y/o ombligo. Para poder encarnar al humano solar, cristalino, hay que limpiar, hacer lugar, cultivar la decisión de caminar la espiritualidad con todo lo que eso implica. Sin base, sin soporte, el potencial estelar propio, no puede mantenerse estable acá en la vida 3D.",
    benefits: [
      "Una meditación guiada grabada (audio o video)",
      "Un mensaje canalizado o reflexión escrita",
      "Prácticas breves para integrar lo recibido",
      "Recomendaciones energéticas o lecturas inspiradoras",
    ],
    idealFor:
      "quienes desean dar los primeros pasos en su camino espiritual o reencontrarse con su luz interior desde la calma, la consciencia y la simplicidad.",
    purpose:
      "acompañarte a enraizar tu luz y recordar la conexión con tu alma desde la vida cotidiana.",
    featured: false,
    mercadoPagoUrl:
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=244c453d0452470484210074b35bc22d",
    paypalUrl:
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-3GR129136U5304800NEETONQ",
  },
  {
    id: "corazon-solar",
    emoji: "☀️",
    emojiImage: "/images/membresia-emoji-2.png",
    name: "Corazón Solar",
    price: "$10.000 AR / $8 USD",
    frequency: "3 envíos mensuales",
    description:
      "Incluye todo lo que recibís en Raíz de Luz, mantiene la misma base de contenidos, aunque con textos adaptados sosteniendo la intención de sintonizar con la energía del corazón y a una frecuencia más expansiva y crística.",
    extendedDescription:
      "Corazón Solar, es el nexo entre lo humano y el potencial estelar. Es la información que te permite acercarte más, reconocer con más claridad ese potencial que tenés. Abarca conexión/activaciones en el chakra del plexo solar, el cardíaco, la garganta, y la activación del corazón superior. La invitación es a seguir sanando, en especial aspectos del corazón, miedos albergados en él durante esta encarnación y en el Alma. La invitación es a sanar a través de la frecuencia crística /solar. Esto te permite pararte en tu intuición y empezar a integrar todo tus aspectos sutiles.",
    benefits: [
      "Una activación o meditación profunda (audio o video)",
      "Un mensaje canalizado extendido con guía de integración",
      "Ejercicios prácticos para apertura del corazón y expansión energética",
    ],
    idealFor:
      "quienes ya sienten el llamado a profundizar su conexión espiritual y vibracional, y desean integrar su crecimiento desde el corazón como templo de sabiduría y creación consciente.",
    purpose:
      "habitar el corazón como centro de expansión, alegría, amor y coherencia, irradiando desde allí una vibración de unidad y propósito.",
    featured: true,
    badge: "Más Popular",
    mercadoPagoUrl:
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=13240468afc8434ca121abe2b0644ede",
    paypalUrl:
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-00D22712PA695974NNEETRWY",
  },
  {
    id: "puente-estelar",
    emoji: "🌌",
    emojiImage: "/images/membresia-emoji-3.png",
    name: "Puente Estelar",
    price: "$15.000 AR / $12 USD",
    frequency: "4 envíos mensuales (uno por semana)",
    description:
      "Incluye todo lo que recibís en Corazón Solar, mantiene la misma base de contenidos, aunque con textos adaptados, sosteniendo la intención de elevar la frecuencia hacia la conexión con guías y sabidurías estelares. Los textos y canalizaciones se adaptan a una vibración más cósmica y de propósito colectivo o planetario.",
    extendedDescription:
      "Puente Estelar, es la vía directa a aspectos superiores del humano encarnado. Abarca conexión/activaciones en el chakra tercer ojo, corona, estrella del alma y chakra del portal estelar. Abordamos la conexión con la Fuente Creador Creadora y el Plan Divino. Toda la info canalizada para este espacio 'Está más allá que acá', sin embargo la persona que lo recibe sabe como traerlo hacia la 3D.",
    benefits: [
      "Una canalización o activación de alta frecuencia (audio o video)",
      "Un mensaje de guías o maestros estelares con claves energéticas",
      "Un ejercicio de integración (meditación, journaling o anclaje de luz)",
      "Una reflexión o propuesta de servicio consciente",
    ],
    idealFor:
      "almas que ya caminan en consciencia y desean sostener su frecuencia desde la maestría y la unidad. Personas que ya son conscientes de su energía y de su multidimensión, la aceptan como natural y no reniegan ni dudan de ella.",
    purpose:
      "ser un canal estable y consciente en Luz, entre el cielo y la tierra, viviendo en coherencia con el cuerpo, el corazón, el Espíritu y la Fuente.",
    featured: false,
    mercadoPagoUrl:
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=3d3e910f53814b218026250694af5272",
    paypalUrl:
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-1TT73903VH987053VNEETSMA",
  },
];

const howToSteps = [
  {
    icon: Star,
    title: "Elegí la membresía",
    description: "Elegí la membresía que resuene con vos.",
  },
  {
    icon: Mail,
    title: "Dejá tu correo",
    description: "Completá tus datos en el formulario de inscripción.",
  },
  {
    icon: CreditCard,
    title: "Suscribite",
    description: "Realizá tu suscripción por MercadoPago o PayPal.",
  },
  {
    icon: Check,
    title: "¡Listo!",
    description:
      "¡Listo! Vas a recibir tus contenidos directamente en tu mail, según la frecuencia elegida.",
  },
];

/* -------------------------------------------------------------------------- */
/*                              MEMBERSHIP CARD                               */
/* -------------------------------------------------------------------------- */

function MembershipCard({ tier, perMonth }: { tier: MembershipTier; perMonth: string }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  return (
    <motion.div variants={staggerItem} className="flex">
      <Card
        className={`relative flex flex-col h-full w-full transition-all duration-500 border-mystic-700/30 ${
          tier.featured
            ? "md:scale-105 ring-1 ring-violet-400/30 bg-gradient-to-b from-mystic-900/90 to-mystic-950/90"
            : "glass"
        }`}
      >
        {/* Featured glow pulse */}
        {tier.featured && (
          <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-b from-violet-400/20 via-violet-400/5 to-transparent pointer-events-none animate-pulse opacity-60" />
        )}

        {/* Badge */}
        {tier.badge && (
          <div className="mx-auto pt-5 relative z-10">
            <Badge className="font-serif font-semibold px-3 py-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-400/30">
              <Sparkles className="size-3 mr-1" />
              {tier.badge}
            </Badge>
          </div>
        )}

        <CardHeader className="text-center relative z-10 pt-4 pb-0">
          <div className="mb-2 flex justify-center">
            {tier.emojiImage ? (
              <img src={tier.emojiImage} alt={tier.name} className="w-14 h-14 object-contain" />
            ) : (
              <span className="text-4xl">{tier.emoji}</span>
            )}
          </div>
          <h3 className="text-2xl font-serif font-semibold text-violet-300">
            {tier.name}
          </h3>
          <div className="flex justify-center mt-2">
            <Badge
              variant="outline"
              className="border-mystic-600/50 text-foreground/50 text-xs font-normal"
            >
              {tier.frequency}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex-1 pt-4 pb-0">
          {/* Price */}
          <div className="text-center mb-5">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-violet-300">
              {tier.price}
            </span>
            <p className="text-xs text-foreground/40 mt-1">{perMonth}</p>
          </div>

          <Separator className="bg-mystic-800/30 mb-5" />

          {/* Description */}
          <p className="text-sm text-foreground/60 leading-relaxed mb-5">
            {tier.description}
          </p>

          {/* Extended Description (Collapsible) */}
          <Collapsible open={open} onOpenChange={setOpen} className="mb-5">
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-violet-400/80 hover:text-violet-300 transition-colors mx-auto">
              <span>{open ? "Ver menos" : "Ver más detalles"}</span>
              <ChevronDown
                className={`size-3.5 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="p-4 rounded-lg bg-mystic-900/40 border border-mystic-700/20">
                <p className="text-sm text-foreground/50 leading-relaxed italic">
                  &ldquo;{tier.extendedDescription}&rdquo;
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="bg-mystic-800/30 mb-5" />

          {/* Benefits */}
          <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
            Qué recibirás en cada envío:
          </h4>
          <ul className="space-y-2 mb-5">
            {tier.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm text-foreground/70"
              >
                <Check className="size-4 text-violet-400 shrink-0 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>

          <Separator className="bg-mystic-800/30 mb-5" />

          {/* Ideal For */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-1.5">
              Ideal para
            </p>
            <p className="text-sm text-foreground/50 leading-relaxed">
              {tier.idealFor}
            </p>
          </div>

          {/* Purpose */}
          <div className="mb-2">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-1.5">
              Propósito
            </p>
            <p className="text-sm text-foreground/50 leading-relaxed">
              {tier.purpose}
            </p>
          </div>
        </CardContent>

        <CardFooter className="relative z-10 flex-col gap-3 pt-6 pb-6">
          {!formSubmitted ? (
            /* -- Subscriber Form -- */
            <div className="w-full space-y-3">
              <p className="text-xs text-foreground/50 text-center mb-1">
                Completá tus datos para suscribirte
              </p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/30" />
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-mystic-900/60 border border-mystic-700/30 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/20 transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/30" />
                <input
                  type="email"
                  placeholder="Tu email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-mystic-900/60 border border-mystic-700/30 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/20 transition-colors"
                />
              </div>
              {formError && (
                <p className="text-xs text-red-400/80 text-center">
                  {formError}
                </p>
              )}
              <Button
                onClick={async () => {
                  setFormError("");
                  if (!formData.name.trim()) {
                    setFormError("Ingresá tu nombre");
                    return;
                  }
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(formData.email)) {
                    setFormError("Ingresá un email válido");
                    return;
                  }
                  setFormLoading(true);
                  try {
                    const res = await fetch(
                      "/api/memberships/subscribe",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: formData.name.trim(),
                          email: formData.email.trim(),
                          membershipId: tier.id,
                          membershipName: tier.name,
                        }),
                      }
                    );
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.error || "Error al registrar");
                    }
                    setFormSubmitted(true);
                  } catch (err) {
                    setFormError(
                      err instanceof Error
                        ? err.message
                        : "Error al registrar"
                    );
                  } finally {
                    setFormLoading(false);
                  }
                }}
                disabled={formLoading}
                className="w-full font-semibold rounded-full py-3 text-sm transition-all duration-300 hover:scale-[1.02] bg-foreground text-background hover:bg-foreground/90"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Continuar al pago"
                )}
              </Button>
            </div>
          ) : (
            /* -- Payment Buttons (shown after form) -- */
            <div className="w-full space-y-5">
              <p className="text-xs text-foreground/40 font-sans text-center mb-3">
                Tu suscripción se renueva automáticamente cada mes. Podés cancelarla cuando quieras.
              </p>
              <div className="flex items-center gap-2 justify-center mb-2">
                <Check className="size-4 text-violet-400" />
                <p className="text-xs text-violet-400/80">
                  {formData.name} — {formData.email}
                </p>
              </div>

              {/* MercadoPago Button */}
              <a
                href={tier.mercadoPagoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-foreground hover:bg-foreground/80 text-background font-semibold rounded-full py-4 text-sm transition-all duration-300 hover:scale-[1.02]">
                  <CreditCard className="size-4 mr-2" />
                  Suscribirse con MercadoPago
                  <ExternalLink className="size-3 ml-1.5" />
                </Button>
              </a>

              {/* PayPal Button */}
              <a
                href={tier.paypalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full font-semibold rounded-full py-4 text-sm transition-all duration-300 hover:scale-[1.02] border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground">
                  Suscribirse con PayPal
                  <ExternalLink className="size-3 ml-1.5" />
                </Button>
              </a>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function MembresiasPage() {
  /* ---- Form pause state ---- */
  const [formPaused, setFormPaused] = useState(false);
  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setFormPaused(data.forms?.membresias === false))
      .catch(() => {});
  }, []);

  /* ---- CMS content ---- */
  const { cmsMap } = useSiteContent();
  const cmsTiers = cmsJson<MembershipTier[]>(cmsMap, 'memberships.tiers', memberships);

  /* ---- Floating stars ---- */
  const [starsCount, setStarsCount] = useState(20);
  useEffect(() => {
    setStarsCount(window.innerWidth < 640 ? 8 : 20);
  }, []);
  const stars = Array.from({ length: starsCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#161310",
            color: "#f0ebe5",
            border: "1px solid #2a252066",
            fontFamily: "var(--font-josefin), sans-serif",
          },
        }}
      />

      {/* Pause banner for membresías */}
      {formPaused && <FormPausedBanner formKey="membresias" />}

      {/* ============================================================ */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background Image — starfield uniforme sin núcleo brillante (S40) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/membresias-bg.webp')" }}
        />

        {/* Dark overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-mystic-950/85" />

        {/* Bordes difuminados — integración con header y sección "Cómo suscribirte" */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-mystic-950 to-transparent z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-mystic-950 via-mystic-950/80 to-transparent z-[1]" />
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-mystic-950/90 to-transparent z-[1]" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-mystic-950/90 to-transparent z-[1]" />

        {/* Floating stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-violet-300 animate-twinkle pointer-events-none"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-foreground tracking-wider mb-4"
            >
              {cmsValue(cmsMap, 'membresias_section.title', 'Membresías Eter Somos')}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl sm:text-2xl text-violet-400 font-serif font-light mb-6"
            >
              Tres caminos de conexión y expansión espiritual
            </motion.p>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed"
            >
              Elegí la frecuencia que más resuene con tu momento interior y
              recibí contenido exclusivo directamente en tu correo cada mes. La
              renovación es automática mes a mes, y podrás
              cancelarla en cualquier momento, sin compromiso. Para cancelar, entrá a tu cuenta desde MercadoPago o PayPal y desactivá la renovación automática.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*                    HOW TO SUBSCRIBE                            */}
      {/* ============================================================ */}
      <AnimatedSection className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-violet-400 mb-4">
              ¿Cómo suscribirte?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToSteps.map((step, idx) => (
              <motion.div key={step.title} variants={staggerItem}>
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-mystic-800/60 border border-mystic-700/30 flex items-center justify-center mb-3">
                    <step.icon className="size-6 text-violet-400" />
                  </div>
                  <span className="inline-block text-xs text-foreground/30 font-semibold mb-1.5">
                    PASO {idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground/80 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                     PRICING CARDS                              */}
      {/* ============================================================ */}
      <AnimatedSection className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-violet-400 mb-4">
              Elegí tu camino
            </h2>
            <p className="text-foreground/50 max-w-2xl mx-auto text-base">
              Cada membresía te acompaña en una etapa distinta de tu viaje
              interior. No hay un camino mejor que otro: solo aquel que resuena
              con tu momento presente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-stretch">
            {cmsTiers.map((tier) => (
              <MembershipCard key={tier.id} tier={tier} perMonth={cmsValue(cmsMap, 'membresias_section.per_month', 'por mes')} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                     IMPORTANT NOTE                             */}
      {/* ============================================================ */}
      <AnimatedSection className="py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={staggerItem}>
            <div className="p-5 sm:p-6 rounded-xl bg-violet-500/5 border border-violet-400/15">
              <div className="flex items-start gap-3">
                <Info className="size-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-violet-300 mb-2">
                    Nota importante sobre tu suscripción
                  </p>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    Tu suscripción queda completa una vez que hayas realizado tu
                    pago en MercadoPago o PayPal, y no solo al completar
                    este formulario. Luego de suscribirte podés enviar
                    comprobante por WhatsApp o mail.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                     FAQ / CONTACT                              */}
      {/* ============================================================ */}
      <AnimatedSection className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-violet-400 mb-4">
              ¿Te quedaron dudas?
            </h2>
            <p className="text-foreground/50 max-w-xl mx-auto text-base">
              Estamos acá para acompañarte. Escribinos y te responderemos con
              gusto.
            </p>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass border-mystic-700/30">
              <CardContent className="pt-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <a
                    href="mailto:etersomos@gmail.com"
                    className="flex items-center gap-4 p-4 rounded-xl bg-mystic-900/40 border border-mystic-700/20 hover:border-violet-400/20 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors duration-300">
                      <Mail className="size-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 uppercase tracking-wider mb-0.5">
                        Email
                      </p>
                      <p className="text-sm text-foreground/80 group-hover:text-violet-300 transition-colors">
                        etersomos@gmail.com
                      </p>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/5493518629325"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-mystic-900/40 border border-mystic-700/20 hover:border-violet-400/20 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors duration-300">
                      <MessageCircle className="size-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 uppercase tracking-wider mb-0.5">
                        WhatsApp
                      </p>
                      <p className="text-sm text-foreground/80 group-hover:text-violet-300 transition-colors">
                        +54 9 3518 62-9325
                      </p>
                    </div>
                  </a>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-mystic-900/30 border border-mystic-700/15">
                  <p className="text-sm text-foreground/50 leading-relaxed text-center">
                    Una vez efectuada tu suscripción en MercadoPago o PayPal,
                    recibirás un mail de bienvenida y un material inicial de
                    apertura.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
}
