import { UC_WEIGHTS } from "./constants";

export interface HouseholdComposition {
  adults: number;
  childrenOver14: number;
  childrenUnder14: number;
}

export function computeConsumptionUnits({
  adults,
  childrenOver14,
  childrenUnder14,
}: HouseholdComposition): number {
  const safeAdults = Math.max(0, adults);
  const adultUnits =
    safeAdults >= 1
      ? UC_WEIGHTS.firstAdult + (safeAdults - 1) * UC_WEIGHTS.additionalAdult
      : 0;
  const childUnits =
    Math.max(0, childrenOver14) * UC_WEIGHTS.childOver14 +
    Math.max(0, childrenUnder14) * UC_WEIGHTS.childUnder14;
  return adultUnits + childUnits;
}

export function computeNiveauDeVie(
  householdIncome: number,
  consumptionUnits: number,
): number {
  if (consumptionUnits <= 0) return 0;
  return householdIncome / consumptionUnits;
}

export function formatEuros(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUnits(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
