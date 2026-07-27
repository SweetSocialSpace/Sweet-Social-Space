// Shared helpers for location-scoped filtering. Pure JS, safe on client+server.
// GLOBAL HOUSE - works for any zip on earth, no hard-coded geography

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

// Haversine distance in miles - house-safe
export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  try {
    if ([lat1, lng1, lat2, lng2].some(v => typeof v !== 'number' || isNaN(v))) return Infinity
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 3958.7613;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  } catch {
    return Infinity // House never dies - bad coords = far away, not crash
  }
}

// Bounding box for radius - house-safe, global
export function bboxForRadius(lat: number, lng: number, miles: number) {
  try {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 } // Global fallback
    }
    const latDelta = miles / 69;
    const lngDelta = miles / (69 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  } catch {
    return { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 }
  }
}

// Filter rows by scope - GLOBAL, house-safe
export function applyScope<T extends { latitude?: number | null; longitude?: number | null; state_code?: string | null; state?: string | null; country_code?: string | null }>(
  rows: T[],
  filter: LocationFilter,
): T[] {
  try {
    if (!Array.isArray(rows)) return []
    const radius = SCOPE_RADIUS_MILES[filter.scope];
    if (radius != null) {
      if (filter.lat == null || filter.lng == null) return rows // Global fallback - if no coords, show all, don't hide
      return rows.filter(
        (r) =>
          r.latitude != null &&
          r.longitude != null &&
          milesBetween(filter.lat!, filter.lng!, r.latitude, r.longitude) <= radius,
      );
    }
    if (filter.scope === "state") {
      if (!filter.state_code) return rows // Global fallback - no state? show nationwide
      const sc = filter.state_code.toUpperCase();
      return rows.filter(
        (r) => (r.state_code ?? r.state ?? "").toUpperCase() === sc,
      );
    }
    return rows; // nationwide - global
  } catch {
    return rows // House never dies - return all if filter crashes
  }
}

// Zod-friendly validator - GLOBAL DEFAULT
export function normalizeScopeInput(d: Partial<LocationFilter> | undefined): LocationFilter {
  try {
    const allowed: ScopeKind[] = ["5mi", "20mi", "50mi", "state", "nationwide"];
    // Global default: nationwide, not state - so Canada/UK/Mexico don't get empty feed
    const scope = (d?.scope && allowed.includes(d.scope) ? d.scope : "nationwide") as ScopeKind;
    return {
      scope,
      lat: typeof d?.lat === "number" && !isNaN(d.lat) ? d.lat : null,
      lng: typeof d?.lng === "number" && !isNaN(d.lng) ? d.lng : null,
      state_code: typeof d?.state_code === "string" ? d.state_code : null,
      country_code: typeof d?.country_code === "string" ? d.country_code : null,
    };
  } catch {
    // Global safe fallback
    return { scope: "nationwide", lat: null, lng: null, state_code: null, country_code: null }
  }
}
