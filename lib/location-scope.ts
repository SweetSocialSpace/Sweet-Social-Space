// Shared helpers for location-scoped filtering. Pure JS, safe on client+server.

export type ScopeKind = "5mi" | "20mi" | "50mi" | "state" | "nationwide";

export const SCOPE_RADIUS_MILES: Partial<Record<ScopeKind, number>> = {
  "5mi": 5,
  "20mi": 20,
  "50mi": 50,
};

export const SCOPE_LABELS: Record<ScopeKind, string> = {
  "5mi": "5 mi",
  "20mi": "20 mi",
  "50mi": "50 mi",
  state: "Statewide",
  nationwide: "Nationwide",
};

export type LocationFilter = {
  scope: ScopeKind;
  lat?: number | null;
  lng?: number | null;
  state_code?: string | null;
  country_code?: string | null;
};

// Haversine distance in miles
export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Bounding box for a radius around a point. Use to prefilter DB queries.
export function bboxForRadius(lat: number, lng: number, miles: number) {
  const latDelta = miles / 69;
  const lngDelta = miles / (69 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

// Filter rows by the chosen scope. Rows without coords are hidden for mile-radius
// scopes; statewide matches state_code; nationwide returns all.
export function applyScope<T extends { latitude?: number | null; longitude?: number | null; state_code?: string | null; state?: string | null }>(
  rows: T[],
  filter: LocationFilter,
): T[] {
  const radius = SCOPE_RADIUS_MILES[filter.scope];
  if (radius != null) {
    if (filter.lat == null || filter.lng == null) return [];
    return rows.filter(
      (r) =>
        r.latitude != null &&
        r.longitude != null &&
        milesBetween(filter.lat!, filter.lng!, r.latitude, r.longitude) <= radius,
    );
  }
  if (filter.scope === "state") {
    if (!filter.state_code) return [];
    const sc = filter.state_code.toUpperCase();
    return rows.filter(
      (r) => (r.state_code ?? r.state ?? "").toUpperCase() === sc,
    );
  }
  return rows; // nationwide
}

// Zod-friendly validator input shape
export function normalizeScopeInput(d: Partial<LocationFilter> | undefined): LocationFilter {
  const allowed: ScopeKind[] = ["5mi", "20mi", "50mi", "state", "nationwide"];
  const scope = (d?.scope && allowed.includes(d.scope) ? d.scope : "state") as ScopeKind;
  return {
    scope,
    lat: typeof d?.lat === "number" ? d.lat : null,
    lng: typeof d?.lng === "number" ? d.lng : null,
    state_code: typeof d?.state_code === "string" ? d.state_code : null,
    country_code: typeof d?.country_code === "string" ? d.country_code : null,
  };
}
