"use client";

import type { BeaconFilters, V16Beacon } from "@/lib/beacons/types";
import { normalizeText } from "@/lib/beacons/format";

export function filterBeacons(
  beacons: V16Beacon[],
  filters: BeaconFilters,
): V16Beacon[] {
  return beacons.filter((beacon) => {
    const matchesCommunity =
      !filters.autonomousCommunity ||
      normalizeText(beacon.autonomousCommunity) ===
        normalizeText(filters.autonomousCommunity);

    const matchesProvince =
      !filters.province ||
      normalizeText(beacon.province) === normalizeText(filters.province);

    return matchesCommunity && matchesProvince;
  });
}

export function buildFilterOptions(beacons: V16Beacon[]) {
  const communities = [
    ...new Set(beacons.map((beacon) => beacon.autonomousCommunity).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "es"));

  const provincesByCommunity = new Map<string, string[]>();

  for (const beacon of beacons) {
    if (!beacon.autonomousCommunity || !beacon.province) continue;
    const current = provincesByCommunity.get(beacon.autonomousCommunity) ?? [];
    if (!current.includes(beacon.province)) {
      current.push(beacon.province);
      provincesByCommunity.set(beacon.autonomousCommunity, current);
    }
  }

  for (const [community, provinces] of provincesByCommunity) {
    provincesByCommunity.set(
      community,
      provinces.sort((a, b) => a.localeCompare(b, "es")),
    );
  }

  return { communities, provincesByCommunity };
}

export function beaconsToBounds(
  beacons: V16Beacon[],
): [[number, number], [number, number]] | null {
  if (beacons.length === 0) return null;

  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;

  for (const beacon of beacons) {
    minLon = Math.min(minLon, beacon.lon);
    minLat = Math.min(minLat, beacon.lat);
    maxLon = Math.max(maxLon, beacon.lon);
    maxLat = Math.max(maxLat, beacon.lat);
  }

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}
