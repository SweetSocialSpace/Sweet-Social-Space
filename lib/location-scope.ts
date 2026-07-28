// Shared helpers for location-scoped filtering. Pure JS, safe on client+server.
// GLOBAL HOUSE - works for any zip on earth, no hard-coded geography - KISS

export type ScopeKind = "5mi" | "10mi" | "15mi" | "20mi";

export const SCOPE_RADIUS_MILES: Record<ScopeKind, number> = {
  "5mi": 5,
  "10mi": 10,
  "15mi": 15,
  "20mi": 20,
};

export const SCOPE_LABELS: Record<ScopeKind, string> = {
  "5mi": "5 mi",
  "10mi": "10 mi",
  "15mi": "15 mi",
  "20mi": "20 mi",
};

export type LocationFilter = {
  scope: ScopeKind;
  lat?: number | null;
  lng?: number | null;
};

// Haversine - miles - house-safe
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
    return Infinity
  }
}

// Bounding box - for Supabase query - global
export function bboxForRadius(lat: number, lng: number, miles: number) {
  try {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 }
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

// Filter rows by scope - GLOBAL - KISS - only radius
export function applyScope<T extends { latitude?: number | null; longitude?: number | null }>(
  rows: T[],
  filter: LocationFilter,
): T[] {
  try {
    if (!Array.isArray(rows)) return []
    const radius = SCOPE_RADIUS_MILES[filter.scope];
    if (filter.lat == null || filter.lng == null) return rows // no coords? show all - don't hide
    return rows.filter(
      (r) =>
        r.latitude != null &&
        r.longitude != null &&
        milesBetween(filter.lat!, filter.lng!, r.latitude, r.longitude) <= radius,
    );
  } catch {
    return rows
  }
}

// Validator - GLOBAL DEFAULT - KISS - defaults to 5mi - inviting
export function normalizeScopeInput(d: Partial<LocationFilter> | undefined): LocationFilter {
  try {
    const allowed: ScopeKind[] = ["5mi", "10mi", "15mi", "20mi"];
    const scope = (d?.scope && allowed.includes(d.scope) ? d.scope : "5mi") as ScopeKind;
    return {
      scope,
      lat: typeof d?.lat === "number" && !isNaN(d.lat) ? d.lat : null,
      lng: typeof d?.lng === "number" && !isNaN(d.lng) ? d.lng : null,
    };
  } catch {
    return { scope: "5mi", lat: null, lng: null }
  }
}
