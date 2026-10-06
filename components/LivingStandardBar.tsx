"use client";

import { useState } from "react";
import { THRESHOLDS } from "@/lib/constants";
import { formatEuros } from "@/lib/calculations";
import { SegmentedControl } from "./SegmentedControl";

interface LivingStandardBarProps {
  consumptionUnits: number;
  niveauDeVie: number;
  householdIncome: number;
}

const COLUMN_WIDTH = 320;
const COLUMN_HEIGHT = 440;
const PAD_TOP = 22;
const PAD_BOTTOM = 36;
const TRACK_X = COLUMN_WIDTH / 2;
const TOP = PAD_TOP;
const BOTTOM = COLUMN_HEIGHT - PAD_BOTTOM;
const TICK_LEN = 9;
const LABEL_X = TRACK_X + TICK_LEN + 8;
const USER_LABEL_X = TRACK_X - TICK_LEN - 8;
const MIN_LABEL_GAP = 34;

interface RawMarker {
  key: string;
  label: string;
  value: number;
  isUser: boolean;
}

interface PositionedMarker extends RawMarker {
  trueY: number;
  y: number;
}

const LABELS: Record<string, string> = {
  pauvrete: "Seuil de pauvreté",
  mediane: "Médiane France",
  richesse: "Seuil de richesse",
  vous: "Vous",
};

/**
 * Anchors each tick to its true value position, then nudges overlapping
 * labels apart — thresholds can land within a few pixels of one another,
 * especially once a household's own value sits close to a benchmark.
 */
function layoutColumn(markers: RawMarker[], maxValue: number): PositionedMarker[] {
  const valueToY = (value: number) => {
    const clamped = Math.min(Math.max(value, 0), maxValue);
    return BOTTOM - (clamped / maxValue) * (BOTTOM - TOP);
  };

  const items: PositionedMarker[] = markers
    .map((m) => ({ ...m, trueY: valueToY(m.value), y: valueToY(m.value) }))
    .sort((a, b) => a.trueY - b.trueY);

  for (let i = 1; i < items.length; i++) {
    if (items[i].y - items[i - 1].y < MIN_LABEL_GAP) {
      items[i].y = items[i - 1].y + MIN_LABEL_GAP;
    }
  }

  const last = items[items.length - 1];
  if (last && last.y > BOTTOM) {
    last.y = BOTTOM;
    for (let i = items.length - 2; i >= 0; i--) {
      const next = items[i + 1];
      const cur = items[i];
      if (next.y - cur.y < MIN_LABEL_GAP) {
        cur.y = next.y - MIN_LABEL_GAP;
      }
    }
  }

  return items;
}

function GaugeColumn({
  subtitle,
  markers,
  maxValue,
}: {
  subtitle: string;
  markers: RawMarker[];
  maxValue: number;
}) {
  // The user's marker sits left of the track, the benchmarks on the right,
  // so each side is laid out independently.
  const positioned = [
    ...layoutColumn(markers.filter((m) => !m.isUser), maxValue),
    ...layoutColumn(markers.filter((m) => m.isUser), maxValue),
  ];

  return (
    <div className="min-w-0">
      <p className="mb-3 text-center text-xs leading-snug text-secondary">
        {subtitle}
      </p>
      <svg
        viewBox={`0 0 ${COLUMN_WIDTH} ${COLUMN_HEIGHT}`}
        width="100%"
        height="auto"
        style={{ display: "block" }}
        aria-hidden="true"
      >
        <line
          x1={TRACK_X}
          y1={TOP}
          x2={TRACK_X}
          y2={BOTTOM}
          stroke="var(--border)"
          strokeWidth={1.5}
        />
        {positioned.map((m) => {
          const nudged = Math.abs(m.y - m.trueY) > 1;
          const tone = m.isUser ? "var(--accent)" : "var(--text-secondary)";
          const dir = m.isUser ? -1 : 1;
          const labelX = m.isUser ? USER_LABEL_X : LABEL_X;
          const anchor = m.isUser ? "end" : "start";

          return (
            <g key={m.key}>
              <line
                x1={TRACK_X}
                y1={m.trueY}
                x2={TRACK_X + dir * TICK_LEN}
                y2={m.trueY}
                stroke={tone}
                strokeWidth={m.isUser ? 2 : 1.25}
              />
              {nudged && (
                <line
                  x1={TRACK_X + dir * TICK_LEN}
                  y1={m.trueY}
                  x2={labelX - dir * 2}
                  y2={m.y}
                  stroke="var(--border)"
                  strokeWidth={0.75}
                />
              )}
              {m.isUser && (
                <circle cx={TRACK_X} cy={m.trueY} r={3.5} fill="var(--accent)" />
              )}
              <text x={labelX} y={m.y} textAnchor={anchor}>
                <tspan
                  x={labelX}
                  dy={-8}
                  fontSize={13}
                  fill="var(--text-secondary)"
                >
                  {m.label}
                </tspan>
                <tspan
                  x={labelX}
                  dy={20}
                  fontSize={18}
                  fontWeight={m.isUser ? 700 : 600}
                  fill={m.isUser ? "var(--accent)" : "var(--text-primary)"}
                >
                  {formatEuros(m.value)}
                </tspan>
              </text>
            </g>
          );
        })}
        <text x={TRACK_X} y={BOTTOM + 20} textAnchor="middle" fontSize={11} fill="var(--text-secondary)">
          0 €
        </text>
      </svg>
    </div>
  );
}

type View = "perUnit" | "household";

export function LivingStandardBar({
  consumptionUnits,
  niveauDeVie,
  householdIncome,
}: LivingStandardBarProps) {
  const [view, setView] = useState<View>("perUnit");

  const perUCMarkers: RawMarker[] = [
    ...THRESHOLDS.map((t) => ({
      key: t.key,
      label: LABELS[t.key],
      value: t.value,
      isUser: false,
    })),
    { key: "vous", label: LABELS.vous, value: niveauDeVie, isUser: true },
  ];

  const householdMarkers: RawMarker[] = [
    ...THRESHOLDS.map((t) => ({
      key: t.key,
      label: LABELS[t.key],
      value: t.value * consumptionUnits,
      isUser: false,
    })),
    { key: "vous", label: LABELS.vous, value: householdIncome, isUser: true },
  ];

  const richesse = THRESHOLDS.find((t) => t.key === "richesse")!.value;
  const markers = view === "perUnit" ? perUCMarkers : householdMarkers;
  const maxValue =
    Math.max(
      view === "perUnit" ? richesse : richesse * consumptionUnits,
      view === "perUnit" ? niveauDeVie : householdIncome,
      1,
    ) * 1.08;

  return (
    <div>
      <p className="sr-only">
        Votre niveau de vie est de {formatEuros(niveauDeVie)} par unité de
        consommation, soit {formatEuros(householdIncome)} pour votre foyer.
      </p>
      <h2 className="mb-3 text-base font-semibold text-primary">Niveau de vie</h2>
      <SegmentedControl
        value={view}
        onChange={setView}
        options={[
          { value: "perUnit", label: "Par unité" },
          { value: "household", label: "Pour le ménage" },
        ]}
      />
      <div className="mt-4">
        <GaugeColumn
          subtitle={
            view === "perUnit"
              ? "En euro-équivalents, permet de comparer entre ménages de structure différente."
              : "En euros réels, permet de comparer les ménages de structure identique."
          }
          markers={markers}
          maxValue={maxValue}
        />
      </div>
    </div>
  );
}
