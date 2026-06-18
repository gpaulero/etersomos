/**
 * JSON-LD Structured Data components for Eter Somos SEO
 * Schema.org types: LocalBusiness, Course, FAQPage, BreadcrumbList, Product, Offer
 */

const SITE_URL = "https://www.etersomos.com";

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: "Eter Somos",
    alternateName: "Eter Somos Registros Akáshicos",
    description:
      "Lecturas de Registros Akáshicos, cursos de formación, mentorías y cristales energéticos. Acompañamos tu camino espiritual desde Córdoba, Argentina.",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-etersomos.jpg`,
    image: `${SITE_URL}/images/logo-etersomos.jpg`,
    telephone: "+5493518629325",
    email: "etersomos@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Córdoba",
      addressRegion: "Córdoba",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -31.4201,
      longitude: -64.1888,
    },
    foundingDate: "2021",
    founder: {
      "@type": "Person",
      name: "Fer Cardozo",
      jobTitle: "Guía Espiritual y Lectora de Registros Akáshicos",
    },
    sameAs: ["https://www.instagram.com/etersomos"],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "20:00",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios Espirituales",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Lecturas Akáshicas",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Lectura Akáshica Individual",
                description:
                  "Lectura personalizada del Campo Akáshico con respuestas grabadas en audio a 2 preguntas de tu alma.",
              },
              price: "20000",
              priceCurrency: "ARS",
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Cursos",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Course",
                name: "1er Nivel Solo Teórico - Registros Akáshicos",
                description:
                  "Curso de introducción a los Registros Akáshicos. Contribución voluntaria.",
                provider: {
                  "@type": "Organization",
                  name: "Eter Somos",
                  sameAs: SITE_URL,
                },
              },
              price: "0",
              priceCurrency: "ARS",
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Course",
                name: "1er Nivel con Práctica - Registros Akáshicos",
                description:
                  "Curso completo de Registros Akáshicos Nivel 1 con práctica incluida.",
                provider: {
                  "@type": "Organization",
                  name: "Eter Somos",
                  sameAs: SITE_URL,
                },
              },
              price: "35000",
              priceCurrency: "ARS",
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Course",
                name: "2do Nivel Completo - Registros Akáshicos",
                description:
                  "Curso avanzado de Registros Akáshicos Nivel 2.",
                provider: {
                  "@type": "Organization",
                  name: "Eter Somos",
                  sameAs: SITE_URL,
                },
              },
              price: "45000",
              priceCurrency: "ARS",
            },
          ],
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function CoursesJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cursos de Registros Akáshicos - Eter Somos",
    description:
      "Formación completa en Registros Akáshicos: desde el Nivel 1 teórico hasta el Nivel 2 avanzado.",
    numberOfItems: 4,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Course",
          name: "1er Nivel Solo Teórico - Registros Akáshicos",
          description:
            "Curso de introducción a los Registros Akáshicos. Aprendé los fundamentos de la lectura akáshica. Contribución voluntaria.",
          provider: {
            "@type": "Organization",
            name: "Eter Somos",
            sameAs: SITE_URL,
          },
          url: `${SITE_URL}/cursos/n1-teorico`,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "ARS",
            availability: "https://schema.org/InStock",
          },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Course",
          name: "1er Nivel con Práctica - Registros Akáshicos",
          description:
            "Curso completo de Registros Akáshicos Nivel 1 con práctica incluida. El más elegido por los alumnos.",
          provider: {
            "@type": "Organization",
            name: "Eter Somos",
            sameAS: SITE_URL,
          },
          url: `${SITE_URL}/cursos/n1-practica`,
          offers: {
            "@type": "Offer",
            price: "35000",
            priceCurrency: "ARS",
            availability: "https://schema.org/InStock",
          },
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "Course",
          name: "2do Nivel Completo - Registros Akáshicos",
          description:
            "Curso avanzado de Registros Akáshicos. Profundizá tu práctica y conocimiento akáshico.",
          provider: {
            "@type": "Organization",
            name: "Eter Somos",
            sameAs: SITE_URL,
          },
          url: `${SITE_URL}/cursos/n2`,
          offers: {
            "@type": "Offer",
            price: "45000",
            priceCurrency: "ARS",
            availability: "https://schema.org/InStock",
          },
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "Course",
          name: "Ambos Cursos - Registros Akáshicos",
          description:
            "Pack completo: Nivel 1 + Nivel 2 de Registros Akáshicos con el mejor precio.",
          provider: {
            "@type": "Organization",
            name: "Eter Somos",
            sameAs: SITE_URL,
          },
          url: `${SITE_URL}/cursos/ambos`,
          offers: {
            "@type": "Offer",
            price: "70000",
            priceCurrency: "ARS",
            availability: "https://schema.org/InStock",
          },
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué son los Registros Akáshicos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Los Registros Akáshicos son un campo energético que contiene la memoria del alma, donde quedan registradas todas las experiencias vividas. A través de una lectura, podés acceder a respuestas profundas sobre tu propósito, relaciones y camino espiritual.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo funciona una lectura de Registros Akáshicos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "En una lectura akáshica, Fer Cardozo accede a tu Campo Akáshico y responde a 2 preguntas que elijas. La lectura se graba en audio y se entrega a través del Aula Virtual de Eter Somos, junto con archivos adjuntos si los hubiera.",
        },
      },
      {
        "@type": "Question",
        name: "¿Es confidencial la lectura?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, absolutamente. Toda la información que surge en una lectura es completamente confidencial y personal. Solo vos y Fer tienen acceso al contenido de la sesión.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué cursos ofrecen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ofrecemos cursos de formación en Registros Akáshicos en dos niveles: Nivel 1 (solo teórico o con práctica incluida) y Nivel 2 completo. También hay un pack de ambos cursos con precio especial. Todos los cursos incluyen acceso al Aula Virtual con material descargable.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué incluyen las membresías?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Las membresías de Eter Somos ofrecen contenido espiritual exclusivo enviado regularmente: Raíz de Luz (2 envíos mensuales), Corazón Solar (3 envíos mensuales) y Puente Estelar (4 envíos mensuales/semanal). Cada una incluye meditaciones, guías y recursos para tu camino espiritual.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hacen envíos de cristales?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, realizamos envíos de cristales a toda Argentina. Cada cristal es seleccionado con amor e intención para acompañar tu camino espiritual. Los pedidos se pagan a través de MercadoPago y se gestionan desde nuestro panel de administración.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  priceCurrency,
  url,
}: {
  name: string;
  description: string;
  image?: string;
  price: string;
  priceCurrency: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || `${SITE_URL}/images/logo-etersomos.jpg`,
    url,
    brand: {
      "@type": "Brand",
      name: "Eter Somos",
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Eter Somos",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LecturaJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Lectura Akáshica Individual",
    description:
      "Lectura personalizada del Campo Akáshico. Fer Cardozo accede a tus Registros Akáshicos y responde a 2 preguntas que elijas. La lectura se entrega grabada en audio a través del Aula Virtual.",
    provider: {
      "@type": "Person",
      name: "Fer Cardozo",
      jobTitle: "Lectora de Registros Akáshicos",
      worksFor: {
        "@type": "Organization",
        name: "Eter Somos",
        url: SITE_URL,
      },
    },
    url: `${SITE_URL}/lecturas`,
    areaServed: {
      "@type": "Country",
      name: "Argentina",
    },
    offers: {
      "@type": "Offer",
      price: "20000",
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function MentoriaJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Mentorías para Lectores de Registros Akáshicos",
    description:
      "Mentorías individuales por videollamada para graduados de Nivel 1 y 2 de Registros Akáshicos. Sesión individual o pack de 3+ sesiones con precio especial.",
    provider: {
      "@type": "Person",
      name: "Fer Cardozo",
      jobTitle: "Lectora de Registros Akáshicos y Mentora",
      worksFor: {
        "@type": "Organization",
        name: "Eter Somos",
        url: SITE_URL,
      },
    },
    url: `${SITE_URL}/mentorias`,
    areaServed: {
      "@type": "Country",
      name: "Argentina",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Sesión individual",
        price: "20000",
        priceCurrency: "ARS",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Pack 3+ sesiones",
        price: "15000",
        priceCurrency: "ARS",
        availability: "https://schema.org/InStock",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
