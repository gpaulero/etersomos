"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cmsValue, cmsNumber } from "@/lib/cms-helpers";
import { useSiteContent } from "@/hooks/use-site-content";

export default function CursosPage() {
  const { cmsMap } = useSiteContent();

  // CMS-driven price values
  const n1TeoricoArs = cmsNumber(cmsMap, 'courses.n1teorico_price_ars', 0);
  const n1TeoricoUsd = cmsNumber(cmsMap, 'courses.n1teorico_price_usd', 0);
  const n1TeoricoBadgeRaw = cmsValue(cmsMap, 'courses.n1teorico_badge', '');

  const n1PracticaArs = cmsNumber(cmsMap, 'courses.n1practica_price_ars', 45000);
  const n1PracticaUsd = cmsNumber(cmsMap, 'courses.n1practica_price_usd', 35);
  const n1PracticaBadgeRaw = cmsValue(cmsMap, 'courses.n1practica_badge', 'Más Elegido');

  const n2Ars = cmsNumber(cmsMap, 'courses.n2_price_ars', 60000);
  const n2Usd = cmsNumber(cmsMap, 'courses.n2_price_usd', 50);
  const n2BadgeRaw = cmsValue(cmsMap, 'courses.n2_badge', '');

  const ambosArs = cmsNumber(cmsMap, 'courses.ambos_price_ars', 85000);
  const ambosUsd = cmsNumber(cmsMap, 'courses.ambos_price_usd', 65);
  const ambosBadgeRaw = cmsValue(cmsMap, 'courses.ambos_badge', 'Mejor Precio');

  // Badge: if CMS returns empty string, set to null
  const n1TeoricoBadge = n1TeoricoBadgeRaw.trim() ? n1TeoricoBadgeRaw : null;
  const n1PracticaBadge = n1PracticaBadgeRaw.trim() ? n1PracticaBadgeRaw : null;
  const n2Badge = n2BadgeRaw.trim() ? n2BadgeRaw : null;
  const ambosBadge = ambosBadgeRaw.trim() ? ambosBadgeRaw : null;

  // Price labels
  const n1TeoricoPriceLabel = "Contribución Voluntaria";
  const n1PracticaPriceLabel = `$${n1PracticaArs.toLocaleString("es-AR")} ARS · US$${n1PracticaUsd}`;
  const n2PriceLabel = `$${n2Ars.toLocaleString("es-AR")} ARS · US$${n2Usd}`;
  const ambosPriceLabel = `$${ambosArs.toLocaleString("es-AR")} ARS · US$${ambosUsd}`;

  const courses = [
    {
      id: "n1-teorico",
      name: "1er Nivel Solo Teórico",
      subtitle: "Aprendé a Conectar con tus Registros Akáshicos",
      description:
        "Contribución voluntaria consciente. Material audiovisual de 8 módulos + material complementario en PDF.",
      duration: "A tu ritmo",
      priceLabel: n1TeoricoPriceLabel,
      badge: n1TeoricoBadge,
      badgeVariant: "secondary" as const,
      href: "/cursos/n1-teorico",
      features: [
        "8 módulos audiovisuales de 20 min cada uno",
        "Oración de apertura y cierre",
        "Meditación guiada en audio",
        "Material complementario teórico en PDF",
        "Material bibliográfico sugerido",
        "PDF de Preguntas Frecuentes",
      ],
    },
    {
      id: "n1-practica",
      name: "1er Nivel con Práctica",
      subtitle: "Aprendé a Conectar con el Campo Akashico",
      description:
        "Todo el material teórico + 2 clases prácticas individuales por videollamada de hasta 2 horas cada una.",
      duration: "~3 semanas",
      priceLabel: n1PracticaPriceLabel,
      badge: n1PracticaBadge,
      badgeVariant: "secondary" as const,
      href: "/cursos/n1-practica",
      features: [
        "Todo el contenido teórico (8 módulos)",
        "2 clases prácticas individuales por videollamada",
        "Oración de apertura personalizada y única",
        "Meditación guiada en audio",
        "Material complementario + bibliografía en PDF",
        "PDF de Preguntas Frecuentes",
      ],
    },
    {
      id: "n2-completo",
      name: "2do Nivel con Práctica",
      subtitle: "Aprendé a Consultar los Registros Akáshicos de Otras Personas",
      description:
        "Curso teórico/práctico para aprender a abrir y consultar los Registros de terceros. 10 módulos + 4 clases prácticas.",
      duration: "~4 semanas",
      priceLabel: n2PriceLabel,
      badge: n2Badge,
      badgeVariant: "secondary" as const,
      href: "/cursos/n2",
      features: [
        "10 módulos audiovisuales teóricos",
        "4 clases prácticas por videollamada",
        "Ejercicios con voluntarios reales",
        "Mentoría sobre modalidad Offline",
        "Autoevaluación online",
        "Material teórico complementario en PDF",
      ],
    },
    {
      id: "ambos-cursos",
      name: "Ambos Cursos",
      subtitle: "1er Nivel + 2do Nivel – Formación Completa",
      description:
        "Formación completa en Registros Akáshicos: autoconocimiento + consulta a terceros. Aprox. 7 semanas de cursado.",
      duration: "~7 semanas",
      priceLabel: ambosPriceLabel,
      badge: ambosBadge,
      badgeVariant: "secondary" as const,
      href: "/cursos/ambos",
      features: [
        "Todo el contenido del 1er Nivel con Práctica",
        "Todo el contenido del 2do Nivel con Práctica",
        "6 clases prácticas individuales",
        "Oración de apertura personalizada",
        "Seguimiento durante toda la formación",
        "Mejor precio por formación completa",
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 mb-4">
          <BookOpen className="size-5 text-violet-400" />
          <span className="text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase">
            Formación
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
          Cursos de Registros Akáshicos
        </h1>
        <p className="text-foreground/70 max-w-2xl mx-auto font-sans text-base sm:text-lg leading-relaxed">
          Aprendé a conectar con el Campo Akáshico, acceder a la sabiduría de tu alma y realizar
          lecturas akáshicas para vos mismo y para otros.
        </p>
        <p className="text-foreground/50 max-w-2xl mx-auto font-sans text-sm sm:text-base leading-relaxed mt-3">
          Elegí la opción que mejor se adapte a tu camino de aprendizaje.
          Todas las opciones incluyen material de estudio audiovisual, meditaciones guiadas
          y acompañamiento personalizado de Fer Cardozo.
        </p>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={course.href}
            className="group"
          >
            <div
              className={`relative glass-light rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] ${
                course.badge === "Mejor Precio"
                  ? "border-violet-500/40 ring-1 ring-violet-500/20 hover:border-violet-400/60"
                  : "hover:border-violet-500/50"
              }`}
            >
              {/* Glow effect for highlighted card */}
              {course.badge === "Mejor Precio" && (
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-violet-500/15 via-violet-500/5 to-transparent pointer-events-none animate-pulse opacity-50" />
              )}

              <div className="relative z-10 flex flex-col h-full">
                {/* Badge */}
                {course.badge && (
                  <div className="flex justify-center mb-4">
                    <span
                      className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs font-sans font-semibold rounded-full border ${
                        course.badge === "Mejor Precio"
                          ? "bg-violet-500/20 text-violet-300 border-violet-400/30"
                          : "bg-mystic-900/60 text-foreground border-mystic-700/40"
                      }`}
                    >
                      {course.badge === "Mejor Precio" && (
                        <span className="text-sm">⭐</span>
                      )}
                      {course.badge}
                    </span>
                  </div>
                )}

                {/* Title */}
                <div className="text-center mb-2">
                  <h2 className="text-xl font-serif font-semibold text-violet-300 group-hover:text-violet-200 transition-colors duration-300">
                    {course.name}
                  </h2>
                  <p className="text-foreground/50 text-sm font-sans mt-1">
                    {course.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-foreground/60 text-sm leading-relaxed text-center mb-4 font-sans">
                  {course.description}
                </p>

                {/* Price */}
                <div className="text-center mb-5">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-violet-300">
                    {course.priceLabel}
                  </span>
                  {course.duration !== "A tu ritmo" && (
                    <p className="text-xs text-foreground/40 mt-1 font-sans">
                      {course.duration}
                    </p>
                  )}
                </div>

                {/* Separator */}
                <div className="h-px bg-mystic-800/30 mb-5" />

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {course.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-foreground/70 font-sans"
                    >
                      <Check className="size-4 text-violet-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full rounded-full py-4 font-sans font-semibold text-sm transition-all duration-300 hover:scale-[1.02] ${
                    course.badge === "Mejor Precio"
                      ? "bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                      : "bg-foreground hover:bg-foreground/80 text-background"
                  }`}
                >
                  Inscribirme
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info note */}
      <div className="text-center">
        <div className="glass-light rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 text-foreground/50 text-sm font-sans">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-violet-400" />
              <span>Flexibilidad de horarios</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-violet-400" />
              <span>Clases individuales personalizadas</span>
            </div>
          </div>
          <p className="text-xs text-foreground/40 mt-4 font-sans">
            ¿Tenés dudas?{" "}
            <a
              href="https://wa.me/5493518629325"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400/70 hover:text-violet-400 underline underline-offset-2 transition-colors duration-300"
            >
              Escribinos por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
