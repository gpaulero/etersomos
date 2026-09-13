"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowUp,
  ChevronDown,
  Loader2,
  BookOpen,
  Check,
  AlertCircle,
  Users,
  Clock,
  Video,
  Sparkles,
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
import FormPausedBanner from "@/components/form-paused-banner";

/* ------------------------------------------------------------------ */
/*  PRICING                                                            */
/* ------------------------------------------------------------------ */
const PRICE_SINGLE = 20000;
const PRICE_PACK = 15000; // per session when 3+ sessions

/* ------------------------------------------------------------------ */
/*  AGREEMENT TEXT                                                    */
/* ------------------------------------------------------------------ */
const agreementText = `Los encuentros son personalizados, en formato videollamada 1:1, con una duración de 2 horas.

Podemos acordar la cantidad de encuentros que necesites, aunque la recomendación es realizar un encuentro semanal durante al menos un mes para sostener e integrar el proceso.

CONDICIONES:
- El valor por un solo encuentro es de $${PRICE_SINGLE.toLocaleString("es-AR")}.
- Pactando 3 o más encuentros al mes, el valor queda en $${PRICE_PACK.toLocaleString("es-AR")} por encuentro. Válido al abonar todos los encuentros juntos.
- No se realizan reembolsos.
- Fernanda se reserva el derecho de admisión.
- Como fui mamá hace poquito estoy retomando actividades de a poco 🥰, por ahora mi disponibilidad es de lunes a viernes de 18 a 20 hs ARG. Y sábados de 10 a 14 hs ARG. Más abajo podrás indicarme la disponibilidad que prefieras así coordinamos.`;

/* ------------------------------------------------------------------ */
/*  FORM FIELDS                                                       */
/* ------------------------------------------------------------------ */
interface FormErrors {
  [key: string]: string;
}

const FORM_KEY = "etersomos_mentorias_form";

