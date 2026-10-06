"use client";

import { useState } from "react";
import {
  computeConsumptionUnits,
  computeNiveauDeVie,
  formatEuros,
  formatUnits,
} from "@/lib/calculations";
import { LivingStandardBar } from "./LivingStandardBar";
import { SegmentedControl } from "./SegmentedControl";

type IncomeMode = "household" | "perAdult";

const cardClass = "rounded-3xl border border-card-border bg-surface p-5";

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 12,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-secondary">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`Diminuer : ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-lg font-semibold text-primary transition active:scale-95 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-5 text-center text-lg font-semibold tabular-nums text-primary">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Augmenter : ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-lg font-semibold text-primary transition active:scale-95 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

function AmountField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="py-2.5">
      <label htmlFor={id} className="mb-1.5 block text-sm text-secondary">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            onChange(Number.isFinite(parsed) ? Math.max(0, parsed) : 0);
          }}
          className="w-full bg-transparent text-xl font-semibold tabular-nums text-primary outline-none"
        />
        <span className="text-base text-secondary">€</span>
      </div>
    </div>
  );
}

export function CalculatorForm() {
  const [adults, setAdults] = useState(1);
  const [childrenOver14, setChildrenOver14] = useState(0);
  const [childrenUnder14, setChildrenUnder14] = useState(0);
  const [incomeMode, setIncomeMode] = useState<IncomeMode>("household");
  const [householdIncome, setHouseholdIncome] = useState(0);
  const [perAdultIncomes, setPerAdultIncomes] = useState<number[]>([0]);

  const adultsCount = Math.max(0, Math.round(adults));
  const perAdultDisplay = Array.from(
    { length: adultsCount },
    (_, i) => perAdultIncomes[i] ?? 0,
  );

  const consumptionUnits = computeConsumptionUnits({
    adults,
    childrenOver14,
    childrenUnder14,
  });

  const totalHouseholdIncome =
    incomeMode === "household"
      ? householdIncome
      : perAdultDisplay.reduce((sum, income) => sum + income, 0);

  const niveauDeVie = computeNiveauDeVie(totalHouseholdIncome, consumptionUnits);

  return (
    <div className="flex flex-col gap-4">
      <div className={cardClass}>
        <h2 className="mb-1 text-base font-semibold text-primary">
          Composition du ménage
        </h2>
        <div className="divide-y divide-border">
          <Stepper label="Adultes" value={adults} min={0} onChange={setAdults} />
          <Stepper
            label="Enfants de 14 ans ou plus"
            value={childrenOver14}
            onChange={setChildrenOver14}
          />
          <Stepper
            label="Enfants de moins de 14 ans"
            value={childrenUnder14}
            onChange={setChildrenUnder14}
          />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-base font-semibold text-primary">Revenus nets mensuels</h2>
        <p className="mb-3 mt-1 text-sm text-secondary">
          Saisissez le revenu total du ménage, ou par adulte.
        </p>
        <SegmentedControl
          value={incomeMode}
          onChange={setIncomeMode}
          options={[
            { value: "household", label: "Revenu du foyer" },
            { value: "perAdult", label: "Par adulte" },
          ]}
        />

        <div className="mt-1 divide-y divide-border">
          {incomeMode === "household" ? (
            <AmountField
              id="household-income"
              label="Revenu net du foyer, par mois"
              value={householdIncome}
              onChange={setHouseholdIncome}
            />
          ) : perAdultDisplay.length > 0 ? (
            perAdultDisplay.map((income, index) => (
              <AmountField
                key={index}
                id={`adult-income-${index}`}
                label={`Adulte ${index + 1}, net par mois`}
                value={income}
                onChange={(value) =>
                  setPerAdultIncomes((prev) => {
                    const next = [...prev];
                    while (next.length <= index) next.push(0);
                    next[index] = value;
                    return next;
                  })
                }
              />
            ))
          ) : (
            <p className="py-3 text-sm text-secondary">
              Ajoutez au moins un adulte pour saisir un revenu.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cardClass}>
          <p className="text-xs text-secondary">Unités de consommation</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-primary">
            {formatUnits(consumptionUnits)}
          </p>
        </div>
        <div className="rounded-3xl border border-accent/30 bg-accent-soft p-5">
          <p className="text-xs text-secondary">Niveau de vie / mois</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-accent">
            {formatEuros(niveauDeVie)}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <LivingStandardBar
          consumptionUnits={consumptionUnits}
          niveauDeVie={niveauDeVie}
          householdIncome={totalHouseholdIncome}
        />
      </div>
    </div>
  );
}
