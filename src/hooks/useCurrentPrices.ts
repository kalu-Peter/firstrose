import { useState, useEffect } from "react";
import { villas } from "@/data/villas";
import type { PricingRule } from "@/lib/api";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost/firstrose/backend";

function effectivePrice(rules: PricingRule[], defaultPrice: number): number {
  const today = new Date().toISOString().split("T")[0];
  const active = rules
    .filter((r) => r.room_number === null && r.start_date <= today && r.end_date >= today)
    .sort((a, b) => b.priority - a.priority);
  return active[0] ? Number(active[0].price) : defaultPrice;
}

export function useCurrentPrices(): Record<string, number> {
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(villas.map((v) => [v.id, v.price]))
  );

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7);
    Promise.all(
      villas.map((v) =>
        fetch(`${BASE}/api/pricing.php?villa_id=${encodeURIComponent(v.id)}&month=${month}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((rules: PricingRule[]) => ({ id: v.id, price: effectivePrice(rules, v.price) }))
          .catch(() => ({ id: v.id, price: v.price }))
      )
    ).then((results) => {
      setPrices(Object.fromEntries(results.map((r) => [r.id, r.price])));
    });
  }, []);

  return prices;
}
