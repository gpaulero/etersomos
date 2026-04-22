"use client";

import { useState } from "react";
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

const PRICE_ARS = 70000;
const PRICE_USD = 55;
const PRICE_USD_ALT = 50;

interface FormErrors {
  [key: string]: string;
}

const medFrequencyOptions = [
  "Todos los días",
  "Cada 3 días",
  "Una vez a la semana",
  "Cuando me acuerdo o puedo",
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

export default function AmbosPage() {
  const [agreementOpen, setAgreementOpen] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const [medicacionOtro, setMedicacionOtro] = useState("");
  const [terapiaPsico, setTerapiaPsico] = useState("");
  const [terapiaPsicoTiempo, setTerapiaPsicoTiempo] = useState("");
  const [terapiaPsiquiatra, setTerapiaPsiquiatra] = useState("");
  const [terapiaPsiquiatraTiempo, setTerapiaPsiquiatraTiempo] = useState("");
  const [episodios, setEpisodios] = useState("");
  const [terapiasHolisticas, setTerapiasHolisticas] = useState("");
  const [meditacionFreq, setMeditacionFreq] = useState("");
  const [meditacionTipo, setMeditacionTipo] = useState<string[]>([]);
  const [plantasSagradas, setPlantasSagradas] = useState("");
  const [temasPracticas, setTemasPracticas] = useState("");
  const [compartirExperiencias, setCompartirExperiencias] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email inválido";
    if (!nombre.trim()) e.nombre = "Requerido";
    if (!nacionalidad.trim()) e.nacionalidad = "Requerido";
    if (!ciudad.trim()) e.ciudad = "Requerido";
    if (!telefono.trim()) e.telefono = "Requerido";
    if (!lectorAkashico) e.lectorAkashico = "Requerido";
    if (!porQue.trim()) e.porQue = "Requerido";
    if (!profesion.trim()) e.profesion = "Requerido";
    if (!medicacion) e.medicacion = "Requerido";
    if (!terapiaPsico) e.terapiaPsico = "Requerido";
    if (!terapiaPsiquiatra) e.terapiaPsiquiatra = "Requerido";
    if (!episodios.trim()) e.episodios = "Requerido";
    if (!terapiasHolisticas.trim()) e.terapiasHolisticas = "Requerido";
    if (!meditacionFreq) e.meditacionFreq = "Requerido";
    if (!plantasSagradas.trim()) e.plantasSagradas = "Requerido";
    if (!temasPracticas.trim()) e.temasPracticas = "Requerido";
    if (!compartirExperiencias) e.compartirExperiencias = "Requerido";
    if (!disponibilidad.trim()) e.disponibilidad = "Requerido";
    if (!metodoPago) e.metodoPago = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const enrollmentData = {
    email, nombre, fechaNac, nacionalidad, ciudad, telefono,
    lectorAkashico, porQue, profesion, enfermedadCronica,
    medicacion, medicacionOtro, terapiaPsico, terapiaPsicoTiempo,
    terapiaPsiquiatra, terapiaPsiquiatraTiempo, episodios,
    terapiasHolisticas, meditacionFreq, meditacionTipo,
    plantasSagradas, temasPracticas, compartirExperiencias,
    disponibilidad, metodoPago,
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
          items: [{ id: 0, name: "Ambos Cursos – Formación Completa en Registros Akáshicos", quantity: 1, price: PRICE_ARS }],
          total: PRICE_ARS,
          paymentMethod: metodoPago,
          extraData: { formData: enrollmentData },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
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
    setSubmitting(true);
    try {
      const price = PRICE_ARS;
      await initiateCoursePayment({
        courseId: "ambos-cursos",
        courseName: "Ambos Cursos – Formación Completa en Registros Akáshicos",
        email,
        name: nombre,
        phone: telefono,
        price,
        usdPrice: PRICE_USD_ALT,
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
        <Badge className="bg-gold-500/20 text-gold-300">MEJOR PRECIO</Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-gold-400 text-glow-gold leading-snug">
          Formación Completa en Registros Akáshicos
        </h1>
        <p className="text-foreground/50 font-serif italic max-w-xl mx-auto">
          1er Nivel: Conectar con el Campo Akashico + 2do Nivel: Consultar los Registros de Otras Personas
        </p>
        <div className="inline-block glass rounded-full px-6 py-2 mt-2 space-y-1 text-center">
          <span className="text-gold-300 font-serif font-semibold text-lg block">
            ${PRICE_ARS.toLocaleString("es-AR")} ARS / US${PRICE_USD_ALT}
          </span>
          <span className="text-foreground/40 text-xs block">
            PayPal / Western Union: US${PRICE_USD_ALT} &middot; Mejor precio por formación completa
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
            <CardContent className="pt-4 space-y-5">
              <div className="text-sm text-foreground/70 leading-relaxed space-y-3">
                <p className="text-gold-400/80 font-medium">
                  Al inscribirte a ambos cursos, accedés a la formación completa en Registros Akáshicos.
                </p>
                <p>
                  La formación combina el contenido del 1er Nivel (conectar con el Campo Akashico) y el 2do Nivel (consultar los Registros de otras personas), completándose en un máximo de <strong className="text-foreground/90">2 meses</strong>.
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="text-gold-300 font-serif font-semibold text-base">Cronograma</h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    <strong className="text-foreground/80">1er Nivel (~3 semanas):</strong> 8 módulos teóricos + 2 clases prácticas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    <strong className="text-foreground/80">2do Nivel (~4 semanas):</strong> 10 módulos teóricos + 4 clases prácticas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    Total: <strong className="text-foreground/80">18 módulos + 6 clases prácticas</strong>
                  </li>
                </ul>
              </div>

              <Separator className="bg-mystic-700/30" />

              {/* What's included */}
              <div className="space-y-3">
                <h3 className="text-gold-300 font-serif font-semibold text-base">¿Qué incluye?</h3>
                <ul className="space-y-1.5">
                  {[
                    "Todo el contenido del 1er Nivel con Práctica",
                    "Todo el contenido del 2do Nivel Completo",
                    "6 clases prácticas individuales por videollamada",
                    "Oración de apertura personalizada y única",
                    "Meditación guiada en audio",
                    "Material complementario + bibliografía en PDF",
                    "PDF de Preguntas Frecuentes",
                    "Seguimiento durante toda la formación",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <Check className="size-3.5 text-gold-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="bg-mystic-700/30" />

              <div className="space-y-2">
                <h3 className="text-foreground/90 font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="size-4 text-gold-400" />
                  Condiciones Importantes
                </h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    Se necesita disponibilidad de <strong className="text-foreground/80">3 horas consecutivas</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    Ambos cursos se completan en un máximo de <strong className="text-foreground/80">2 meses</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    Si no tenés rutina de meditación, <strong className="text-foreground/80">mejor empezar solo con el 1er nivel</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">•</span>
                    No se realizan reembolsos.
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
          className="mt-0.5 data-[state=checked]:bg-gold-400 data-[state=checked]:border-gold-400 data-[state=checked]:text-mystic-950"
        />
        <Label htmlFor="accept-terms" className="text-sm text-foreground/80 cursor-pointer leading-relaxed">
          He leído, he comprendido y acepto el marco y condiciones de ambos cursos.
          <span className="text-gold-400"> *</span>
        </Label>
      </div>

      {/* ── Form ── */}
      {accepted && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass border-mystic-700/30">
            <CardHeader>
              <CardTitle className="text-lg text-gold-300 font-serif">Formulario de Inscripción – Ambos Cursos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Disponibilidad horaria (at the top, emphasized) */}
              <div className="glass rounded-xl p-4 border border-gold-400/20 space-y-2">
                <Field label="Disponibilidad horaria (3 horas consecutivas, lunes a viernes)" required error={errors.disponibilidad}>
                  <Textarea placeholder="Ej: Lunes y miércoles de 14 a 17hs" rows={2} value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className={errors.disponibilidad ? errorInputClass : inputClass} />
                </Field>
                <p className="text-xs text-foreground/40">Recordá que ambos cursos requieren disponibilidad de 3 horas consecutivas.</p>
              </div>

              {/* Email */}
              <Field label="Correo electrónico" required error={errors.email}>
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? errorInputClass : inputClass} />
              </Field>

              {/* Nombre */}
              <Field label="Nombre y apellido completo" required error={errors.nombre}>
                <Input placeholder="Ej: María González" value={nombre} onChange={(e) => setNombre(e.target.value)} className={errors.nombre ? errorInputClass : inputClass} />
              </Field>

              {/* Fecha de nacimiento */}
              <Field label="Fecha de nacimiento">
                <Input type="date" value={fechaNac} onChange={(e) => setFechaNac(e.target.value)} className={inputClass} />
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
              <Field label="¿A qué te dedicás? ¿Profesión?" required error={errors.profesion}>
                <Input placeholder="Ej: Diseñadora gráfica" value={profesion} onChange={(e) => setProfesion(e.target.value)} className={errors.profesion ? errorInputClass : inputClass} />
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
              <Field label="¿Qué terapias holísticas realizaste?" required error={errors.terapiasHolisticas}>
                <Textarea placeholder="Yoga, reiki, etc." rows={2} value={terapiasHolisticas} onChange={(e) => setTerapiasHolisticas(e.target.value)} className={errors.terapiasHolisticas ? errorInputClass : inputClass} />
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
                          ? "border-gold-400/60 bg-gold-400/5 text-gold-300"
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
                        className="border-mystic-600 data-[state=checked]:bg-gold-400 data-[state=checked]:border-gold-400 data-[state=checked]:text-mystic-950"
                      />
                      {opt}
                    </Label>
                  ))}
                </div>
              </div>

              {/* Plantas sagradas */}
              <Field label="¿Tomaste plantas sagradas recientemente?" required error={errors.plantasSagradas}>
                <Textarea placeholder="Si tomaste plantas sagradas recientemente, indicá cuáles..." rows={2} value={plantasSagradas} onChange={(e) => setPlantasSagradas(e.target.value)} className={errors.plantasSagradas ? errorInputClass : inputClass} />
                <p className="text-xs text-foreground/40 mt-1">Se recomienda no tomar plantas sagradas 24hs antes de las prácticas.</p>
              </Field>

              {/* Temas para prácticas */}
              <Field label="Temas/preguntas que te gustaría tratar en las prácticas" required error={errors.temasPracticas}>
                <Textarea placeholder="¿Qué te gustaría explorar en tus lecturas?" rows={2} value={temasPracticas} onChange={(e) => setTemasPracticas(e.target.value)} className={errors.temasPracticas ? errorInputClass : inputClass} />
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
                priceUsd={PRICE_USD_ALT}
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
        {label} {required && <span className="text-gold-400">*</span>}
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
        {label} {required && <span className="text-gold-400">*</span>}
      </Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <Label
            key={opt}
            htmlFor={`${name}-${opt}`}
            className={`flex items-center gap-2 cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
              value === opt
                ? "border-gold-400/60 bg-gold-400/5 text-gold-300"
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
      <Label className="text-foreground/80 text-sm">Método de pago <span className="text-gold-400">*</span></Label>
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
                ? "border-gold-400/60 bg-gold-400/5 text-gold-300"
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
          <p className="text-foreground/70">Vas a ser redirigido a MercadoPago para pagar <strong className="text-gold-300">${priceArs.toLocaleString("es-AR")} ARS</strong>.</p>
          <Button onClick={onPayMercadoPago} disabled={submitting} className="w-full bg-[#009ee3] hover:bg-[#008bc7] text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Pagar con MercadoPago"}
          </Button>
        </div>
      )}

      {method === "transferencia" && (
        <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
          <p className="text-foreground/70">Transferí <strong className="text-gold-300">${priceArs.toLocaleString("es-AR")} ARS</strong> a:</p>
          <div className="space-y-1 text-foreground/60">
            <p><span className="text-gold-400 font-medium">Banco:</span> Brubank</p>
            <p><span className="text-gold-400 font-medium">CBU:</span> 1430001713002632000014</p>
            <p><span className="text-gold-400 font-medium">Alias:</span> fer.cardozo</p>
          </div>
          <Button onClick={onSubmitOffline} disabled={submitting} className="w-full bg-foreground hover:bg-foreground/80 text-background font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Registrar inscripción"}
          </Button>
        </div>
      )}

      {method === "paypal" && (
        <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
          <p className="text-foreground/70">Vas a ser redirigido a PayPal para pagar <strong className="text-gold-300">US${priceUsd}</strong>.</p>
          <Button onClick={onPayPaypal} disabled={submitting} variant="outline" className="w-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Pagar con PayPal"}
          </Button>
        </div>
      )}

      {method === "western_union" && (
        <div className="glass rounded-lg p-4 text-sm space-y-3 border border-mystic-700/20">
          <p className="text-foreground/70">Para Western Union contactá a Fernanda para los datos de transferencia (<strong className="text-gold-300">US${priceUsd}</strong>).</p>
          <Button onClick={onSubmitOffline} disabled={submitting} variant="outline" className="w-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-60">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Registrar inscripción"}
          </Button>
        </div>
      )}
    </div>
  );
}
