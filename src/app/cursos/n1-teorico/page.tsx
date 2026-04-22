"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronDown,
  Loader2,
  BookOpen,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { initiateCoursePayment } from "@/lib/course-payment";

/* ------------------------------------------------------------------ */
/*  MODULES                                                           */
/* ------------------------------------------------------------------ */
const modules = [
  "Módulo 1 – ¿Qué es el Akasha? Maestros y Guías.",
  "Módulo 2 – Lo que bloquea tu Conexión con el Akasha.",
  "Módulo 3 – Cómo formular preguntas. Formas de Navegar en el Akasha.",
  "Módulo 4 – Canales de la Información.",
  "Módulo 5 – Tipos de Información.",
  "Módulo 6 – Esferas de vos mismo que podés explorar, y cómo hacerlo. Línea de tiempo, árbol genealógico, vidas pasadas, orígenes cósmicos.",
  "Módulo 7 – Cómo reconocer la Información del Akasha.",
  "Módulo 8 – Metodología, Pasos para abrir tus Registros Akashicos.",
];

const includes = [
  "Grabación audiovisual de ocho módulos, de 20 minutos cada uno",
  ...modules,
  "Módulo 9 PDF – Preguntas Frecuentes. Respondo aquellos interrogantes que siempre se plantean a la hora de iniciar la práctica.",
  "Oración de apertura y cierre de Registros Akashicos.",
  "Meditación / Visualización Guiada para conectar con el Akasha. Grabación en audio.",
  "Material complementario teórico en PDF.",
  "Material bibliográfico sugerido en PDF.",
];

/* ------------------------------------------------------------------ */
/*  AGREEMENT TEXT                                                    */
/* ------------------------------------------------------------------ */
const agreementText = `Por favor tomate el tiempo de leer completo este acuerdo, es fundamental para que el curso se desarrolle en un marco de total armonía y comprensión.

El objetivo principal de este curso es que aprendas a navegar en el Campo Akashico, y puedas consultar tus Registros Akashicos. El enfoque es aprender a utilizar la herramienta de Registros Akashicos para tu autoconocimiento. No es el foco de este curso, que aprendas a leer los Registros Akashicos de otras personas.

El objetivo final de esta formación siempre es el bienestar y mayor bien de todos los que están involucrados en los temas que son tratados, así como el crecimiento interno y la evolución tanto personal como planetaria.

Lo que incluye:
- Grabación audiovisual de ocho módulos, de 20 minutos cada uno.
- Material complementario teórico en PDF.
- Material bibliográfico sugerido en PDF.
- Oración de apertura y cierre.
- Meditación guiada en audio.
- Módulo 9 – PDF de Preguntas Frecuentes.

IMPORTANTE:
- El material audiovisual NO se puede descargar, se accede de forma online.
- El acceso al material es por 1 mes desde la fecha de inscripción.
- No se realizan reembolsos.
- Fernanda se reserva el derecho de admisión.`;

/* ------------------------------------------------------------------ */
/*  FORM FIELDS                                                       */
/* ------------------------------------------------------------------ */
interface FormErrors {
  [key: string]: string;
}

const FORM_KEY = "etersomos_n1teorico_form";

