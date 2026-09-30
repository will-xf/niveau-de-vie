export interface Threshold {
  key: string;
  label: string;
  value: number;
}

export const THRESHOLDS: Threshold[] = [
  { key: "pauvrete", label: "Seuil de pauvreté", value: 1288 },
  { key: "mediane", label: "Niveau de vie médian", value: 2147 },
  { key: "richesse", label: "Seuil de richesse", value: 4292 },
];

export const UC_WEIGHTS = {
  firstAdult: 1,
  additionalAdult: 0.5,
  childOver14: 0.5,
  childUnder14: 0.3,
};
