/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter events by distance from user location
 */
export function filterEventsByDistance<T extends { latitude?: number | null; longitude?: number | null }>(
  events: T[],
  userLat: number,
  userLon: number,
  maxDistance: number
): T[] {
  return events.filter((event) => {
    if (event.latitude == null || event.longitude == null) return false;
    const distance = calculateDistance(userLat, userLon, event.latitude, event.longitude);
    return distance <= maxDistance;
  });
}