export default function N1TeoricoPage() {
  const [agreementOpen, setAgreementOpen] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaHoy, setFechaHoy] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [nacionalidad, setNacionalidad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [lectorAkashico, setLectorAkashico] = useState("");
  const [comoSeEnteraste, setComoSeEnteraste] = useState("");
  const [recomendadoNombre, setRecomendadoNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  // Restore form data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.nombre) setNombre(parsed.nombre);
        if (parsed.fechaHoy) setFechaHoy(parsed.fechaHoy);
        if (parsed.nacionalidad) setNacionalidad(parsed.nacionalidad);
        if (parsed.ciudad) setCiudad(parsed.ciudad);
        if (parsed.telefono) setTelefono(parsed.telefono);
        if (parsed.lectorAkashico) setLectorAkashico(parsed.lectorAkashico);
        if (parsed.comoSeEnteraste) setComoSeEnteraste(parsed.comoSeEnteraste);
        if (parsed.recomendadoNombre) setRecomendadoNombre(parsed.recomendadoNombre);
        if (parsed.monto) setMonto(parsed.monto);
        if (parsed.metodoPago) setMetodoPago(parsed.metodoPago);
        if (parsed._accepted) setAccepted(true);
      }
    } catch {}
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (email || nombre) {
      localStorage.setItem(FORM_KEY, JSON.stringify({
        email, nombre, fechaHoy, nacionalidad, ciudad, telefono,
        lectorAkashico, comoSeEnteraste, recomendadoNombre, monto, metodoPago,
        _accepted: accepted,
      }));
    }
  }, [email, nombre, fechaHoy, nacionalidad, ciudad, telefono,
      lectorAkashico, comoSeEnteraste, recomendadoNombre, monto, metodoPago, accepted]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "Ingresá tu correo electrónico";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Ingresá un email válido";
    if (!nombre.trim()) e.nombre = "Ingresá tu nombre y apellido completo";
    if (!fechaHoy) e.fechaHoy = "Ingresá la fecha de hoy";
    if (!nacionalidad.trim()) e.nacionalidad = "Ingresá tu nacionalidad";
    if (!ciudad.trim()) e.ciudad = "Ingresá tu ciudad actual";
    if (!lectorAkashico) e.lectorAkashico = "Seleccioná una opción";
    if (!comoSeEnteraste) e.comoSeEnteraste = "Seleccioná una opción";
    if (!monto || Number(monto) <= 0)
      e.monto = "Ingresá un monto mayor a 0";
    if (!metodoPago) e.metodoPago = "Seleccioná un método de pago";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const enrollmentData = {
    email, nombre, fechaHoy, nacionalidad, ciudad, telefono,
    lectorAkashico, comoSeEnteraste, recomendadoNombre, monto, metodoPago,
  };

  const handleOfflineSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/confirm-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "course_enrollment",
          customerName: nombre,
          customerEmail: email,
          customerPhone: telefono || "",
          address: "Curso online",
          city: "N/A",
          province: "N/A",
          postalCode: "0000",
          items: [{ id: 0, name: "1er Nivel Solo Teórico – Registros Akáshicos", quantity: 1, price: Number(monto) }],
          total: Number(monto),
          paymentMethod: metodoPago,
          extraData: { formData: enrollmentData },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem(FORM_KEY);
        toast.success("Inscripción registrada con éxito", {
          description: "Recordá realizar la transferencia con los datos indicados. Te contactaremos para comenzar el curso.",
          duration: 8000,
        });
      } else {
        toast.error(data.error || "Error al registrar la inscripción");
      }
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (method: "mercadopago" | "paypal") => {
    if (!validate()) return;
    localStorage.removeItem(FORM_KEY);
    setSubmitting(true);
    try {
      await initiateCoursePayment({
        courseId: "n1-teorico",
        courseName: "1er Nivel Solo Teórico – Registros Akáshicos",
        email,
        name: nombre,
        phone: telefono || "",
        price: Number(monto),
        paymentMethod: method,
        enrollmentData: {
          email,
          nombre,
          fechaHoy,
          nacionalidad,
          ciudad,
          telefono,
          lectorAkashico,
          comoSeEnteraste,
          recomendadoNombre:
            comoSeEnteraste === "Recomendación de familia o amigos"
              ? recomendadoNombre
              : "",
          monto: Number(monto),
          metodoPago,
        },
      });
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "bg-mystic-900/50 border-mystic-700/40 focus:border-gold-400/60 text-foreground placeholder:text-foreground/30";
  const errorInputClass =
    "bg-mystic-900/50 border-red-400/60 text-foreground placeholder:text-foreground/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* ── Title ── */}
      <div className="text-center space-y-3">
        <Badge>NIVEL 1</Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-gold-400 text-glow-gold leading-snug">
          Aprendé a Conectar con tus Registros Akáshicos
        </h1>
        <p className="text-foreground/50 font-serif italic">
          (1° Nivel solo Teórico)
        </p>
        <div className="inline-block glass rounded-full px-6 py-2 mt-2">
          <span className="text-gold-300 font-serif font-semibold text-lg">
            Contribución Voluntaria Consciente
          </span>
        </div>
      </div>

      {/* ── Agreement ── */}
      <Card className="glass border-mystic-700/30">
        <Collapsible open={agreementOpen} onOpenChange={setAgreementOpen}>
          <CardHeader className="pb-0">
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <CardTitle className="text-lg text-gold-300 font-serif flex items-center gap-2">
                <BookOpen className="size-5" />
                Acuerdo y Condiciones
              </CardTitle>
              <ChevronDown className="size-5 text-foreground/50 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line space-y-4">
                <p className="text-gold-400/80 font-medium">
                  Por favor tomate el tiempo de leer completo este acuerdo, es
                  fundamental para que el curso se desarrolle en un marco de
                  total armonía y comprensión.
                </p>
                <p>
                  El objetivo principal de este curso es que aprendas a navegar
                  en el Campo Akashico, y puedas consultar tus Registros
                  Akashicos. El enfoque es aprender a utilizar la herramienta de
                  Registros Akashicos para tu autoconocimiento.{" "}
                  <strong className="text-foreground/90">
                    No es el foco de este curso, que aprendas a leer los
                    Registros Akashicos de otras personas.
                  </strong>
                </p>
                <p>
                  El objetivo final de esta formación siempre es el bienestar y
                  mayor bien de todos los que están involucrados en los temas
                  que son tratados, así como el crecimiento interno y la
                  evolución tanto personal como planetaria.
                </p>
              </div>

              <Separator className="my-5 bg-mystic-700/30" />

              {/* What's included */}
              <div className="space-y-3">
                <h3 className="text-gold-300 font-serif font-semibold text-base">
                  ¿Qué incluye el curso?
                </h3>
                <ul className="space-y-1.5">
                  {includes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/70"
                    >
                      <Check className="size-3.5 text-gold-400 shrink-0 mt-0.5" />
                      <span
                        className={
                          i >= 1 && i <= 8
                            ? "text-foreground/80"
                            : ""
                        }
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="my-5 bg-mystic-700/30" />

              {/* Important conditions */}
              <div className="space-y-2">
                <h3 className="text-foreground/90 font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="size-4 text-gold-400" />
                  Condiciones Importantes
                </h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    El material audiovisual{" "}
                    <strong className="text-foreground/80">
                      NO se puede descargar
                    </strong>
                    , se accede de forma online.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    El acceso al material es por{" "}
                    <strong className="text-foreground/80">
                      1 mes desde la fecha de inscripción
                    </strong>
                    .
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    No se realizan reembolsos.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    Fernanda se reserva el derecho de admisión.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    <strong className="text-foreground/80">
                      NOTA: NO INCLUYE clases de prácticas.
                    </strong>
                  </li>
                </ul>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* ── Accept terms checkbox ── */}
      <div className="flex items-start gap-3 glass rounded-xl p-4 border border-mystic-700/30">
        <Checkbox
          id="accept-terms"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked === true)}
          className="mt-0.5 data-[state=checked]:bg-gold-400 data-[state=checked]:border-gold-400 data-[state=checked]:text-mystic-950"
        />
        <Label
          htmlFor="accept-terms"
          className="text-sm text-foreground/80 cursor-pointer leading-relaxed"
        >
          He leído, he comprendido y acepto el marco y condiciones del curso.
          <span className="text-gold-400"> *</span>
        </Label>
      </div>

      {/* ── Form ── */}
      {accepted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass border-mystic-700/30">
            <CardHeader>
              <CardTitle className="text-lg text-gold-300 font-serif">
                Formulario de Inscripción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground/80 text-sm">
                  Correo electrónico <span className="text-gold-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? errorInputClass : inputClass}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-foreground/80 text-sm">
                  Nombre y apellido completo{" "}
                  <span className="text-gold-400">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: María González"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={errors.nombre ? errorInputClass : inputClass}
                />
                {errors.nombre && (
                  <p className="text-red-400 text-xs">{errors.nombre}</p>
                )}
              </div>

              {/* Fecha de hoy */}
              <div className="space-y-1.5">
                <Label htmlFor="fecha" className="text-foreground/80 text-sm">
                  Fecha de hoy <span className="text-gold-400">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaHoy}
                  onChange={(e) => setFechaHoy(e.target.value)}
                  className={errors.fechaHoy ? errorInputClass : inputClass}
                />
                {errors.fechaHoy && (
                  <p className="text-red-400 text-xs">{errors.fechaHoy}</p>
                )}
              </div>

              {/* Nacionalidad */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="nacionalidad"
                  className="text-foreground/80 text-sm"
                >
                  Nacionalidad <span className="text-gold-400">*</span>
                </Label>
                <Input
                  id="nacionalidad"
                  placeholder="Ej: Argentina"
                  value={nacionalidad}
                  onChange={(e) => setNacionalidad(e.target.value)}
                  className={
                    errors.nacionalidad ? errorInputClass : inputClass
                  }
                />
                {errors.nacionalidad && (
                  <p className="text-red-400 text-xs">{errors.nacionalidad}</p>
                )}
              </div>

              {/* Ciudad */}
              <div className="space-y-1.5">
                <Label htmlFor="ciudad" className="text-foreground/80 text-sm">
                  Ciudad actual <span className="text-gold-400">*</span>
                </Label>
                <Input
                  id="ciudad"
                  placeholder="Ej: Buenos Aires"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className={errors.ciudad ? errorInputClass : inputClass}
                />
                {errors.ciudad && (
                  <p className="text-red-400 text-xs">{errors.ciudad}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <Label htmlFor="telefono" className="text-foreground/80 text-sm">
                  Teléfono de contacto (opcional)
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Ej: 1155123456"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={inputClass}
                />
              </div>

              <Separator className="bg-mystic-800/30" />

              {/* ¿Sos lector? */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">
                  ¿Sos lector de Registros Akashicos?{" "}
                  <span className="text-gold-400">*</span>
                </Label>
                <RadioGroup
                  value={lectorAkashico}
                  onValueChange={setLectorAkashico}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  {["Sí", "No", "Otro"].map((opt) => (
                    <Label
                      key={opt}
                      htmlFor={`lector-${opt}`}
                      className={`flex items-center gap-2 cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                        lectorAkashico === opt
                          ? "border-gold-400/60 bg-gold-400/5 text-gold-300"
                          : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`lector-${opt}`}
                        className="border-mystic-600"
                      />
                      {opt}
                    </Label>
                  ))}
                </RadioGroup>
                {errors.lectorAkashico && (
                  <p className="text-red-400 text-xs">{errors.lectorAkashico}</p>
                )}
              </div>

              {/* ¿Cómo te enteraste? */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">
                  ¿Cómo te enteraste del curso?{" "}
                  <span className="text-gold-400">*</span>
                </Label>
                <RadioGroup
                  value={comoSeEnteraste}
                  onValueChange={setComoSeEnteraste}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {[
                    "Recomendación de familia o amigos",
                    "Redes sociales",
                    "Por mail",
                    "Otro",
                  ].map((opt) => (
                    <Label
                      key={opt}
                      htmlFor={`enteraste-${opt}`}
                      className={`flex items-center gap-2 cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                        comoSeEnteraste === opt
                          ? "border-gold-400/60 bg-gold-400/5 text-gold-300"
                          : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`enteraste-${opt}`}
                        className="border-mystic-600"
                      />
                      {opt}
                    </Label>
                  ))}
                </RadioGroup>
                {errors.comoSeEnteraste && (
                  <p className="text-red-400 text-xs">
                    {errors.comoSeEnteraste}
                  </p>
                )}
              </div>

              {/* Conditional: nombre recomendante */}
              {comoSeEnteraste === "Recomendación de familia o amigos" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5"
                >
                  <Label
                    htmlFor="recomendado"
                    className="text-foreground/80 text-sm"
                  >
                    Si fue recomendado, ¿quién te recomendó? (opcional)
                  </Label>
                  <Input
                    id="recomendado"
                    placeholder="Nombre de quien te recomendó"
                    value={recomendadoNombre}
                    onChange={(e) => setRecomendadoNombre(e.target.value)}
                    className={inputClass}
                  />
                </motion.div>
              )}

              <Separator className="bg-mystic-800/30" />

              {/* MONTO */}
              <div className="space-y-1.5">
                <Label htmlFor="monto" className="text-foreground/80 text-sm">
                  Monto de contribución voluntaria (ARS){" "}
                  <span className="text-gold-400">*</span>
                </Label>
                <Input
                  id="monto"
                  type="number"
                  min="1"
                  placeholder="Ej: 5000"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className={errors.monto ? errorInputClass : inputClass}
                />
                {errors.monto && (
                  <p className="text-red-400 text-xs">{errors.monto}</p>
                )}
                <p className="text-xs text-foreground/40">
                  Ingresá el monto que desees contribuir de forma consciente.
                </p>
              </div>

              <Separator className="bg-mystic-800/30" />

              {/* Método de pago */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">
                  Método de pago <span className="text-gold-400">*</span>
                </Label>
                <RadioGroup
                  value={metodoPago}
                  onValueChange={setMetodoPago}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {[
                    { value: "mercadopago", label: "MercadoPago" },
                    { value: "transferencia", label: "Transferencia bancaria" },
                    { value: "paypal", label: "PayPal" },
                    { value: "western_union", label: "Western Union" },
                  ].map((opt) => (
                    <Label
                      key={opt.value}
                      htmlFor={`pago-${opt.value}`}
                      className={`flex items-center gap-2 cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                        metodoPago === opt.value
                          ? "border-gold-400/60 bg-gold-400/5 text-gold-300"
                          : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`pago-${opt.value}`}
                        className="border-mystic-600"
                      />
                      {opt.label}
                    </Label>
                  ))}
                </RadioGroup>
                {errors.metodoPago && (
                  <p className="text-red-400 text-xs">{errors.metodoPago}</p>
                )}

                {/* Payment info based on method */}
                {metodoPago === "mercadopago" && (
                  <div className="glass rounded-lg p-4 text-sm space-y-2 border border-mystic-700/20">
                    <p className="text-foreground/70">
                      Vas a ser redirigido a MercadoPago para completar tu pago
                      de{" "}
                      <strong className="text-gold-300">
                        ${Number(monto).toLocaleString("es-AR")} ARS
                      </strong>
                      .
                    </p>
                    <Button
                      onClick={() => handlePay("mercadopago")}
                      disabled={submitting}
                      className="w-full bg-[#009ee3] hover:bg-[#008bc7] text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        "Pagar con MercadoPago"
                      )}
                    </Button>
                  </div>
                )}

                {metodoPago === "transferencia" && (
                  <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
                    <p className="text-foreground/70">
                      Realizá la transferencia por el monto de{" "}
                      <strong className="text-gold-300">
                        ${Number(monto).toLocaleString("es-AR")} ARS
                      </strong>{" "}
                      a:
                    </p>
                    <div className="space-y-1 text-foreground/60">
                      <p>
                        <span className="text-gold-400 font-medium">Banco:</span>{" "}
                        Brubank
                      </p>
                      <p>
                        <span className="text-gold-400 font-medium">CBU:</span>{" "}
                        1430001713002632000014
                      </p>
                      <p>
                        <span className="text-gold-400 font-medium">Alias:</span>{" "}
                        fer.cardozo
                      </p>
                    </div>
                    <p className="text-xs text-foreground/40">
                      Luego de realizar la transferencia, presioná el botón
                      para registrar tu inscripción.
                    </p>
                    <Button
                      onClick={handleOfflineSubmit}
                      disabled={submitting}
                      className="w-full bg-foreground hover:bg-foreground/80 text-background font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        "Registrar inscripción"
                      )}
                    </Button>
                  </div>
                )}

                {metodoPago === "paypal" && (
                  <div className="glass rounded-lg p-4 text-sm space-y-2 border border-mystic-700/20">
                    <p className="text-foreground/70">
                      Vas a ser redirigido a PayPal para completar tu pago de{" "}
                      <strong className="text-gold-300">
                        ${Number(monto).toLocaleString("es-AR")} ARS
                      </strong>
                      .
                    </p>
                    <Button
                      onClick={() => handlePay("paypal")}
                      disabled={submitting}
                      variant="outline"
                      className="w-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        "Pagar con PayPal"
                      )}
                    </Button>
                  </div>
                )}

                {metodoPago === "western_union" && (
                  <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
                    <p className="text-foreground/70">
                      Para pagar con Western Union por{" "}
                      <strong className="text-gold-300">
                        ${Number(monto).toLocaleString("es-AR")} ARS
                      </strong>
                      , contactá a Fernanda para recibir los datos de
                      transferencia.
                    </p>
                    <p className="text-xs text-foreground/40">
                      Luego de realizar el envío, presioná el botón para
                      registrar tu inscripción.
                    </p>
                    <Button
                      onClick={handleOfflineSubmit}
                      disabled={submitting}
                      variant="outline"
                      className="w-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        "Registrar inscripción"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
