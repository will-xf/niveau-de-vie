"use client";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-surface-2 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
            value === opt.value ? "bg-accent text-white" : "text-secondary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
