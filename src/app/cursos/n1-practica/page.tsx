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

const PRICE_ARS = 35000;
const PRICE_USD = 30;

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

interface FormErrors {
  [key: string]: string;
}

const meditationOptions = [
  "Guiadas",
  "En silencio",
  "Solo con música",
  "Visualizaciones",
  "Me cuesta meditar",
  "Otro",
];

const medFrequencyOptions = [
  "Todos los días",
  "Cada 3 días",
  "Una vez a la semana",
  "Cuando me acuerdo o puedo",
  "Otro",
];

const FORM_KEY = "etersomos_n1practica_form";

export default function N1PracticaPage() {
  const [agreementOpen, setAgreementOpen] = useState(true);
  const [formPaused, setFormPaused] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});

  // Form fields
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [lectorAkashico, setLectorAkashico] = useState("");
  const [porQue, setPorQue] = useState("");
  const [profesion, setProfesion] = useState("");
  const [enfermedadCronica, setEnfermedadCronica] = useState("");
  const [medicacion, setMedicacion] = useState("");
  const [medicacionTiempo, setMedicacionTiempo] = useState("");
  const [terapiaPsico, setTerapiaPsico] = useState("");
  const [terapiaPsicoTiempo, setTerapiaPsicoTiempo] = useState("");
  const [terapiaPsiquiatra, setTerapiaPsiquiatra] = useState("");
  const [terapiaPsiquiatraTiempo, setTerapiaPsiquiatraTiempo] = useState("");
  const [episodios, setEpisodios] = useState("");
  const [terapiasHolisticas, setTerapiasHolisticas] = useState("");
  const [meditacionFreq, setMeditacionFreq] = useState("");
  const [meditacionTipo, setMeditacionTipo] = useState<string[]>([]);
  const [plantasSagradas, setPlantasSagradas] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");
  const [temasPracticas, setTemasPracticas] = useState("");
  const [compartirExperiencias, setCompartirExperiencias] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setFormPaused(data.forms?.["n1-con-practica"] === false))
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
        if (parsed.ciudad) setCiudad(parsed.ciudad);
        if (parsed.telefono) setTelefono(parsed.telefono);
        if (parsed.lectorAkashico) setLectorAkashico(parsed.lectorAkashico);
        if (parsed.porQue) setPorQue(parsed.porQue);
        if (parsed.profesion) setProfesion(parsed.profesion);
        if (parsed.enfermedadCronica) setEnfermedadCronica(parsed.enfermedadCronica);
        if (parsed.medicacion) setMedicacion(parsed.medicacion);
        if (parsed.medicacionTiempo) setMedicacionTiempo(parsed.medicacionTiempo);
        if (parsed.terapiaPsico) setTerapiaPsico(parsed.terapiaPsico);
        if (parsed.terapiaPsicoTiempo) setTerapiaPsicoTiempo(parsed.terapiaPsicoTiempo);
        if (parsed.terapiaPsiquiatra) setTerapiaPsiquiatra(parsed.terapiaPsiquiatra);
        if (parsed.terapiaPsiquiatraTiempo) setTerapiaPsiquiatraTiempo(parsed.terapiaPsiquiatraTiempo);
        if (parsed.episodios) setEpisodios(parsed.episodios);
        if (parsed.terapiasHolisticas) setTerapiasHolisticas(parsed.terapiasHolisticas);
        if (parsed.meditacionFreq) setMeditacionFreq(parsed.meditacionFreq);
        if (Array.isArray(parsed.meditacionTipo)) setMeditacionTipo(parsed.meditacionTipo);
        if (parsed.plantasSagradas) setPlantasSagradas(parsed.plantasSagradas);
        if (parsed.disponibilidad) setDisponibilidad(parsed.disponibilidad);
        if (parsed.temasPracticas) setTemasPracticas(parsed.temasPracticas);
        if (parsed.compartirExperiencias) setCompartirExperiencias(parsed.compartirExperiencias);
        if (parsed.metodoPago) setMetodoPago(parsed.metodoPago);
        if (parsed._accepted) setAccepted(true);
      }
    } catch {}
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (email || nombre) {
      localStorage.setItem(FORM_KEY, JSON.stringify({
        email, nombre, fechaNac, nacionalidad, ciudad, telefono,
        lectorAkashico, porQue, profesion, enfermedadCronica,
        medicacion, medicacionTiempo, terapiaPsico, terapiaPsicoTiempo,
        terapiaPsiquiatra, terapiaPsiquiatraTiempo, episodios,
        terapiasHolisticas, meditacionFreq, meditacionTipo,
        plantasSagradas, disponibilidad, temasPracticas,
        compartirExperiencias, metodoPago,
        _accepted: accepted,
      }));
    }
  }, [email, nombre, fechaNac, nacionalidad, ciudad, telefono,
      lectorAkashico, porQue, profesion, enfermedadCronica,
      medicacion, medicacionTiempo, terapiaPsico, terapiaPsicoTiempo,
      terapiaPsiquiatra, terapiaPsiquiatraTiempo, episodios,
      terapiasHolisticas, meditacionFreq, meditacionTipo,
      plantasSagradas, disponibilidad, temasPracticas,
      compartirExperiencias, metodoPago, accepted]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email inválido";
    if (!nombre.trim()) e.nombre = "Requerido";
    if (!fechaNac) e.fechaNac = "Requerido";
    if (!nacionalidad.trim()) e.nacionalidad = "Requerido";
    if (!ciudad.trim()) e.ciudad = "Requerido";
    if (!telefono.trim()) e.telefono = "Requerido";
    if (!lectorAkashico) e.lectorAkashico = "Requerido";
    if (!porQue.trim()) e.porQue = "Requerido";
    if (!medicacion) e.medicacion = "Requerido";
    if (medicacion === "Otro" && !medicacionTiempo.trim()) e.medicacionTiempo = "Contanos más";
    if (!terapiaPsico) e.terapiaPsico = "Requerido";
    if (!terapiaPsiquiatra) e.terapiaPsiquiatra = "Requerido";
    if (!meditacionFreq) e.meditacionFreq = "Requerido";
    if (!disponibilidad.trim()) e.disponibilidad = "Requerido";
    if (!compartirExperiencias) e.compartirExperiencias = "Requerido";
    if (!metodoPago) e.metodoPago = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const enrollmentData = {
    email, nombre, fechaNac, nacionalidad, ciudad, telefono,
    lectorAkashico, porQue, profesion, enfermedadCronica,
    medicacion, medicacionTiempo, terapiaPsico, terapiaPsicoTiempo,
    terapiaPsiquiatra, terapiaPsiquiatraTiempo, episodios,
    terapiasHolisticas, meditacionFreq, meditacionTipo,
    plantasSagradas, disponibilidad, temasPracticas,
    compartirExperiencias, metodoPago,
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
          items: [{ id: 0, name: "1er Nivel con Práctica – Registros Akáshicos", quantity: 1, price: PRICE_ARS }],
          total: PRICE_ARS,
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
      const price = PRICE_ARS;
      await initiateCoursePayment({
        courseId: "n1-practica",
        courseName: "1er Nivel con Práctica – Registros Akáshicos",
        email,
        name: nombre,
        phone: telefono,
        price,
        usdPrice: PRICE_USD,
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
        <FormPausedBanner formKey="n1-con-practica" />
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
        <Badge className="bg-violet-500/20 text-violet-300">MÁS ELEGIDO</Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground leading-snug">
          Aprender a Conectar con el Campo Akashico
        </h1>
        <p className="text-foreground/50 font-serif italic">
          con PRÁCTICA INCLUIDA
        </p>
        <div className="inline-block glass rounded-full px-6 py-2 mt-2 space-y-1 text-center">
          <span className="text-violet-300 font-serif font-semibold text-lg block">
            ${PRICE_ARS.toLocaleString("es-AR")} ARS / US${PRICE_USD}
          </span>
          <span className="text-foreground/40 text-xs block">
            10% de descuento al inscribirte al 2do nivel
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
                  Por favor tomate el tiempo de leer completo este acuerdo, es
                  fundamental para que el curso se desarrolle en un marco de
                  total armonía y comprensión.
                </p>
                <p>
                  El objetivo principal de este curso es que aprendas a navegar
                  en el Campo Akashico, y puedas consultar tus Registros
                  Akashicos con acompañamiento práctico.{" "}
                  <strong className="text-foreground/90">
                    Incluye 2 clases prácticas individuales por videollamada.
                  </strong>
                </p>
              </div>

              {/* Includes */}
              <div className="space-y-3">
                <h3 className="text-violet-300 font-serif font-semibold text-base">
                  ¿Qué incluye?
                </h3>
                <ul className="space-y-1.5">
                  {[
                    "Material audiovisual pregrabado (8 módulos de 20 min cada uno)",
                    ...modules,
                    "Módulo 9 – PDF de Preguntas Frecuentes",
                    "2 clases prácticas individuales por videollamada",
                    "Oración de apertura y cierre PERSONALIZADA",
                    "Meditación guiada en audio",
                    "Material complementario en PDF",
                    "Material bibliográfico sugerido en PDF",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <Check className="size-3.5 text-violet-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="bg-mystic-700/30" />

              {/* Practice details */}
              <div className="space-y-3">
                <h3 className="text-violet-300 font-serif font-semibold text-base">
                  Detalles de las Prácticas
                </h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    Las prácticas se realizan de <strong className="text-foreground/80">lunes a viernes</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    Se necesita disponibilidad de <strong className="text-foreground/80">2 horas consecutivas</strong>, 1 a 2 veces por semana.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <strong className="text-foreground/80">2 clases prácticas</strong> dentro de los 30 días desde la inscripción.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    Tenés 1 semana para revisar el material teórico antes de las prácticas.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    Videollamadas individuales de <strong className="text-foreground/80">1h40 a 2h</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    Primer encuentro: evacuar dudas + primera práctica + entrega de oración personalizada.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    La oración tiene características propias y únicas.
                  </li>
                </ul>
              </div>

              <Separator className="bg-mystic-700/30" />

              {/* Conditions */}
              <div className="space-y-2">
                <h3 className="text-foreground/90 font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="size-4 text-violet-400" />
                  Condiciones Importantes
                </h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    Cancelaciones con menos de 24hs de anticipación no se recuperan.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    El material audiovisual <strong className="text-foreground/80">NO se puede descargar</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    No se realizan reembolsos.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <strong className="text-foreground/80">10% de descuento</strong> al inscribirse al 2do nivel.
                  </li>
                </ul>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* ── Accept terms ── */}
      <div className="flex items-start gap-3 glass rounded-xl p-4 border border-mystic-700/30">
        <Checkbox
          id="accept-terms"
          checked={accepted}
          onCheckedChange={(c) => setAccepted(c === true)}
          className="mt-0.5 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 data-[state=checked]:text-mystic-950"
        />
        <Label htmlFor="accept-terms" className="text-base text-foreground/80 cursor-pointer leading-relaxed">
          He leído y comprendido el marco y condiciones del curso. Al aceptar, podré completar mi formulario de inscripción.
          <span className="text-violet-400"> *</span>
        </Label>
      </div>

      {/* ── Form ── */}
      {accepted && (
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

              {/* Ciudad */}
              <Field label="Ciudad" required error={errors.ciudad}>
                <Input placeholder="Ej: Buenos Aires" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={errors.ciudad ? errorInputClass : inputClass} />
              </Field>

              {/* Teléfono */}
              <Field label="Teléfono" required error={errors.telefono}>
                <Input type="tel" placeholder="Ej: 1155123456" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={errors.telefono ? errorInputClass : inputClass} />
              </Field>

              <Separator className="bg-mystic-800/30" />

              {/* Lector Akashico */}
              <RadioField label="¿Sos lector de Registros Akáshicos?" required value={lectorAkashico} onChange={setLectorAkashico} error={errors.lectorAkashico} options={["Sí", "No", "Otro"]} name="lector" />

              {/* Por qué */}
              <Field label="¿Por qué te gustaría tomar este curso?" required error={errors.porQue}>
                <Textarea placeholder="Contanos tu motivación..." rows={3} value={porQue} onChange={(e) => setPorQue(e.target.value)} className={errors.porQue ? errorInputClass : inputClass} />
              </Field>

              {/* Profesión */}
              <Field label="¿A qué te dedicás? ¿Profesión?">
                <Input placeholder="Opcional" value={profesion} onChange={(e) => setProfesion(e.target.value)} className={inputClass} />
              </Field>

              {/* Enfermedad crónica */}
              <Field label="¿Alguna enfermedad crónica?">
                <Textarea placeholder="Opcional — si es así, detallá cuál" rows={2} value={enfermedadCronica} onChange={(e) => setEnfermedadCronica(e.target.value)} className={inputClass} />
              </Field>

              {/* Medicación */}
              <RadioField label="¿Tomas medicación?" required value={medicacion} onChange={setMedicacion} error={errors.medicacion} options={["Sí", "No", "Otro"]} name="medicacion" />
              {medicacion === "Otro" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                  <Label className="text-foreground/60 text-xs">Especificá</Label>
                  <Input placeholder="Contanos qué medicación tomás..." value={medicacionTiempo} onChange={(e) => setMedicacionTiempo(e.target.value)} className={inputClass} />
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
              <Field label="Episodios de ansiedad/depresión/ataques de pánico/diagnóstico psiquiátrico">
                <Textarea placeholder="Si经历的 algún episodio, contanos brevemente..." rows={2} value={episodios} onChange={(e) => setEpisodios(e.target.value)} className={inputClass} />
              </Field>

              {/* Terapias holísticas */}
              <Field label="¿Qué terapias holísticas realizaste?">
                <Textarea placeholder="Opcional — Yoga, reiki, etc." rows={2} value={terapiasHolisticas} onChange={(e) => setTerapiasHolisticas(e.target.value)} className={inputClass} />
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
                            checked
                              ? [...prev, opt]
                              : prev.filter((v) => v !== opt)
                          );
                        }}
                        className="border-mystic-600 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 data-[state=checked]:text-mystic-950"
                      />
                      {opt}
                    </Label>
                  ))}
                </div>
              </div>

              {/* Plantas sagradas */}
              <Field label="¿Tomaste plantas sagradas recientemente?">
                <Textarea placeholder="Opcional — (Nota: se recomienda no tomar plantas sagradas 24hs antes de las prácticas)" rows={2} value={plantasSagradas} onChange={(e) => setPlantasSagradas(e.target.value)} className={inputClass} />
                <p className="text-xs text-foreground/40 mt-1">Se recomienda no tomar plantas sagradas 24hs antes de las prácticas.</p>
              </Field>

              {/* Disponibilidad */}
              <Field label="Disponibilidad horaria (lunes a viernes)" required error={errors.disponibilidad}>
                <Textarea placeholder="Ej: Lunes y miércoles de 18 a 20hs" rows={2} value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className={errors.disponibilidad ? errorInputClass : inputClass} />
              </Field>

              {/* Temas para prácticas */}
              <Field label="Temas/preguntas que te gustaría tratar en las prácticas">
                <Textarea placeholder="Opcional — ¿Qué te gustaría explorar?" rows={2} value={temasPracticas} onChange={(e) => setTemasPracticas(e.target.value)} className={inputClass} />
              </Field>

              {/* Compartir experiencias */}
              <RadioField label="¿Querés compartir tus experiencias de forma anónima para contribuir con el curso?" required value={compartirExperiencias} onChange={setCompartirExperiencias} error={errors.compartirExperiencias} options={["Sí quiero contribuir", "No prefiero reservar"]} name="compartir" />

              <Separator className="bg-mystic-800/30" />

              {/* Método de pago */}
              <PaymentSection
                method={metodoPago}
                onChange={setMetodoPago}
                error={errors.metodoPago}
                submitting={submitting}
                priceArs={PRICE_ARS}
                priceUsd={PRICE_USD}
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

function PaymentSection({ method, onChange, error, submitting, priceArs, priceUsd, onPayMercadoPago, onPayPaypal, onSubmitOffline, inputClass }: {
  method: string; onChange: (v: string) => void; error?: string; submitting: boolean;
  priceArs: number; priceUsd: number;
  onPayMercadoPago: () => void; onPayPaypal: () => void; onSubmitOffline: () => void;
  inputClass: string;
}) {
  const errorInput = "bg-mystic-900/50 border-red-400/60 text-foreground placeholder:text-foreground/30";
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
    </div>
  );
}
