import type { V16Beacon } from "@/lib/beacons/types";

export function beaconsToFeatureCollection(
  beacons: V16Beacon[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: beacons.map((beacon) => ({
      type: "Feature",
      id: beacon.id,
      geometry: {
        type: "Point",
        coordinates: [beacon.lon, beacon.lat],
      },
      properties: {
        id: beacon.id,
        severity: beacon.severity,
      },
    })),
  };
}
