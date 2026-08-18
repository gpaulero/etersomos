/**
 * Centralized pricing for Eter Somos
 * All prices in ARS (Argentine Pesos) and USD (US Dollars)
 */

export interface PriceEntry {
  ars: number;
  usd: number;
}

export interface ProductPricing {
  id: number;
  name: string;
  category: string;
  price: PriceEntry;
}

/** Crystal prices */
export const crystalPrices: ProductPricing[] = [
  { id: 1, name: "Amatista", category: "Amatista", price: { ars: 15000, usd: 15 } },
  { id: 2, name: "Cuarzo Rosa", category: "Cuarzo Rosa", price: { ars: 12000, usd: 12 } },
  { id: 3, name: "Cuarzo Claro", category: "Cuarzo Claro", price: { ars: 10000, usd: 10 } },
  { id: 4, name: "Citrino", category: "Citrino", price: { ars: 13000, usd: 13 } },
  { id: 5, name: "Turmalina Negra", category: "Turmalina", price: { ars: 11000, usd: 11 } },
  { id: 6, name: "Selinita", category: "Selinita", price: { ars: 14000, usd: 14 } },
];

/** Reading price */
export const readingPrice: PriceEntry = { ars: 20000, usd: 20 };

/**
 * Course prices — based on Fernanda's actual Google Forms
 *
 * Course 1 – Solo Teórico:        VOLUNTARY CONTRIBUTION (no fixed price)
 * Course 2 – Práctica Incluida:    ARS $45.000 / USD $35
 * Course 3 – Nivel 2 Completo:     ARS $60.000 / USD $50  (with 10% discount: $54.000 / $45)
 * Course 4 – Ambos Cursos:         ARS $85.000 / USD $65
 */
export const coursePricing = {
  "n1-teorico": {
    name: "1er Nivel Solo Teórico – Aprendé a Conectar con tus Registros Akashicos",
    voluntary: true,
    ars: 0,
    usd: 0,
    description: "Contribución voluntaria consciente. Material audiovisual de 8 módulos + PDFs.",
  },
  "n1-practica": {
    name: "1er Nivel con Práctica Incluida – Aprendé a Conectar con el Campo Akashico",
    voluntary: false,
    ars: 45000,
    usd: 35,
    description: "Material teórico + 2 clases prácticas individuales por videollamada.",
  },
  "n2-completo": {
    name: "2do Nivel – Aprendé a Consultar los Registros Akashicos de Otras Personas",
    voluntary: false,
    ars: 60000,
    usd: 50,
    discountArs: 54000,
    discountUsd: 45,
    description: "Curso teórico/práctico completo para leer Registros de terceros.",
  },
  "ambos-cursos": {
    name: "Ambos Cursos – 1er Nivel + 2do Nivel",
    voluntary: false,
    ars: 85000,
    usd: 65,
    paypalUsd: 65,
    description: "Formación completa: autoconocimiento + consulta a terceros.",
  },
} as const;

export type CourseId = keyof typeof coursePricing;

/** Helper to get price for a crystal by ID */
export function getCrystalPrice(id: number): PriceEntry | undefined {
  return crystalPrices.find((c) => c.id === id)?.price;
}

/** Helper to format price in ARS */
export function formatARS(amount: number): string {
  return `$${amount.toLocaleString("es-AR")} ARS`;
}

/** Helper to format price in USD */
export function formatUSD(amount: number): string {
  return `US$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