export default function MentoriasPage() {
  const [agreementOpen, setAgreementOpen] = useState(true);
  const [formPaused, setFormPaused] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nivelCompletado, setNivelCompletado] = useState("");
  const [cantEncuentros, setCantEncuentros] = useState("1");
  const [motivo, setMotivo] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");
  const [compartirExperiencias, setCompartirExperiencias] = useState("");
  const [comoSeEnteraste, setComoSeEnteraste] = useState("");
  const [recomendadoNombre, setRecomendadoNombre] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  // Computed price
  const numEncuentros = Number(cantEncuentros) || 1;
  const precioPorEncuentro = numEncuentros >= 3 ? PRICE_PACK : PRICE_SINGLE;
  const totalARS = precioPorEncuentro * numEncuentros;

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setFormPaused(data.forms?.["mentorias"] === false))
      .catch(() => {});
  }, []);

  // Restore form data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.nombre) setNombre(parsed.nombre);
        if (parsed.nacionalidad) setNacionalidad(parsed.nacionalidad);
        if (parsed.ciudad) setCiudad(parsed.ciudad);
        if (parsed.telefono) setTelefono(parsed.telefono);
        if (parsed.nivelCompletado) setNivelCompletado(parsed.nivelCompletado);
        if (parsed.cantEncuentros) setCantEncuentros(parsed.cantEncuentros);
        if (parsed.motivo) setMotivo(parsed.motivo);
        if (parsed.disponibilidad) setDisponibilidad(parsed.disponibilidad);
        if (parsed.comoSeEnteraste) setComoSeEnteraste(parsed.comoSeEnteraste);
        if (parsed.recomendadoNombre) setRecomendadoNombre(parsed.recomendadoNombre);
        if (parsed.metodoPago) setMetodoPago(parsed.metodoPago);
        if (parsed._accepted) setAccepted(true);
      }
    } catch {}
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (email || nombre) {
      localStorage.setItem(FORM_KEY, JSON.stringify({
        email, nombre, nacionalidad, ciudad, telefono,
        nivelCompletado, cantEncuentros, motivo, disponibilidad,
        comoSeEnteraste, recomendadoNombre, metodoPago,
        _accepted: accepted,
      }));
    }
  }, [email, nombre, nacionalidad, ciudad, telefono,
      nivelCompletado, cantEncuentros, motivo, disponibilidad,
      comoSeEnteraste, recomendadoNombre, metodoPago, accepted]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "Ingresá tu correo electrónico";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Ingresá un email válido";
    if (!nombre.trim()) e.nombre = "Ingresá tu nombre y apellido completo";
    if (!nacionalidad.trim()) e.nacionalidad = "Ingresá tu nacionalidad";
    if (!ciudad.trim()) e.ciudad = "Ingresá tu ciudad actual";
    if (!nivelCompletado) e.nivelCompletado = "Seleccioná una opción";
    if (!cantEncuentros || Number(cantEncuentros) < 1)
      e.cantEncuentros = "Seleccioná la cantidad de encuentros";
    if (!motivo.trim()) e.motivo = "Contanos qué te motiva a realizar las mentorías";
    if (!disponibilidad.trim()) e.disponibilidad = "Indicá tu disponibilidad horaria";
    if (!comoSeEnteraste) e.comoSeEnteraste = "Seleccioná una opción";
    if (!metodoPago) e.metodoPago = "Seleccioná un método de pago";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const enrollmentData = {
    email, nombre, nacionalidad, ciudad, telefono,
    nivelCompletado, cantEncuentros, precioPorEncuentro,
    motivo, disponibilidad, comoSeEnteraste, recomendadoNombre, metodoPago,
  };

  const courseName = numEncuentros >= 3
    ? `Mentorías Akáshicas – Pack ${numEncuentros} encuentros`
    : "Mentorías Akáshicas – 1 encuentro";

  const handleOfflineSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/confirm-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mentoria_enrollment",
          customerName: nombre,
          customerEmail: email,
          customerPhone: telefono || "",
          address: "Mentoría online",
          city: "N/A",
          province: "N/A",
          postalCode: "0000",
          items: [{ id: 0, name: courseName, quantity: numEncuentros, price: precioPorEncuentro }],
          total: totalARS,
          paymentMethod: metodoPago,
          extraData: { formData: enrollmentData },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem(FORM_KEY);
        toast.success("Inscripción registrada con éxito", {
          description: "Recordá realizar la transferencia con los datos indicados. Te contactaremos para coordinar los encuentros.",
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
        courseId: "mentorias",
        courseName,
        email,
        name: nombre,
        phone: telefono || "",
        price: totalARS,
        paymentMethod: method,
        enrollmentData: {
          email,
          nombre,
          nacionalidad,
          ciudad,
          telefono,
          nivelCompletado,
          cantEncuentros,
          precioPorEncuentro,
          motivo,
          disponibilidad,
          comoSeEnteraste,
          recomendadoNombre:
            comoSeEnteraste === "Recomendación de familia o amigos"
              ? recomendadoNombre
              : "",
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
    "bg-mystic-900/50 border-mystic-700/40 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30";
  const errorInputClass =
    "bg-mystic-900/50 border-red-400/60 text-foreground placeholder:text-foreground/30";

  if (formPaused) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <FormPausedBanner formKey="mentorias" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* ── Title ── */}
      <div className="text-center space-y-3">
        <Badge variant="secondary">MENTORÍAS</Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground leading-snug">
          Mentorías para Lectores de Registros Akáshicos
        </h1>
        <p className="text-foreground/50 font-serif italic max-w-lg mx-auto">
          Acompañamiento personalizado para profundizar tu práctica y fortalecer la conexión con el Akasha
        </p>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 border border-violet-500/20 text-center">
          <Video className="size-8 text-violet-400 mx-auto mb-3" />
          <h3 className="font-serif font-semibold text-foreground text-sm mb-1">Videollamada 1:1</h3>
          <p className="text-foreground/50 text-xs">Encuentros personalizados en formato individual</p>
        </div>
        <div className="glass rounded-xl p-5 border border-violet-500/20 text-center">
          <Clock className="size-8 text-violet-400 mx-auto mb-3" />
          <h3 className="font-serif font-semibold text-foreground text-sm mb-1">2 horas</h3>
          <p className="text-foreground/50 text-xs">Duración de cada encuentro</p>
        </div>
        <div className="glass rounded-xl p-5 border border-violet-500/20 text-center">
          <Sparkles className="size-8 text-violet-400 mx-auto mb-3" />
          <h3 className="font-serif font-semibold text-foreground text-sm mb-1">Semanal</h3>
          <p className="text-foreground/50 text-xs">Se recomienda un encuentro semanal durante al menos un mes</p>
        </div>
      </div>

      {/* ── Description ── */}
      <Card className="glass border-violet-500/20">
        <CardContent className="pt-6">
          <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
            <p>
              Si ya sos lector/a de Registros Akáshicos, este espacio está creado para acompañarte a profundizar tu práctica y fortalecer la confianza en tu conexión con el Akasha.
            </p>
            <p>
              Las mentorías están orientadas a quienes deseen integrar con mayor claridad la lectura, comprender mejor la información que reciben y desarrollar seguridad en su canal.
            </p>
            <p>
              Para quienes hayan realizado el <strong className="text-foreground/90">Primer Nivel</strong>, trabajaremos sobre aquellos aspectos que necesiten ser iluminados, comprendidos o sanados, acompañando el proceso desde una mirada práctica y consciente.
            </p>
            <p>
              Y para quienes hayan realizado el <strong className="text-foreground/90">Segundo Nivel</strong>, los acompañaré en sus primeras lecturas a terceros, abriendo juntos los Registros de sus consultantes y guiando el proceso paso a paso.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Pricing ── */}
      <Card className="glass border-violet-500/20">
        <CardContent className="pt-6">
          <h2 className="text-lg font-serif font-semibold text-violet-300 mb-4 flex items-center gap-2">
            <Users className="size-5" />
            Valores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5 border border-mystic-700/30 text-center">
              <p className="text-foreground/50 text-xs font-sans uppercase tracking-wider mb-2">Un encuentro</p>
              <p className="text-2xl font-serif font-semibold text-foreground">
                ${PRICE_SINGLE.toLocaleString("es-AR")}
              </p>
              <p className="text-foreground/40 text-xs mt-1">Por encuentro individual</p>
            </div>
            <div className="glass rounded-xl p-5 border border-violet-400/40 ring-1 ring-violet-400/20 text-center relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                Recomendado
              </span>
              <p className="text-foreground/50 text-xs font-sans uppercase tracking-wider mb-2">3 o más encuentros</p>
              <p className="text-2xl font-serif font-semibold text-violet-400">
                ${PRICE_PACK.toLocaleString("es-AR")}
              </p>
              <p className="text-foreground/40 text-xs mt-1">Por encuentro (pago conjunto)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Agreement ── */}
      <Card className="glass border-mystic-700/30">
        <Collapsible open={agreementOpen} onOpenChange={setAgreementOpen}>
          <CardHeader className="pb-0">
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <CardTitle className="text-lg text-violet-300 font-serif flex items-center gap-2">
                <BookOpen className="size-5" />
                Acuerdo y Condiciones
              </CardTitle>
              <ChevronDown className="size-5 text-foreground/50 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line space-y-4">
              <p className="text-violet-300">
                  Importante: completá este formulario únicamente si estás segurx de que podrás comenzar tus clases a la brevedad.
                </p>
                </div>

              <Separator className="my-5 bg-mystic-700/30" />

              {/* Important conditions */}
              <div className="space-y-2">
                <h3 className="text-foreground/90 font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="size-4 text-violet-400" />
                  Condiciones Importantes
                </h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Los encuentros son personalizados, en formato{" "}
                    <strong className="text-foreground/80">
                      videollamada 1:1
                    </strong>, con una duración de 2 horas.</span>
                  </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span className="flex-1 min-w-0">En el exterior, el valor por encuentro es de <strong className="text-foreground/80">USD 20</strong>, y pactando 3 o más encuentros queda en <strong className="text-foreground/80">USD 15</strong> cada uno.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span className="flex-1 min-w-0">Las clases extras no tienen recuperación, por lo que es importante confirmar tu disponibilidad antes de reservar.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span className="flex-1 min-w-0">Los horarios se reservan una vez realizada la contribución. Podés enviar tu comprobante por WhatsApp o email.</span>
                    </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    El valor por un solo encuentro es de{" "}
                    <strong className="text-foreground/80">
                      ${PRICE_SINGLE.toLocaleString("es-AR")}
                    </strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Pactando 3 o más encuentros al mes, el valor queda en{" "}
                    <strong className="text-foreground/80">
                      ${PRICE_PACK.toLocaleString("es-AR")} por encuentro
                    </strong>. Válido al abonar todos los encuentros juntos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Se recomienda realizar un encuentro semanal durante al menos un mes para sostener e integrar el proceso.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    No se realizan reembolsos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Fernanda se reserva el derecho de admisión.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* ── Accept terms checkbox ── */}
      <div className="flex items-start gap-3 rounded-xl p-4 border-2 border-violet-500/40 bg-violet-500/10 backdrop-blur">
        <Checkbox
          id="accept-terms"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked === true)}
          className="mt-0.5 h-5 w-5 border-violet-400/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 data-[state=checked]:text-mystic-950"
        />
        <Label
          htmlFor="accept-terms"
          className="text-base text-foreground/80 cursor-pointer leading-relaxed"
        >
          He leído y comprendido el marco y condiciones de las mentorías. Al aceptar, podré completar mi formulario de inscripción.
          <span className="text-violet-400"> *</span>
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
              <CardTitle className="text-lg text-violet-300 font-serif">
                Formulario de Inscripción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground/80 text-sm">
                  Correo electrónico <span className="text-violet-400">*</span>
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
                  <span className="text-violet-400">*</span>
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

              {/* Nacionalidad */}
              <div className="space-y-1.5">
                <Label htmlFor="nacionalidad" className="text-foreground/80 text-sm">
                  Nacionalidad <span className="text-violet-400">*</span>
                </Label>
                <Input
                  id="nacionalidad"
                  placeholder="Ej: Argentina"
                  value={nacionalidad}
                  onChange={(e) => setNacionalidad(e.target.value)}
                  className={errors.nacionalidad ? errorInputClass : inputClass}
                />
                {errors.nacionalidad && (
                  <p className="text-red-400 text-xs">{errors.nacionalidad}</p>
                )}
              </div>

              {/* Ciudad */}
              <div className="space-y-1.5">
                <Label htmlFor="ciudad" className="text-foreground/80 text-sm">
                  Ciudad actual <span className="text-violet-400">*</span>
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

              {/* Nivel completado */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">
                  ¿Qué nivel de formación completaste?{" "}
                  <span className="text-violet-400">*</span>
                </Label>
                <RadioGroup
                  value={nivelCompletado}
                  onValueChange={setNivelCompletado}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {[
                    "1er Nivel (Solo Teórico)",
                    "1er Nivel con Práctica",
                    "2do Nivel Completo",
                    "Ambos Niveles",
                  ].map((opt) => (
                    <Label
                      key={opt}
                      htmlFor={`nivel-${opt}`}
                      className={`flex items-center gap-2 cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                        nivelCompletado === opt
                          ? "border-violet-400/60 bg-violet-400/5 text-violet-300"
                          : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`nivel-${opt}`}
                        className="border-mystic-600"
                      />
                      {opt}
                    </Label>
                  ))}
                </RadioGroup>
                {errors.nivelCompletado && (
                  <p className="text-red-400 text-xs">{errors.nivelCompletado}</p>
                )}
              </div>

              {/* Cantidad de encuentros */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">
                  ¿Cuántos encuentros querés realizar?{" "}
                  <span className="text-violet-400">*</span>
                </Label>
                <RadioGroup
                  value={cantEncuentros}
                  onValueChange={setCantEncuentros}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                >
                  {["1", "2", "3", "4"].map((opt) => (
                    <Label
                      key={opt}
                      htmlFor={`encuentros-${opt}`}
                      className={`flex items-center justify-center gap-1 cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                        cantEncuentros === opt
                          ? "border-violet-400/60 bg-violet-400/5 text-violet-300"
                          : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`encuentros-${opt}`}
                        className="border-mystic-600"
                      />
                      {opt === "1" ? "1 encuentro" : `${opt} encuentros`}
                    </Label>
                  ))}
                </RadioGroup>
                {errors.cantEncuentros && (
                  <p className="text-red-400 text-xs">{errors.cantEncuentros}</p>
                )}
                {/* Price summary */}
                <div className="glass rounded-lg p-3 border border-violet-500/20 text-sm">
                  <div className="flex justify-between text-foreground/60">
                    <span>Precio por encuentro:</span>
                    <span className="text-foreground/80 font-medium">${precioPorEncuentro.toLocaleString("es-AR")} ARS</span>
                  </div>
                  <div className="flex justify-between text-foreground/60 mt-1">
                    <span>Cantidad:</span>
                    <span className="text-foreground/80 font-medium">{numEncuentros}</span>
                  </div>
                  <Separator className="my-2 bg-mystic-700/30" />
                  <div className="flex justify-between">
                    <span className="text-foreground/80 font-semibold">Total:</span>
                    <span className="text-violet-400 font-bold text-lg">${totalARS.toLocaleString("es-AR")} ARS</span>
                  </div>
                  {numEncuentros >= 3 && (
                    <p className="text-violet-400/70 text-xs mt-2">
                      Aplicás precio especial por pack de 3+ encuentros
                    </p>
                  )}
                </div>
              </div>

              {/* Motivo */}
              <div className="space-y-1.5">
                <Label htmlFor="motivo" className="text-foreground/80 text-sm">
                  ¿Qué te motiva a realizar las mentorías?{" "}
                  <span className="text-violet-400">*</span>
                </Label>
                <textarea
                  id="motivo"
                  rows={3}
                  placeholder="Contanos brevemente qué buscás trabajar o profundizar..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm bg-mystic-900/50 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 resize-none ${
                    errors.motivo ? "border-red-400/60" : "border-mystic-700/40"
                  }`}
                />
                {errors.motivo && (
                  <p className="text-red-400 text-xs">{errors.motivo}</p>
                )}
              </div>

              {/* Disponibilidad */}
              <div className="space-y-1.5">
                <Label htmlFor="disponibilidad" className="text-foreground/80 text-sm">
                  Disponibilidad horaria <span className="text-violet-400">*</span>
                </Label>
                <textarea
                  id="disponibilidad"
                  rows={2}
                  placeholder="Ej: Lunes y miércoles de 18 a 21 hs, martes por la mañana..."
                  value={disponibilidad}
                  onChange={(e) => setDisponibilidad(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm bg-mystic-900/50 focus:border-violet-400/60 text-foreground placeholder:text-foreground/30 resize-none ${
                    errors.disponibilidad ? "border-red-400/60" : "border-mystic-700/40"
                  }`}
                />
                {errors.disponibilidad && (
                  <p className="text-red-400 text-xs">{errors.disponibilidad}</p>
                )}
              </div>

              <Separator className="bg-mystic-800/30" />

              {/* ¿Cómo te enteraste? */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">
                  ¿Cómo te enteraste de las mentorías?{" "}
                  <span className="text-violet-400">*</span>
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
                          ? "border-violet-400/60 bg-violet-400/5 text-violet-300"
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
                  <p className="text-red-400 text-xs">{errors.comoSeEnteraste}</p>
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

              {/* Método de pago */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">
                  Método de pago <span className="text-violet-400">*</span>
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
                          ? "border-violet-400/60 bg-violet-400/5 text-violet-300"
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
                      <strong className="text-violet-300">
                        ${totalARS.toLocaleString("es-AR")} ARS
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
                      <strong className="text-violet-300">
                        ${totalARS.toLocaleString("es-AR")} ARS
                      </strong>{" "}
                      a:
                    </p>
                    <div className="space-y-1 text-foreground/60">
                      <p>
                        <span className="text-violet-400 font-medium">Banco:</span>{" "}
                        Brubank
                      </p>
                      <p>
                        <span className="text-violet-400 font-medium">CBU:</span>{" "}
                        1430001713002632000014
                      </p>
                      <p>
                        <span className="text-violet-400 font-medium">Alias:</span>{" "}
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
                      <strong className="text-violet-300">
                        ${totalARS.toLocaleString("es-AR")} ARS
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
                      <strong className="text-violet-300">
                        ${totalARS.toLocaleString("es-AR")} ARS
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
      {/* Volver arriba */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30 flex items-center justify-center transition-all"
          aria-label="Volver arriba"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </motion.div>
  );
}
