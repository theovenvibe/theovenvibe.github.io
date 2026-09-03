/**
 * Ask the Worker which distances this number already orders from.
 *
 * Checkout asks every customer their distance on every order, though the
 * kitchen has known the answer since their first one. They guess about their
 * own address, they get it wrong, and the owner finds out at the door with the
 * wrong money in his hand.
 *
 * Silent on every failure, as everything the site asks of the Worker must be
 * (AGENTS.md rule 5): an empty list is indistinguishable from a refused,
 * rate-limited or unreachable call, and all four leave checkout behaving
 * exactly as it did before this existed. Nothing here may ever be awaited on
 * the path to placing an order.
 */

export interface DistanceHint {
  band: string;
  km: number | null;
}

interface HintResponse {
  bands?: { band?: unknown; km?: unknown }[];
}

export async function fetchDistanceHint(worker: string, phone: string): Promise<DistanceHint[]> {
  if (!worker) return [];
  const digits = phone.replace(/\D/g, '').slice(-10);
  // Asking before the number is complete would spend the customer's one useful
  // lookup on a prefix, and the rate limit on the ten that led up to it.
  if (!/^[6-9]\d{9}$/.test(digits)) return [];

  try {
    // POST, not a query string: a phone number in a URL ends up in logs,
    // referrers and browser history.
    const res = await fetch(`${worker}/distance-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: digits }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as HintResponse;
    if (!Array.isArray(data.bands)) return [];
    return data.bands
      .filter((row): row is { band: string; km: unknown } => typeof row?.band === 'string' && !!row.band)
      .map((row) => ({
        band: row.band,
        km: typeof row.km === 'number' && Number.isFinite(row.km) && row.km > 0 ? row.km : null,
      }));
  } catch {
    return [];
  }
}
