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
export const readingPrice: PriceEntry = { ars: 35000, usd: 35 };

/** Course prices */
export const coursePrices: Record<string, PriceEntry> = {
  "Nivel Inicial": { ars: 25000, usd: 25 },
  "Nivel Intermedio": { ars: 35000, usd: 35 },
  "Nivel Avanzado": { ars: 45000, usd: 45 },
};

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
