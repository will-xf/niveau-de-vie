"use client";

import { useEffect, useState } from "react";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/counter")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="text-xs text-secondary">
      Calculs réalisés :{" "}
      <span className="font-semibold tabular-nums text-primary">
        {new Intl.NumberFormat("fr-FR").format(count)}
      </span>
    </p>
  );
}
