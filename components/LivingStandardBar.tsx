"use client";

import { THRESHOLDS } from "@/lib/constants";
import { formatEuros } from "@/lib/calculations";

interface LivingStandardBarProps {
  consumptionUnits: number;
  niveauDeVie: number;
  householdIncome: number;
}

const COLUMN_WIDTH = 150;
const COLUMN_HEIGHT = 440;
const PAD_TOP = 22;
const PAD_BOTTOM = 36;
const TRACK_X = 16;
const TOP = PAD_TOP;
const BOTTOM = COLUMN_HEIGHT - PAD_BOTTOM;
const TICK_LEN = 9;
const LABEL_X = TRACK_X + TICK_LEN + 8;
const MIN_LABEL_GAP = 34;
const LABEL_FONT_SIZE = 11;
const VALUE_FONT_SIZE = 15;

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
  title,
  subtitle,
  markers,
  maxValue,
}: {
  title: string;
  subtitle: string;
  markers: RawMarker[];
  maxValue: number;
}) {
  const positioned = layoutColumn(markers, maxValue);

  return (
    <div className="min-w-0 flex-1">
      <p className="text-center text-xs font-medium text-primary">{title}</p>
      <p className="mb-3 mt-1 text-center text-[10px] leading-tight text-secondary">
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

          return (
            <g key={m.key}>
              <line
                x1={TRACK_X}
                y1={m.trueY}
                x2={TRACK_X + TICK_LEN}
                y2={m.trueY}
                stroke={tone}
                strokeWidth={m.isUser ? 2 : 1.25}
              />
              {nudged && (
                <line
                  x1={TRACK_X + TICK_LEN}
                  y1={m.trueY}
                  x2={LABEL_X - 2}
                  y2={m.y}
                  stroke="var(--border)"
                  strokeWidth={0.75}
                />
              )}
              {m.isUser && (
                <circle cx={TRACK_X} cy={m.trueY} r={3.5} fill="var(--accent)" />
              )}
              <text x={LABEL_X} y={m.y}>
                <tspan
                  x={LABEL_X}
                  dy={-8}
                  fontSize={LABEL_FONT_SIZE}
                  fill="var(--text-secondary)"
                >
                  {m.label}
                </tspan>
                <tspan
                  x={LABEL_X}
                  dy={16}
                  fontSize={VALUE_FONT_SIZE}
                  fontWeight={m.isUser ? 700 : 600}
                  fill={m.isUser ? "var(--accent)" : "var(--text-primary)"}
                >
                  {formatEuros(m.value)}
                </tspan>
              </text>
            </g>
          );
        })}
        <text x={TRACK_X} y={BOTTOM + 20} fontSize={11} fill="var(--text-secondary)">
          0 €
        </text>
      </svg>
    </div>
  );
}

export function LivingStandardBar({
  consumptionUnits,
  niveauDeVie,
  householdIncome,
}: LivingStandardBarProps) {
  const richesse = THRESHOLDS.find((t) => t.key === "richesse")!.value;

  // Both columns share the same (household-level) scale, so the per-unit
  // figures land at their true fraction of the household ones instead of
  // each column re-stretching to fill its own height independently.
  const maxValue =
    Math.max(richesse * consumptionUnits, householdIncome, 1) * 1.08;

  const perUCMarkers: RawMarker[] = [
    ...THRESHOLDS.map((t) => ({
      key: t.key,
      label: LABELS[t.key],
      value: t.value,
      isUser: false,
    })),
    {
      key: "vous",
      label: LABELS.vous,
      value: niveauDeVie,
      isUser: true,
    },
  ];

  const householdMarkers: RawMarker[] = [
    ...THRESHOLDS.map((t) => ({
      key: t.key,
      label: LABELS[t.key],
      value: t.value * consumptionUnits,
      isUser: false,
    })),
    {
      key: "vous",
      label: LABELS.vous,
      value: householdIncome,
      isUser: true,
    },
  ];

  const multiplier = consumptionUnits.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div>
      <p className="sr-only">
        Votre niveau de vie est de {formatEuros(niveauDeVie)} par unité de
        consommation, soit {formatEuros(householdIncome)} pour votre foyer.
      </p>
      <div className="flex gap-3">
        <GaugeColumn
          title="Niveau de vie par unité de consommation"
          subtitle="En euro-équivalents, permet de comparer entre ménages de structure différente."
          markers={perUCMarkers}
          maxValue={maxValue}
        />
        <div className="w-px shrink-0 self-stretch bg-border" />
        <GaugeColumn
          title={`Niveau de vie pour le foyer (× ${multiplier})`}
          subtitle="En euros réels, permet de comparer les ménages de structure identique."
          markers={householdMarkers}
          maxValue={maxValue}
        />
      </div>
    </div>
  );
}
