"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Check, Loader2, Sparkles, AlertTriangle, CreditCard, Landmark, DollarSign, User, Heart, MessageCircle, ArrowUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { initiateCoursePayment } from "@/lib/course-payment";
import FormPausedBanner from "@/components/form-paused-banner";
import { cmsValue, cmsNumber } from "@/lib/cms-helpers";
import { useSiteContent } from "@/hooks/use-site-content";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface FormErrors {
  [key: string]: string;
}

type PaymentMethod = "mercadopago" | "transferencia" | "paypal" | "western_union";

/* -------------------------------------------------------------------------- */
/*                               ANIMATION                                    */
/* -------------------------------------------------------------------------- */

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* -------------------------------------------------------------------------- */
/*                              MAIN PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function LecturasPage() {
  const [agreementOpen, setAgreementOpen] = useState(true);
  const [formPaused, setFormPaused] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { cmsMap } = useSiteContent();

  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    fechaNacimiento: "",
    telefono: "",
    nacionalidad: "",
    ciudadNacimiento: "",
    ciudadResidencia: "",
    enfermedadCronica: "",
    terapiaPsicologica: "",
    terapiaPsicologicaDuracion: "",
    terapiaPsiquiatrica: "",
    terapiaPsiquiatricaDuracion: "",
    medicacionPsiquiatrica: "",
    pregunta1: "",
    pregunta2: "",
    contextoAdicional: "",
    comoSeEntero: "",
    nombreRecomendo: "",
    paymentMethod: "" as PaymentMethod | "",
  });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setFormPaused(data.forms?.lecturas === false))
      .catch(() => {});
  }, []);

  // Auto-save to localStorage
  const FORM_KEY = "etersomos_lectura_form";

  // Restore form data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        if (parsed._termsAccepted) setTermsAccepted(true);
      }
    } catch {}
  }, []);

  // Auto-save on every change
  useEffect(() => {
    if (formData.email || formData.nombre) {
      localStorage.setItem(FORM_KEY, JSON.stringify({ ...formData, _termsAccepted: termsAccepted }));
    }
  }, [formData, termsAccepted]);

  // Progress stepper calculation
  const currentStep = useMemo(() => {
    const personalFilled = !!(formData.email && formData.nombre && formData.fechaNacimiento && formData.nacionalidad && formData.ciudadNacimiento && formData.ciudadResidencia);
    const healthFilled = !!(formData.enfermedadCronica && formData.terapiaPsicologica && formData.terapiaPsiquiatrica && formData.medicacionPsiquiatrica);
    const questionsFilled = !!(formData.pregunta1 && formData.pregunta2);
    const paymentFilled = !!formData.paymentMethod;
    if (paymentFilled) return 4;
    if (questionsFilled) return 3;
    if (healthFilled) return 2;
    if (personalFilled) return 1;
    return 0;
  }, [formData]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const router = useRouter();

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!formData.email.trim()) e.email = "Ingresá tu correo electrónico";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Ingresá un email válido";

    if (!formData.nombre.trim()) e.nombre = "Ingresá tu nombre y apellido completo";
    if (!formData.fechaNacimiento) e.fechaNacimiento = "Ingresá tu fecha de nacimiento";
    if (!formData.nacionalidad.trim()) e.nacionalidad = "Ingresá tu nacionalidad";
    if (!formData.ciudadNacimiento.trim()) e.ciudadNacimiento = "Ingresá tu ciudad de nacimiento";
    if (!formData.ciudadResidencia.trim()) e.ciudadResidencia = "Ingresá tu ciudad de residencia";
    if (!formData.enfermedadCronica.trim()) e.enfermedadCronica = "Este campo es requerido";
    if (!formData.terapiaPsicologica.trim()) e.terapiaPsicologica = "Seleccioná una opción";
    if (formData.terapiaPsicologica === "Sí" && !formData.terapiaPsicologicaDuracion.trim())
      e.terapiaPsicologicaDuracion = "Indicá cuánto tiempo";
    if (!formData.terapiaPsiquiatrica.trim()) e.terapiaPsiquiatrica = "Seleccioná una opción";
    if (formData.terapiaPsiquiatrica === "Sí" && !formData.terapiaPsiquiatricaDuracion.trim())
      e.terapiaPsiquiatricaDuracion = "Indicá cuánto tiempo";
    if (!formData.medicacionPsiquiatrica.trim()) e.medicacionPsiquiatrica = "Seleccioná una opción";
    if (!formData.pregunta1.trim()) e.pregunta1 = "Ingresá tu primera pregunta";
    if (!formData.pregunta2.trim()) e.pregunta2 = "Ingresá tu segunda pregunta";
    if (!formData.paymentMethod) e.paymentMethod = "Seleccioná un método de pago";
    if (!formData.comoSeEntero.trim()) e.comoSeEntero = "Seleccioná una opción";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast.error("Debés aceptar el marco y condiciones antes de continuar");
      return;
    }
    if (!validate()) {
      toast.error("Completá todos los campos requeridos");
      return;
    }

    // For transfer/western union, just submit via API and show confirmation
    if (formData.paymentMethod === "transferencia" || formData.paymentMethod === "western_union") {
      setSubmitting(true);
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.nombre,
            email: formData.email,
            phone: formData.telefono,
            message: `Lectura Akáshica - Pago: ${formData.paymentMethod}\nPregunta 1: ${formData.pregunta1}\nPregunta 2: ${formData.pregunta2}\n\nContexto: ${formData.contextoAdicional}`,
            paymentMethod: formData.paymentMethod,
            formData,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.removeItem(FORM_KEY);
          router.push("/lecturas/gracias");
        } else {
          toast.error(data.error || "Error al registrar la solicitud");
        }
      } catch {
        toast.error("Error de conexión. Intentá de nuevo.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // For MercadoPago or PayPal, use initiateCoursePayment
    localStorage.removeItem(FORM_KEY);
    const method = formData.paymentMethod as "mercadopago" | "paypal";
    const price = readingsPriceArs; // ARS price for MP
    const usdPrice = readingsPriceUsd;  // USD price for PayPal

    setSubmitting(true);
    try {
      await initiateCoursePayment({
        courseId: "lectura-akashica",
        courseName: "Lectura del Campo Akáshico",
        email: formData.email,
        name: formData.nombre,
        phone: formData.telefono,
        price,
        usdPrice,
        paymentMethod: method,
        checkoutType: "reading",
        enrollmentData: {
          type: "lectura",
          formData,
        },
      });
    } catch {
      toast.error("Error al procesar el pago. Intentá de nuevo.");
      setSubmitting(false);
    }
  };

  const readingsPriceArs = cmsNumber(cmsMap, 'readings.price_ars', 18000);
  const readingsPriceUsd = cmsNumber(cmsMap, 'readings.price_usd', 20);

  const paymentOptions: { value: PaymentMethod; label: string; price: string; icon: React.ReactNode; note?: string }[] = [
    {
      value: "mercadopago",
      label: "MercadoPago",
      price: `$${readingsPriceArs.toLocaleString("es-AR")} ARS`,
      icon: <CreditCard className="size-4" />,
      note: "Esta opción tiene comisión por parte de MercadoPago",
    },
    {
      value: "transferencia",
      label: "Transferencia Brubank",
      price: `$${readingsPriceArs.toLocaleString("es-AR")} ARS`,
      icon: <Landmark className="size-4" />,
    },
    {
      value: "paypal",
      label: "PayPal",
      price: `US$${readingsPriceUsd}`,
      icon: <DollarSign className="size-4" />,
    },
    {
      value: "western_union",
      label: "Western Union",
      price: `US$${readingsPriceUsd}`,
      icon: <DollarSign className="size-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-mystic-950 flex flex-col">
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

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-mystic-950/80 border-b border-mystic-700/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <Link
            href="/#lecturas"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-900/60 border border-mystic-700/40 text-foreground/70 hover:text-violet-400 hover:border-violet-400/30 transition-all text-sm font-medium group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        {formPaused ? (
          <FormPausedBanner formKey="lecturas" />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
          {/* Title */}
          <motion.div variants={fadeIn} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="size-5 text-violet-400" />
              <span className="text-violet-400/80 text-sm font-medium tracking-wider uppercase">
                Registros Akáshicos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground leading-tight mb-4">
              Lectura de Registros Akáshicos Personalizada
            </h1>
            <p className="text-foreground/70 text-sm sm:text-base max-w-2xl mx-auto mb-5 leading-relaxed">
              Una lectura de Registros Akáshicos te conecta con la sabiduría de tu alma para responder
              las preguntas más profundas de tu camino espiritual. Recibirás tu lectura grabada en audio,
              disponible en el Aula Virtual, desde Córdoba hacia todo el mundo.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant="outline" className="border-violet-400/30 text-violet-300 bg-violet-400/5">
                Argentina: {`$${readingsPriceArs.toLocaleString("es-AR")} ARS`}
              </Badge>
              <Badge variant="outline" className="border-violet-400/30 text-violet-300 bg-violet-400/5">
                Internacional: {`US$${readingsPriceUsd}`}
              </Badge>
            </div>
          </motion.div>

          {/* Agreement Collapsible */}
          <motion.div variants={fadeIn}>
            <Card className="glass border-mystic-700/30 mb-8">
              <CardHeader className="pb-0">
                <Collapsible open={agreementOpen} onOpenChange={setAgreementOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full text-left group">
                      <CardTitle className="text-violet-300 font-serif text-lg flex items-center gap-2">
                        <AlertTriangle className="size-4 text-violet-400" />
                        Acuerdo de Lectura Akáshica — Marco y Condiciones
                      </CardTitle>
                      <ChevronDown
                        className={`size-4 text-foreground/60 transition-transform duration-200 ${
                          agreementOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-4 space-y-4 text-sm text-foreground/70 leading-relaxed">
                      <p>
                        Por favor tomate el tiempo de leer completo este acuerdo, es fundamental para que la
                        Lectura se desarrolle en un marco de total armonía y comprensión.
                      </p>

                      <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-400/20">
                        <p>
                          <span className="text-violet-300">Entrega:</span> tu lectura estará disponible en el
                          Aula Virtual aproximadamente dentro de los 10 días hábiles posteriores a completar
                          este formulario. Si necesitás una respuesta urgente, te recomiendo no solicitar la lectura.
                        </p>
                      </div>

                      <p>
                        La lectura tiene un enfoque espiritual orientado al bienestar y crecimiento personal.
                        Los Registros pueden mostrar información del presente, pasado o futuros potenciales.
                        No realizo predicciones.
                      </p>

                      <p>Incluye la respuesta a 2 preguntas o temas, entregadas en audio.</p>

                      <p>Las preguntas deben estar enfocadas en vos, no en terceros.</p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-violet-400/20">
                          <p className="text-violet-300 text-xs mb-2 flex items-center gap-1.5">
                            <Check className="size-3 text-green-400 shrink-0" /> Ejemplos de preguntas que sí se responden
                          </p>
                          <ul className="space-y-1 text-xs text-foreground/70">
                            <li>• ¿Por qué me siento bloqueada?</li>
                            <li>• ¿Por qué me siento sola o vacía?</li>
                            <li>• ¿Qué necesito saber para crecer profesionalmente?</li>
                            <li>• ¿Qué consejo tienen mis guías?</li>
                            <li>• ¿Qué hay detrás de determinado síntoma físico?</li>
                          </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-violet-400/20">
                          <p className="text-violet-300 text-xs mb-2 flex items-center gap-1.5">
                            <X className="size-3 text-red-400 shrink-0" /> Preguntas que no se responden
                          </p>
                          <p className="text-xs text-foreground/70">
                            No respondo preguntas sobre sentimientos, decisiones o futuro de otras personas.
                          </p>
                        </div>
                      </div>

                      <p>
                        Podrás compartir el contexto que consideres importante. Te invito a hacerlo con confianza,
                        ya que facilita y enriquece la lectura. Si una pareja, familiar o persona cercana también
                        solicita una lectura sobre temas relacionados o compartidos, por favor avisame para poder
                        observar la energía en conjunto.
                      </p>

                      <p>
                        La lectura suele durar 30 a 40 minutos o más. Si lo considero necesario, podré complementarla
                        con oráculos, grillas de cristales, limpiezas energéticas u otras herramientas afines.
                      </p>

                      <p>
                        La lectura comenzará únicamente una vez recibida la contribución. Luego deberás enviarme el
                        comprobante por email o WhatsApp. Al final de este formulario encontrarás las opciones de
                        pago disponibles.
                      </p>

                      <p>Toda la información compartida es confidencial.</p>

                      <p>
                        Esta lectura no reemplaza diagnósticos, tratamientos ni indicaciones médicas o psicológicas.
                        No se realizan reembolsos una vez entregada la lectura ni tampoco por decisión del consultante
                        de cancelar o desistir del proceso luego de haber realizado su contribución.
                      </p>

                      <p>
                        Fernanda Lucrecia Cardozo no se responsabiliza por decisiones o consecuencias derivadas de la
                        información recibida.
                      </p>

                      <p>
                        Al solicitar la lectura declarás que los datos brindados son verdaderos, que sos mayor de 18
                        años y que participás por voluntad propia.
                      </p>

                      <p>
                        Fernanda Lucrecia Cardozo se reserva el derecho de admisión. Si una consulta no pudiera
                        realizarse por decisión de la facilitadora, cualquier importe abonado será reintegrado.
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Terms Checkbox */}
          <motion.div variants={fadeIn} className="mb-8">
            <label className="flex items-start gap-3 cursor-pointer p-5 rounded-xl border border-violet-400/40 bg-violet-500/5 hover:bg-violet-500/10 transition-colors">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5 size-5 shrink-0 border-violet-400/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 data-[state=checked]:text-white"
              />
              <span className="text-sm text-foreground leading-relaxed">
                He leído, he comprendido y acepto el marco y condiciones en que se realizará esta Lectura,
                expresado y detallado más arriba en el ACUERDO DE LECTURA DE REGISTROS AKÁSHICOS.
              </span>
            </label>
          </motion.div>

          {/* Form - only visible when terms accepted */}
          {termsAccepted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Progress Stepper */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {[
                    { icon: User, label: "Datos" },
                    { icon: Heart, label: "Salud" },
                    { icon: MessageCircle, label: "Preguntas" },
                    { icon: CreditCard, label: "Pago" },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep > i 
                          ? "bg-violet-400 text-mystic-950" 
                          : currentStep === i 
                            ? "bg-violet-400/20 text-violet-400 ring-1 ring-violet-400/40" 
                            : "bg-mystic-800/60 text-foreground/30"
                      }`}>
                        {currentStep > i ? <Check className="size-4" /> : <step.icon className="size-4 sm:size-5" />}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium transition-colors ${
                        currentStep >= i ? "text-violet-300" : "text-foreground/30"
                      }`}>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1 rounded-full bg-mystic-800/60 overflow-hidden">
                  <motion.div 
                    className="h-full bg-violet-400 rounded-full"
                    initial={false}
                    animate={{ width: `${Math.max((currentStep / 4) * 100, 4)}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <Card className="glass border-mystic-700/30">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* ---- DATOS PERSONALES ---- */}
                    <div>
                      <h3 className="text-violet-300 font-serif text-lg mb-4">Datos Personales</h3>
                      <div className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">
                            Correo electrónico <span className="text-violet-400">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Ej: maria@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 ${errors.email ? "border-red-400/60" : ""}`}
                          />
                          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                        </div>

                        {/* Nombre y apellido */}
                        <div className="space-y-1.5">
                          <Label htmlFor="nombre" className="text-foreground/80 text-sm font-medium">
                            Nombre y apellido completo <span className="text-violet-400">*</span>
                          </Label>
                          <Input
                            id="nombre"
                            placeholder="Ej: María González"
                            value={formData.nombre}
                            onChange={(e) => updateField("nombre", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 ${errors.nombre ? "border-red-400/60" : ""}`}
                          />
                          {errors.nombre && <p className="text-red-400 text-xs">{errors.nombre}</p>}
                        </div>

                        {/* Fecha de nacimiento */}
                        <div className="space-y-1.5">
                          <Label htmlFor="fechaNacimiento" className="text-foreground/80 text-sm font-medium">
                            Fecha de nacimiento <span className="text-violet-400">*</span>
                          </Label>
                          <Input
                            id="fechaNacimiento"
                            type="date"
                            value={formData.fechaNacimiento}
                            onChange={(e) => updateField("fechaNacimiento", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground [color-scheme:dark] ${errors.fechaNacimiento ? "border-red-400/60" : ""}`}
                          />
                          {errors.fechaNacimiento && <p className="text-red-400 text-xs">{errors.fechaNacimiento}</p>}
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-1.5">
                          <Label htmlFor="telefono" className="text-foreground/80 text-sm font-medium">
                            Teléfono de contacto <span className="text-foreground/40">(opcional)</span>
                          </Label>
                          <Input
                            id="telefono"
                            type="tel"
                            placeholder="Ej: 1155123456"
                            value={formData.telefono}
                            onChange={(e) => updateField("telefono", e.target.value)}
                            className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30"
                          />
                        </div>

                        {/* Nacionalidad */}
                        <div className="space-y-1.5">
                          <Label htmlFor="nacionalidad" className="text-foreground/80 text-sm font-medium">
                            Nacionalidad <span className="text-violet-400">*</span>
                          </Label>
                          <Input
                            id="nacionalidad"
                            placeholder="Ej: Argentina"
                            value={formData.nacionalidad}
                            onChange={(e) => updateField("nacionalidad", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 ${errors.nacionalidad ? "border-red-400/60" : ""}`}
                          />
                          {errors.nacionalidad && <p className="text-red-400 text-xs">{errors.nacionalidad}</p>}
                        </div>

                        {/* Ciudad de nacimiento */}
                        <div className="space-y-1.5">
                          <Label htmlFor="ciudadNacimiento" className="text-foreground/80 text-sm font-medium">
                            Ciudad de nacimiento <span className="text-violet-400">*</span>
                          </Label>
                          <Input
                            id="ciudadNacimiento"
                            placeholder="Ej: Córdoba"
                            value={formData.ciudadNacimiento}
                            onChange={(e) => updateField("ciudadNacimiento", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 ${errors.ciudadNacimiento ? "border-red-400/60" : ""}`}
                          />
                          {errors.ciudadNacimiento && <p className="text-red-400 text-xs">{errors.ciudadNacimiento}</p>}
                        </div>

                        {/* Ciudad de residencia */}
                        <div className="space-y-1.5">
                          <Label htmlFor="ciudadResidencia" className="text-foreground/80 text-sm font-medium">
                            Ciudad de residencia <span className="text-violet-400">*</span>
                          </Label>
                          <Input
                            id="ciudadResidencia"
                            placeholder="Ej: Buenos Aires"
                            value={formData.ciudadResidencia}
                            onChange={(e) => updateField("ciudadResidencia", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 ${errors.ciudadResidencia ? "border-red-400/60" : ""}`}
                          />
                          {errors.ciudadResidencia && <p className="text-red-400 text-xs">{errors.ciudadResidencia}</p>}
                        </div>

                      </div>
                    </div>

                    <Separator className="bg-mystic-800/30 my-6" />

                    {/* ---- CÓMO SE ENTERÓ ---- */}
                    <div>
                      <h3 className="text-violet-300 font-serif text-lg mb-4">¿Cómo te enteraste de mis lecturas?</h3>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-foreground/80 text-sm font-medium">
                            ¿Cómo te enteraste? <span className="text-violet-400">*</span>
                          </Label>
                          <RadioGroup
                            value={formData.comoSeEntero}
                            onValueChange={(v) => {
                              updateField("comoSeEntero", v);
                              if (v !== "Recomendación") {
                                updateField("nombreRecomendo", "");
                              }
                            }}
                            className="flex flex-wrap gap-2"
                          >
                            {["Recomendación de familia o amigos", "Redes sociales", "Mail", "Otros"].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-all duration-200 ${
                                  formData.comoSeEntero === opt
                                    ? "border-violet-400/60 bg-violet-400/10 text-violet-300"
                                    : "border-mystic-700/40 text-foreground/60 hover:border-mystic-700/70"
                                }`}
                              >
                                <RadioGroupItem value={opt} className="sr-only" />
                                {formData.comoSeEntero === opt && <Check className="size-3" />}
                                {opt}
                              </label>
                            ))}
                          </RadioGroup>
                          {errors.comoSeEntero && <p className="text-red-400 text-xs">{errors.comoSeEntero}</p>}
                        </div>

                        {formData.comoSeEntero === "Recomendación de familia o amigos" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                          >
                            <Label htmlFor="nombreRecomendo" className="text-foreground/80 text-sm font-medium">
                              Si te recomendaron, podrías indicarme ¿quién? <span className="text-foreground/40">(opcional)</span>
                            </Label>
                            <Input
                              id="nombreRecomendo"
                              placeholder="Nombre de la persona que te recomendó"
                              value={formData.nombreRecomendo}
                              onChange={(e) => updateField("nombreRecomendo", e.target.value)}
                              className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 mt-1.5"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-mystic-800/30 my-6" />

                    {/* ---- SALUD ---- */}
                    <div>
                      <h3 className="text-violet-300 font-serif text-lg mb-4">Salud</h3>
                      <div className="space-y-4">
                        {/* Enfermedad crónica */}
                        <div className="space-y-1.5">
                          <Label htmlFor="enfermedadCronica" className="text-foreground/80 text-sm font-medium">
                            ¿Alguna enfermedad crónica? ¿Cuál? <span className="text-violet-400">*</span>
                          </Label>
                          <Textarea
                            id="enfermedadCronica"
                            placeholder="Escribí las enfermedades crónicas que tengas, o &quot;Ninguna&quot; si no tenés"
                            rows={2}
                            value={formData.enfermedadCronica}
                            onChange={(e) => updateField("enfermedadCronica", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 resize-none ${errors.enfermedadCronica ? "border-red-400/60" : ""}`}
                          />
                          {errors.enfermedadCronica && <p className="text-red-400 text-xs">{errors.enfermedadCronica}</p>}
                        </div>


                        {/* Terapia psicológica */}
                        <div className="space-y-1.5">
                          <Label className="text-foreground/80 text-sm font-medium">
                            ¿Hiciste alguna vez terapia psicológica? <span className="text-violet-400">*</span>
                          </Label>
                          <RadioGroup
                            value={formData.terapiaPsicologica}
                            onValueChange={(v) => updateField("terapiaPsicologica", v)}
                            className="flex flex-wrap gap-2"
                          >
                            {["Sí", "No", "Otro"].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-all duration-200 ${
                                  formData.terapiaPsicologica === opt
                                    ? "border-violet-400/60 bg-violet-400/10 text-violet-300"
                                    : "border-mystic-700/40 text-foreground/60 hover:border-mystic-700/70"
                                }`}
                              >
                                <RadioGroupItem value={opt} className="sr-only" />
                                {formData.terapiaPsicologica === opt && <Check className="size-3" />}
                                {opt}
                              </label>
                            ))}
                          </RadioGroup>
                          {errors.terapiaPsicologica && <p className="text-red-400 text-xs">{errors.terapiaPsicologica}</p>}

                          {formData.terapiaPsicologica === "Sí" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Input
                                placeholder="¿Por cuánto tiempo?"
                                value={formData.terapiaPsicologicaDuracion}
                                onChange={(e) => updateField("terapiaPsicologicaDuracion", e.target.value)}
                                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 mt-2 ${errors.terapiaPsicologicaDuracion ? "border-red-400/60" : ""}`}
                              />
                              {errors.terapiaPsicologicaDuracion && (
                                <p className="text-red-400 text-xs mt-1">{errors.terapiaPsicologicaDuracion}</p>
                              )}
                            </motion.div>
                          )}
                        </div>

                        {/* Terapia psiquiátrica */}
                        <div className="space-y-1.5">
                          <Label className="text-foreground/80 text-sm font-medium">
                            ¿Hiciste alguna vez terapia psiquiátrica? <span className="text-violet-400">*</span>
                          </Label>
                          <RadioGroup
                            value={formData.terapiaPsiquiatrica}
                            onValueChange={(v) => updateField("terapiaPsiquiatrica", v)}
                            className="flex flex-wrap gap-2"
                          >
                            {["Sí", "No", "Otro"].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-all duration-200 ${
                                  formData.terapiaPsiquiatrica === opt
                                    ? "border-violet-400/60 bg-violet-400/10 text-violet-300"
                                    : "border-mystic-700/40 text-foreground/60 hover:border-mystic-700/70"
                                }`}
                              >
                                <RadioGroupItem value={opt} className="sr-only" />
                                {formData.terapiaPsiquiatrica === opt && <Check className="size-3" />}
                                {opt}
                              </label>
                            ))}
                          </RadioGroup>
                          {errors.terapiaPsiquiatrica && <p className="text-red-400 text-xs">{errors.terapiaPsiquiatrica}</p>}

                          {formData.terapiaPsiquiatrica === "Sí" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Input
                                placeholder="¿Por cuánto tiempo?"
                                value={formData.terapiaPsiquiatricaDuracion}
                                onChange={(e) => updateField("terapiaPsiquiatricaDuracion", e.target.value)}
                                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 mt-2 ${errors.terapiaPsiquiatricaDuracion ? "border-red-400/60" : ""}`}
                              />
                              {errors.terapiaPsiquiatricaDuracion && (
                                <p className="text-red-400 text-xs mt-1">{errors.terapiaPsiquiatricaDuracion}</p>
                              )}
                            </motion.div>
                          )}
                        </div>

                        {/* Medicación psiquiátrica */}
                        <div className="space-y-1.5">
                          <Label className="text-foreground/80 text-sm font-medium">
                            ¿Actualmente tomas medicación como parte del tratamiento psiquiátrico? <span className="text-violet-400">*</span>
                          </Label>
                          <RadioGroup
                            value={formData.medicacionPsiquiatrica}
                            onValueChange={(v) => updateField("medicacionPsiquiatrica", v)}
                            className="flex flex-wrap gap-2"
                          >
                            {["Sí", "No", "Otro"].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-all duration-200 ${
                                  formData.medicacionPsiquiatrica === opt
                                    ? "border-violet-400/60 bg-violet-400/10 text-violet-300"
                                    : "border-mystic-700/40 text-foreground/60 hover:border-mystic-700/70"
                                }`}
                              >
                                <RadioGroupItem value={opt} className="sr-only" />
                                {formData.medicacionPsiquiatrica === opt && <Check className="size-3" />}
                                {opt}
                              </label>
                            ))}
                          </RadioGroup>
                          {errors.medicacionPsiquiatrica && <p className="text-red-400 text-xs">{errors.medicacionPsiquiatrica}</p>}
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-mystic-800/30 my-6" />

                    {/* ---- PREGUNTAS ---- */}
                    <div>
                      <h3 className="text-violet-300 font-serif text-lg mb-4">Preguntas al Campo Akáshico</h3>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="pregunta1" className="text-foreground/80 text-sm font-medium">
                            Pregunta al Campo Akáshico N° 1 <span className="text-violet-400">*</span>
                          </Label>
                          <Textarea
                            id="pregunta1"
                            placeholder="Escribí tu pregunta aquí, enfocada en vos..."
                            rows={3}
                            value={formData.pregunta1}
                            onChange={(e) => updateField("pregunta1", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 resize-none ${errors.pregunta1 ? "border-red-400/60" : ""}`}
                          />
                          {errors.pregunta1 && <p className="text-red-400 text-xs">{errors.pregunta1}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="pregunta2" className="text-foreground/80 text-sm font-medium">
                            Pregunta al Campo Akáshico N° 2 <span className="text-violet-400">*</span>
                          </Label>
                          <Textarea
                            id="pregunta2"
                            placeholder="Escribí tu segunda pregunta aquí..."
                            rows={3}
                            value={formData.pregunta2}
                            onChange={(e) => updateField("pregunta2", e.target.value)}
                            className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 resize-none ${errors.pregunta2 ? "border-red-400/60" : ""}`}
                          />
                          {errors.pregunta2 && <p className="text-red-400 text-xs">{errors.pregunta2}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="contextoAdicional" className="text-foreground/80 text-sm font-medium">
                            Contexto adicional <span className="text-foreground/40">(opcional)</span>
                          </Label>
                          <Textarea
                            id="contextoAdicional"
                            placeholder="Contame un poco más sobre tu sentir, contexto, datos relacionados a los temas que traés. Podés contarme sobre hechos importantes o cómo está constituida tu familia."
                            rows={4}
                            value={formData.contextoAdicional}
                            onChange={(e) => updateField("contextoAdicional", e.target.value)}
                            className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 resize-none"
                          />
                          <p className="text-xs text-foreground/50 mt-1.5 leading-relaxed">
                            En este espacio podés escribir todo lo que considerás necesario para que tu lectura sea lo más completa posible. Podés contarme sobre situaciones que estés atravesando, dudas que tengas, o cualquier contexto que quieras compartir.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-mystic-800/30 my-6" />

                    {/* ---- PAGO ---- */}
                    <div>
                      <h3 className="text-violet-300 font-serif text-lg mb-4">¿Cómo te gustaría realizar tu aporte?</h3>
                      <div className="space-y-3">
                        <RadioGroup
                          value={formData.paymentMethod}
                          onValueChange={(v) => updateField("paymentMethod", v)}
                        >
                          {paymentOptions.map((opt) => (
                            <label
                              key={opt.value}
                              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                formData.paymentMethod === opt.value
                                  ? "border-violet-400/60 bg-violet-400/5"
                                  : "border-mystic-700/40 hover:border-mystic-700/70"
                              }`}
                            >
                              <RadioGroupItem value={opt.value} className="mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {opt.icon}
                                  <span className="text-sm font-medium text-foreground/90">{opt.label}</span>
                                  <Badge variant="outline" className="border-violet-400/30 text-violet-300 text-xs ml-auto">
                                    {opt.price}
                                  </Badge>
                                </div>
                                {opt.note && (
                                  <p className="text-xs text-foreground/50">{opt.note}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                        {errors.paymentMethod && <p className="text-red-400 text-xs">{errors.paymentMethod}</p>}

                        {/* Payment details */}
                        {formData.paymentMethod === "transferencia" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-4 rounded-xl bg-mystic-900/50 border border-mystic-700/40 space-y-2 text-sm"
                          >
                            <p className="text-violet-300 font-semibold">Datos para transferencia Brubank:</p>
                            <div className="space-y-1 text-foreground/70">
                              <p><span className="text-foreground/50">CBU:</span> 1430001713002632000014</p>
                              <p><span className="text-foreground/50">Alias:</span> fer.cardozo</p>
                              <p><span className="text-foreground/50">Cuenta:</span> 1300263200001</p>
                            </div>
                          </motion.div>
                        )}

                        {formData.paymentMethod === "western_union" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-4 rounded-xl bg-mystic-900/50 border border-mystic-700/40 text-sm"
                          >
                            <p className="text-violet-300 font-semibold mb-1">Datos para Western Union:</p>
                            <p className="text-foreground/70">Envío a <strong>Fernanda Lucrecia Cardozo</strong>, Argentina, Córdoba.</p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-mystic-800/30 my-6" />

                    {/* ---- SUBMIT ---- */}
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold text-base py-6 rounded-full transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-5 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-5 mr-2" />
                          Solicitar mi Lectura
                        </>
                      )}
                    </Button>

                    <p className="text-center text-foreground/40 text-xs mt-3">
                      Al enviar, aceptás los términos y condiciones de la Lectura del Campo Akáshico.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!termsAccepted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-foreground/40"
            >
              <p className="text-sm">Aceptá el marco y condiciones arriba para acceder al formulario.</p>
            </motion.div>
          )}
          </motion.div>
        )}
      </main>

      {/* Floating scroll-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 flex items-center justify-center"
          aria-label="Volver arriba"
        >
          <ArrowUp className="size-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-mystic-700/20 mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-foreground/30">
          <p>Eter Somos &middot; Registros Ak&aacute;shicos</p>
        </div>
      </footer>
    </div>
  );
}
