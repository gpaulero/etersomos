"use client";

import { useRouter } from "next/navigation";

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
import { ArrowUp } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

const PRICE_ARS = 60000;
const PRICE_USD = 50;
const DISCOUNT_ARS = 54000;
const DISCOUNT_USD = 45;

interface FormErrors {
  [key: string]: string;
}

const medFrequencyOptions = [
  "Todos los días",
  "Cada 3 días",
  "Una vez a la semana",
  "Cuando puedo",
  "Me cuesta",
  "Otro",
];

const meditationOptions = [
  "Guiadas",
  "En silencio",
  "Solo con música",
  "Visualizaciones",
  "Me cuesta meditar",
  "Otro",
];

const registrosFreqOptions = [
  "Todos los días",
  "Cada 3 días",
  "Semanal",
  "Cuando puedo",
  "Me cuesta",
  "Otro",
];

const FORM_KEY = "etersomos_n2_form";

export default function N2Page() {
  const [agreementOpen, setAgreementOpen] = useState(true);
  const [formPaused, setFormPaused] = useState(false);
    const confirmationItems = [
    "Declaro ser mayor de 18 años y que los datos proporcionados son verdaderos.",
    "Confirmo que ya aprendí a abrir mis propios Registros Akáshicos.",
    "Me comprometo a completar la formación dentro de los 2 meses.",
    "Comprendo que las clases prácticas no tienen opción de recuperación una vez definidos y aceptados los horarios.",
    "Comprendo que esta formación tiene un enfoque espiritual y no reemplaza atención, diagnóstico ni tratamiento médico o psicológico.",
    "Acepto que Fernanda Lucrecia Cardozo no se responsabiliza por decisiones o consecuencias derivadas de la formación ni de las consultas realizadas por quienes se encuentran en formación.",
    "Acepto que no se realizan reembolsos una vez abonada la formación.",
    "Acepto el derecho de admisión. Si mi inscripción no fuera aceptada, el importe abonado será reintegrado.",
  ];
  const [confirmations, setConfirmations] = useState<boolean[]>(Array(confirmationItems.length).fill(false));
  const allConfirmed = confirmations.every(Boolean);
  const [submitting, setSubmitting] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [ciudadNac, setCiudadNac] = useState("");
  const [ciudadActual, setCiudadActual] = useState("");
  const [telefono, setTelefono] = useState("");
  const [lectorAkashico, setLectorAkashico] = useState("");
  const [primerNivel, setPrimerNivel] = useState("");
  const [porQue, setPorQue] = useState("");
  const [enfermedadCronica, setEnfermedadCronica] = useState("");
  const [medicacion, setMedicacion] = useState("");
  const [medicacionOtro, setMedicacionOtro] = useState("");
  const [terapiaPsico, setTerapiaPsico] = useState("");
  const [terapiaPsicoTiempo, setTerapiaPsicoTiempo] = useState("");
  const [terapiaPsiquiatra, setTerapiaPsiquiatra] = useState("");
  const [terapiaPsiquiatraTiempo, setTerapiaPsiquiatraTiempo] = useState("");
  const [episodios, setEpisodios] = useState("");
  const [terapiasHolisticas, setTerapiasHolisticas] = useState("");
  const [meditacionFreq, setMeditacionFreq] = useState("");
  const [meditacionTipo, setMeditacionTipo] = useState<string[]>([]);
  const [registrosFreq, setRegistrosFreq] = useState("");
  const [plantasSagradas, setPlantasSagradas] = useState("");
  const [franjaHoraria, setFranjaHoraria] = useState("");
  const [compartirExperiencias, setCompartirExperiencias] = useState("");
  const [primerNivelConmigo, setPrimerNivelConmigo] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setFormPaused(data.forms?.["n2-completo"] === false))
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
        if (parsed.fechaNac) setFechaNac(parsed.fechaNac);
        if (parsed.nacionalidad) setNacionalidad(parsed.nacionalidad);
        if (parsed.ciudadNac) setCiudadNac(parsed.ciudadNac);
        if (parsed.ciudadActual) setCiudadActual(parsed.ciudadActual);
        if (parsed.telefono) setTelefono(parsed.telefono);
        if (parsed.lectorAkashico) setLectorAkashico(parsed.lectorAkashico);
        if (parsed.primerNivel) setPrimerNivel(parsed.primerNivel);
        if (parsed.porQue) setPorQue(parsed.porQue);
        if (parsed.enfermedadCronica) setEnfermedadCronica(parsed.enfermedadCronica);
        if (parsed.medicacion) setMedicacion(parsed.medicacion);
        if (parsed.medicacionOtro) setMedicacionOtro(parsed.medicacionOtro);
        if (parsed.terapiaPsico) setTerapiaPsico(parsed.terapiaPsico);
        if (parsed.terapiaPsicoTiempo) setTerapiaPsicoTiempo(parsed.terapiaPsicoTiempo);
        if (parsed.terapiaPsiquiatra) setTerapiaPsiquiatra(parsed.terapiaPsiquiatra);
        if (parsed.terapiaPsiquiatraTiempo) setTerapiaPsiquiatraTiempo(parsed.terapiaPsiquiatraTiempo);
        if (parsed.episodios) setEpisodios(parsed.episodios);
        if (parsed.terapiasHolisticas) setTerapiasHolisticas(parsed.terapiasHolisticas);
        if (parsed.meditacionFreq) setMeditacionFreq(parsed.meditacionFreq);
        if (Array.isArray(parsed.meditacionTipo)) setMeditacionTipo(parsed.meditacionTipo);
        if (parsed.registrosFreq) setRegistrosFreq(parsed.registrosFreq);
        if (parsed.plantasSagradas) setPlantasSagradas(parsed.plantasSagradas);
        if (parsed.franjaHoraria) setFranjaHoraria(parsed.franjaHoraria);
        if (parsed.compartirExperiencias) setCompartirExperiencias(parsed.compartirExperiencias);
        if (parsed.primerNivelConmigo) setPrimerNivelConmigo(parsed.primerNivelConmigo);
        if (parsed.metodoPago) setMetodoPago(parsed.metodoPago);
        if (Array.isArray(parsed._confirmations) && parsed._confirmations.length === confirmationItems.length) setConfirmations(parsed._confirmations);
      }
    } catch {}
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (email || nombre) {
      localStorage.setItem(FORM_KEY, JSON.stringify({
        email, nombre, fechaNac, nacionalidad, ciudadNac, ciudadActual,
        telefono, lectorAkashico, primerNivel, porQue, enfermedadCronica,
        medicacion, medicacionOtro, terapiaPsico, terapiaPsicoTiempo,
        terapiaPsiquiatra, terapiaPsiquiatraTiempo, episodios,
        terapiasHolisticas, meditacionFreq, meditacionTipo, registrosFreq,
        plantasSagradas, franjaHoraria, compartirExperiencias,
        primerNivelConmigo, metodoPago,
        _confirmations: confirmations,
      }));
    }
  }, [email, nombre, fechaNac, nacionalidad, ciudadNac, ciudadActual,
      telefono, lectorAkashico, primerNivel, porQue, enfermedadCronica,
      medicacion, medicacionOtro, terapiaPsico, terapiaPsicoTiempo,
      terapiaPsiquiatra, terapiaPsiquiatraTiempo, episodios,
      terapiasHolisticas, meditacionFreq, meditacionTipo, registrosFreq,
      plantasSagradas, franjaHoraria, compartirExperiencias,
      primerNivelConmigo, metodoPago, confirmations]);

  const hasDiscount = primerNivelConmigo === "Sí";
  const currentPriceArs = hasDiscount ? DISCOUNT_ARS : PRICE_ARS;
  const currentPriceUsd = hasDiscount ? DISCOUNT_USD : PRICE_USD;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email inválido";
    if (!nombre.trim()) e.nombre = "Requerido";
    if (!fechaNac) e.fechaNac = "Requerido";
    if (!nacionalidad.trim()) e.nacionalidad = "Requerido";
    if (!ciudadNac.trim()) e.ciudadNac = "Requerido";
    if (!ciudadActual.trim()) e.ciudadActual = "Requerido";
    if (!telefono.trim()) e.telefono = "Requerido";
    if (!lectorAkashico) e.lectorAkashico = "Requerido";
    if (!primerNivel.trim()) e.primerNivel = "Requerido";
    if (!porQue.trim()) e.porQue = "Requerido";
    if (!medicacion) e.medicacion = "Requerido";
    if (!terapiaPsico) e.terapiaPsico = "Requerido";
    if (!terapiaPsiquiatra) e.terapiaPsiquiatra = "Requerido";
    if (!episodios.trim()) e.episodios = "Requerido";
    if (!meditacionFreq) e.meditacionFreq = "Requerido";
    if (!registrosFreq) e.registrosFreq = "Requerido";
    if (!franjaHoraria.trim()) e.franjaHoraria = "Requerido";
    if (!compartirExperiencias) e.compartirExperiencias = "Requerido";
    if (!primerNivelConmigo) e.primerNivelConmigo = "Requerido";
    if (!metodoPago) e.metodoPago = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const enrollmentData = {
    email, nombre, fechaNac, nacionalidad, ciudadNac, ciudadActual,
    telefono, lectorAkashico, primerNivel, porQue, enfermedadCronica,
    medicacion, medicacionOtro, terapiaPsico, terapiaPsicoTiempo,
    terapiaPsiquiatra, terapiaPsiquiatraTiempo, episodios,
    terapiasHolisticas, meditacionFreq, meditacionTipo, registrosFreq,
    plantasSagradas, franjaHoraria, compartirExperiencias,
    primerNivelConmigo, hasDiscount, metodoPago,
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
          customerPhone: telefono,
          address: "Curso online",
          city: "N/A",
          province: "N/A",
          postalCode: "0000",
          items: [{ id: 0, name: "2do Nivel Completo – Registros Akáshicos", quantity: 1, price: currentPriceArs }],
          total: currentPriceArs,
          paymentMethod: metodoPago,
          extraData: { formData: enrollmentData },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem(FORM_KEY);
        router.push("/cursos/gracias");
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
      const price = currentPriceArs;
      await initiateCoursePayment({
        courseId: "n2-completo",
        courseName: "2do Nivel Completo – Registros Akáshicos",
        email,
        name: nombre,
        phone: telefono,
        price,
        usdPrice: currentPriceUsd,
        paymentMethod: method,
        enrollmentData,
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
        <FormPausedBanner formKey="n2-completo" />
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
        <Badge>NIVEL 2</Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground leading-snug">
          Aprendé a Consultar los Registros Akáshicos de Otras Personas
        </h1>
        <p className="text-foreground/50 font-serif italic">
          con PRÁCTICA INCLUIDA
        </p>
        <div className="inline-block glass rounded-full px-6 py-2 mt-2 space-y-1 text-center">
          <span className="text-violet-300 font-serif font-semibold text-lg block">
            {hasDiscount ? (
              <>
                <span className="line-through text-foreground/40 mr-2">
                  ${PRICE_ARS.toLocaleString("es-AR")} ARS
                </span>
                ${DISCOUNT_ARS.toLocaleString("es-AR")} ARS / US${DISCOUNT_USD}
              </>
            ) : (
              <>
                ${PRICE_ARS.toLocaleString("es-AR")} ARS / US${PRICE_USD}
              </>
            )}
          </span>
          <span className="text-foreground/40 text-xs block">
            {hasDiscount ? "✨ Precio con 10% de descuento" : "10% de descuento si hiciste el 1er nivel conmigo"}
          </span>
        </div>
      </div>

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
                        <CardContent className="pt-4 space-y-5">
              <div className="text-sm text-foreground/70 leading-relaxed space-y-3">
                <p className="text-violet-400/80 font-medium">
                  En este curso vas a aprender a abrir y consultar los Registros
                  Akáshicos de otras personas, desde un enfoque espiritual y
                  priorizando siempre el bienestar y mayor bien de quienes participan.
                </p>
                <p>
                  Está dirigido a personas que ya aprendieron a abrir sus propios
                  Registros Akáshicos y desean comenzar a realizar consultas a otras
                  personas. Si aún no aprendiste a abrir tus propios Registros,
                  primero debés realizar el Nivel 1.
                </p>
                <p>
                  La formación es 100% online y consta de una etapa{" "}
                  <strong className="text-foreground/90">teórica</strong> y otra{" "}
                  <strong className="text-foreground/90">práctica</strong>.
                </p>
              </div>

              {/* Etapa teórica */}
              <div className="space-y-3">
                <h3 className="text-violet-300 font-serif font-semibold text-base">Etapa Teórica</h3>
                <ul className="space-y-1.5">
                  {[
                    "10 módulos audiovisuales pregrabados de aproximadamente 20 minutos",
                    "Autoevaluación online",
                    "Contenidos: ética y responsabilidad · bloqueos y protección · esferas de exploración · canales y tipos de información · cómo reconocer y transmitir la información · apertura de Registros de otras personas · estructura de una consulta · lecturas offline y por videollamada · preguntas frecuentes",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <Check className="size-3.5 text-violet-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-foreground/60">
                  Una vez realizada tu contribución te enviaremos las credenciales por mail
                  para que puedas acceder al aula virtual. Allí encontrarás todo el material
                  teórico para seguirlo a tu ritmo.
                </p>
              </div>

              <Separator className="bg-mystic-700/30" />

              {/* Etapa práctica */}
              <div className="space-y-3">
                <h3 className="text-violet-300 font-serif font-semibold text-base">Etapa Práctica</h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    4 encuentros semanales por videollamada: <strong className="text-foreground/80">3 clases de 2:30 hs + 1 clase final de 1 hora</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    En cada encuentro trabajarás los Registros de uno de tus <strong className="text-foreground/80">3 consultantes voluntarios</strong>, que deberás conseguir previamente (solo necesitaremos su nombre completo, fecha de nacimiento y una pregunta o tema).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    <strong className="text-foreground/80">Clase 1:</strong> repaso teórico, recorrido de esferas (línea y árbol), conexión al Akasha y búsqueda de respuestas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    <strong className="text-foreground/80">Clase 2:</strong> recorrido de esferas (vidas pasadas y flujos temporales paralelos), conexión y búsqueda de respuestas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    <strong className="text-foreground/80">Clase 3:</strong> repaso, conexión al Akasha y búsqueda de respuestas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    <strong className="text-foreground/80">Clase 4:</strong> mentoría sobre lectura offline, resolución de dudas, envío de una lectura completa al consultante y cierre.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Las primeras 2 clases son ejercicios prácticos, no lecturas completas. Las 2 últimas incluyen una lectura offline completa.</span>
                  </li>
                </ul>
              </div>

              <Separator className="bg-mystic-700/30" />

              {/* Plazos y disponibilidad */}
              <div className="space-y-3">
                <h3 className="text-violet-300 font-serif font-semibold text-base">Plazos y Disponibilidad</h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    La formación debe completarse dentro de los <strong className="text-foreground/80">2 meses</strong> posteriores a la inscripción (plazo máximo: 2 meses y medio). Luego tendrá costo adicional para continuar o se dará por finalizada.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Como fui mamá hace poquito estoy retomando actividades de a poco 🥰, por ahora mi disponibilidad es de lunes a viernes de 18 a 20 hs ARG. Y sábados de 10 a 14 hs ARG. Más abajo podrás indicarme la disponibilidad que prefieras así coordinamos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Toda la información compartida durante tus prácticas es confidencial.</span>
                  </li>
                </ul>
              </div>

              <Separator className="bg-mystic-700/30" />

              {/* Valor */}
              <div className="space-y-3">
                <h3 className="text-violet-300 font-serif font-semibold text-base">Valor</h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Argentina: <strong className="text-foreground/80">$60.000 ARS</strong>, mediante Mercado Pago o transferencia bancaria. También podés abonar en cuotas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Fuera de Argentina: <strong className="text-foreground/80">USD 50</strong>, mediante PayPal o Western Union.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    Si estás en Argentina y abonás por PayPal, el valor es USD 50.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
<span className="flex-1 min-w-0">                    <strong className="text-foreground/80">Beneficio:</strong> quienes hayan realizado conmigo el Nivel 1 tienen un 10% de descuento ($54.000 ARS / USD 45).</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

            {/* ── Confirmaciones obligatorias ── */}
      <div className="p-5 rounded-xl border border-violet-400/40 bg-violet-500/5">
        <p className="text-sm text-foreground mb-4">
          Confirmá los siguientes puntos antes de continuar:
        </p>
        <div className="space-y-3">
          {confirmationItems.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={confirmations[i]}
                onCheckedChange={(checked) =>
                  setConfirmations((prev) => prev.map((c, j) => (j === i ? checked === true : c)))
                }
                className="mt-0.5 size-5 shrink-0 border-violet-400/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 data-[state=checked]:text-white"
              />
              <span className="text-sm text-foreground leading-relaxed">{item}</span>
            </label>
          ))}
        </div>
      </div>

{/* ── Form ── */}
      {allConfirmed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass border-mystic-700/30">
            <CardHeader>
              <CardTitle className="text-lg text-violet-300 font-serif">Formulario de Inscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Email */}
              <Field label="Correo electrónico" required error={errors.email}>
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? errorInputClass : inputClass} />
              </Field>

              {/* Nombre */}
              <Field label="Nombre y apellido completo" required error={errors.nombre}>
                <Input placeholder="Ej: María González" value={nombre} onChange={(e) => setNombre(e.target.value)} className={errors.nombre ? errorInputClass : inputClass} />
              </Field>

              {/* Fecha de nacimiento */}
              <Field label="Fecha de nacimiento" required error={errors.fechaNac}>
                <Input type="date" value={fechaNac} onChange={(e) => setFechaNac(e.target.value)} className={errors.fechaNac ? errorInputClass : inputClass} />
              </Field>

              {/* Nacionalidad */}
              <Field label="Nacionalidad" required error={errors.nacionalidad}>
                <Input placeholder="Ej: Argentina" value={nacionalidad} onChange={(e) => setNacionalidad(e.target.value)} className={errors.nacionalidad ? errorInputClass : inputClass} />
              </Field>

              {/* Ciudad de nacimiento */}
              <Field label="Ciudad de nacimiento" required error={errors.ciudadNac}>
                <Input placeholder="Ej: Rosario" value={ciudadNac} onChange={(e) => setCiudadNac(e.target.value)} className={errors.ciudadNac ? errorInputClass : inputClass} />
              </Field>

              {/* Ciudad actual */}
              <Field label="Ciudad actual" required error={errors.ciudadActual}>
                <Input placeholder="Ej: Buenos Aires" value={ciudadActual} onChange={(e) => setCiudadActual(e.target.value)} className={errors.ciudadActual ? errorInputClass : inputClass} />
              </Field>

              {/* Teléfono */}
              <Field label="Teléfono" required error={errors.telefono}>
                <Input type="tel" placeholder="Ej: 1155123456" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={errors.telefono ? errorInputClass : inputClass} />
              </Field>

              <Separator className="bg-mystic-800/30" />

              {/* Lector Akashico */}
              <RadioField label="¿Sos lector de Registros Akáshicos?" required value={lectorAkashico} onChange={setLectorAkashico} error={errors.lectorAkashico} options={["Sí", "No", "Otro"]} name="lector" />
              {lectorAkashico === "No" && (
                <div className="glass rounded-lg p-3 border border-violet-400/20 text-sm text-violet-300">
                  Si no sos lector de Registros Akáshicos, dirigite al{" "}
                  <a href="/cursos/n1-teorico" className="underline">primer nivel</a>.
                </div>
              )}

              {/* Primer nivel conmigo */}
              <Field label="¿Realizaste el primer nivel conmigo u otro espacio?" required error={errors.primerNivel}>
                <Textarea placeholder="Contanos dónde y con quién realizaste el primer nivel..." rows={2} value={primerNivel} onChange={(e) => setPrimerNivel(e.target.value)} className={errors.primerNivel ? errorInputClass : inputClass} />
              </Field>

              {/* Por qué */}
              <Field label="¿Por qué te gustaría inscribirte?" required error={errors.porQue}>
                <Textarea placeholder="Contanos tu motivación..." rows={3} value={porQue} onChange={(e) => setPorQue(e.target.value)} className={errors.porQue ? errorInputClass : inputClass} />
              </Field>

              {/* Enfermedad crónica */}
              <Field label="¿Alguna enfermedad crónica?">
                <Textarea placeholder="Opcional" rows={2} value={enfermedadCronica} onChange={(e) => setEnfermedadCronica(e.target.value)} className={inputClass} />
              </Field>

              {/* Medicación */}
              <RadioField label="¿Tomas medicación?" required value={medicacion} onChange={setMedicacion} error={errors.medicacion} options={["Sí", "No", "Otro"]} name="medicacion" />
              {medicacion === "Otro" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                  <Label className="text-foreground/60 text-xs">Especificá</Label>
                  <Input placeholder="Contanos qué medicación tomás..." value={medicacionOtro} onChange={(e) => setMedicacionOtro(e.target.value)} className={inputClass} />
                </motion.div>
              )}

              {/* Terapia psicológica */}
              <RadioField label="¿Hiciste terapia psicológica?" required value={terapiaPsico} onChange={setTerapiaPsico} error={errors.terapiaPsico} options={["Sí", "No", "Otro"]} name="psico" />
              {terapiaPsico === "Sí" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                  <Label className="text-foreground/60 text-xs">¿Por cuánto tiempo?</Label>
                  <Input placeholder="Ej: 2 años" value={terapiaPsicoTiempo} onChange={(e) => setTerapiaPsicoTiempo(e.target.value)} className={inputClass} />
                </motion.div>
              )}

              {/* Terapia psiquiátrica */}
              <RadioField label="¿Hiciste terapia psiquiátrica?" required value={terapiaPsiquiatra} onChange={setTerapiaPsiquiatra} error={errors.terapiaPsiquiatra} options={["Sí", "No", "Otro"]} name="psiquiatra" />
              {terapiaPsiquiatra === "Sí" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                  <Label className="text-foreground/60 text-xs">¿Por cuánto tiempo?</Label>
                  <Input placeholder="Ej: 1 año" value={terapiaPsiquiatraTiempo} onChange={(e) => setTerapiaPsiquiatraTiempo(e.target.value)} className={inputClass} />
                </motion.div>
              )}

              {/* Episodios */}
              <Field label="Episodios de ansiedad/depresión/ataques de pánico/diagnóstico psiquiátrico" required error={errors.episodios}>
                <Textarea placeholder="Si experimentaste algún episodio, contanos brevemente..." rows={2} value={episodios} onChange={(e) => setEpisodios(e.target.value)} className={errors.episodios ? errorInputClass : inputClass} />
              </Field>

              {/* Terapias holísticas */}
              <Field label="¿Qué terapias holísticas realizaste?">
                <Textarea placeholder="Opcional" rows={2} value={terapiasHolisticas} onChange={(e) => setTerapiasHolisticas(e.target.value)} className={inputClass} />
              </Field>

              <Separator className="bg-mystic-800/30" />

              {/* Meditación frecuencia */}
              <RadioField label="¿Con qué regularidad meditas?" required value={meditacionFreq} onChange={setMeditacionFreq} error={errors.meditacionFreq} options={medFrequencyOptions} name="med-freq" />

              {/* Meditación tipo */}
              <div className="space-y-2.5">
                <Label className="text-foreground/80 text-sm">¿Qué tipo de meditaciones?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {meditationOptions.map((opt) => (
                    <Label
                      key={opt}
                      className={`flex items-center gap-2 cursor-pointer rounded-lg border p-2.5 text-sm transition-colors ${
                        meditacionTipo.includes(opt)
                          ? "border-violet-400/60 bg-violet-400/5 text-violet-300"
                          : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
                      }`}
                    >
                      <Checkbox
                        checked={meditacionTipo.includes(opt)}
                        onCheckedChange={(checked) => {
                          setMeditacionTipo((prev) =>
                            checked ? [...prev, opt] : prev.filter((v) => v !== opt)
                          );
                        }}
                        className="border-mystic-600 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 data-[state=checked]:text-mystic-950"
                      />
                      {opt}
                    </Label>
                  ))}
                </div>
              </div>

              {/* Registros frecuencia */}
              <RadioField label="¿Con qué regularidad abrís tus propios registros?" required value={registrosFreq} onChange={setRegistrosFreq} error={errors.registrosFreq} options={registrosFreqOptions} name="registros-freq" />

              {/* Plantas sagradas */}
              <Field label="¿Tomaste plantas sagradas recientemente?">
                <Textarea placeholder="Opcional — (Nota: se recomienda no tomar plantas sagradas 24hs antes de las prácticas)" rows={2} value={plantasSagradas} onChange={(e) => setPlantasSagradas(e.target.value)} className={inputClass} />
                <p className="text-xs text-foreground/40 mt-1">Se recomienda no tomar plantas sagradas 24hs antes de las prácticas.</p>
              </Field>

              {/* Franja horaria */}
              <Field label="Franja horaria disponible (mínimo 3 horas consecutivas)" required error={errors.franjaHoraria}>
                <Textarea placeholder="Ej: Lunes a viernes de 14 a 17hs" rows={2} value={franjaHoraria} onChange={(e) => setFranjaHoraria(e.target.value)} className={errors.franjaHoraria ? errorInputClass : inputClass} />
              </Field>

              {/* Compartir experiencias */}
              <RadioField label="¿Querés compartir tus experiencias de forma anónima?" required value={compartirExperiencias} onChange={setCompartirExperiencias} error={errors.compartirExperiencias} options={["Sí quiero contribuir", "No prefiero reservar"]} name="compartir" />

              <Separator className="bg-mystic-800/30" />

              {/* ¿Realizaste el primer nivel CONMIGO? - this determines price */}
              <div className="space-y-3 glass rounded-xl p-4 border border-violet-400/20">
                <Label className="text-violet-300 font-serif font-semibold text-sm">
                  ¿Realizaste el primer nivel CONMIGO (Fernanda)?
                </Label>
                <RadioGroup value={primerNivelConmigo} onValueChange={setPrimerNivelConmigo} className="flex gap-3">
                  {["Sí", "No"].map((opt) => (
                    <Label
                      key={opt}
                      htmlFor={`conmigo-${opt}`}
                      className={`flex items-center gap-2 cursor-pointer rounded-lg border px-6 py-3 text-sm font-medium transition-colors ${
                        primerNivelConmigo === opt
                          ? "border-violet-400/60 bg-violet-400/10 text-violet-300"
                          : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
                      }`}
                    >
                      <RadioGroupItem value={opt} id={`conmigo-${opt}`} className="border-mystic-600" />
                      {opt === "Sí" ? "Sí, con Fernanda" : "No, con otro espacio"}
                    </Label>
                  ))}
                </RadioGroup>
                {errors.primerNivelConmigo && (
                  <p className="text-red-400 text-xs">{errors.primerNivelConmigo}</p>
                )}
                {primerNivelConmigo && (
                  <div className="text-center glass rounded-lg p-3 border border-mystic-700/20">
                    <span className="text-sm text-foreground/70">
                      Precio final:{" "}
                      <strong className="text-violet-300 text-base">
                        ${currentPriceArs.toLocaleString("es-AR")} ARS / US${currentPriceUsd}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Método de pago */}
              <PaymentSection
                method={metodoPago}
                onChange={setMetodoPago}
                error={errors.metodoPago}
                submitting={submitting}
                priceArs={currentPriceArs}
                priceUsd={currentPriceUsd}
                onPayMercadoPago={() => handlePay("mercadopago")}
                onPayPaypal={() => handlePay("paypal")}
                onSubmitOffline={handleOfflineSubmit}
                inputClass={inputClass}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Reusable sub-components ── */

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground/80 text-sm">
        {label} {required && <span className="text-violet-400">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function RadioField({ label, required, value, onChange, error, options, name }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; error?: string; options: string[]; name: string;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-foreground/80 text-sm">
        {label} {required && <span className="text-violet-400">*</span>}
      </Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <Label
            key={opt}
            htmlFor={`${name}-${opt}`}
            className={`flex items-center gap-2 cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
              value === opt
                ? "border-violet-400/60 bg-violet-400/5 text-violet-300"
                : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
            }`}
          >
            <RadioGroupItem value={opt} id={`${name}-${opt}`} className="border-mystic-600" />
            {opt}
          </Label>
        ))}
      </RadioGroup>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function PaymentSection({ method, onChange, error, submitting, priceArs, priceUsd, onPayMercadoPago, onPayPaypal, onSubmitOffline }: {
  method: string; onChange: (v: string) => void; error?: string; submitting: boolean;
  priceArs: number; priceUsd: number;
  onPayMercadoPago: () => void; onPayPaypal: () => void; onSubmitOffline: () => void;
  inputClass: string;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-foreground/80 text-sm">Método de pago <span className="text-violet-400">*</span></Label>
      <RadioGroup value={method} onValueChange={onChange} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              method === opt.value
                ? "border-violet-400/60 bg-violet-400/5 text-violet-300"
                : "border-mystic-700/40 text-foreground/60 hover:border-mystic-600"
            }`}
          >
            <RadioGroupItem value={opt.value} id={`pago-${opt.value}`} className="border-mystic-600" />
            {opt.label}
          </Label>
        ))}
      </RadioGroup>
      {error && <p className="text-red-400 text-xs">{error}</p>}

      {method === "mercadopago" && (
        <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
          <p className="text-foreground/70">Vas a ser redirigido a MercadoPago para pagar <strong className="text-violet-300">${priceArs.toLocaleString("es-AR")} ARS</strong>.</p>
          <Button onClick={onPayMercadoPago} disabled={submitting} className="w-full bg-[#009ee3] hover:bg-[#008bc7] text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Pagar con MercadoPago"}
          </Button>
        </div>
      )}

      {method === "transferencia" && (
        <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
          <p className="text-foreground/70">Transferí <strong className="text-violet-300">${priceArs.toLocaleString("es-AR")} ARS</strong> a:</p>
          <div className="space-y-1 text-foreground/60">
            <p><span className="text-violet-400 font-medium">Banco:</span> Brubank</p>
            <p><span className="text-violet-400 font-medium">CBU:</span> 1430001713002632000014</p>
            <p><span className="text-violet-400 font-medium">Alias:</span> fer.cardozo</p>
          </div>
          <Button onClick={onSubmitOffline} disabled={submitting} className="w-full bg-foreground hover:bg-foreground/80 text-background font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Registrar inscripción"}
          </Button>
        </div>
      )}

      {method === "paypal" && (
        <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
          <p className="text-foreground/70">Vas a ser redirigido a PayPal para pagar <strong className="text-violet-300">US${priceUsd}</strong>.</p>
          <Button onClick={onPayPaypal} disabled={submitting} variant="outline" className="w-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Pagar con PayPal"}
          </Button>
        </div>
      )}

      {method === "western_union" && (
        <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
          <p className="text-foreground/70">Para Western Union contactá a Fernanda para los datos de transferencia (<strong className="text-violet-300">US${priceUsd}</strong>).</p>
          <Button onClick={onSubmitOffline} disabled={submitting} variant="outline" className="w-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Registrar inscripción"}
          </Button>
        </div>
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
    </div>
  );
}
