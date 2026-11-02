export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceKm(km: number, locale: string) {
  if (km < 1) {
    const meters = Math.max(100, Math.round(km * 10) * 100);
    return locale === "sq" ? `< ${meters} m` : `< ${meters} m`;
  }
  const value = km < 10 ? km.toFixed(1) : Math.round(km).toString();
  return `${value} km`;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
