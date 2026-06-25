import type { GeoJSONSource, Map as MaplibreMap } from "maplibre-gl";
import type { V16Beacon } from "@/lib/beacons/types";
import { beaconsToFeatureCollection } from "@/lib/map/beacon-geojson";
import {
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
  LAYER_CLUSTER_COUNT_ID,
  LAYER_CLUSTERS_ID,
  LAYER_GLOW_ID,
  LAYER_UNCLUSTERED_ID,
  SOURCE_ID,
  type MapTheme,
} from "@/lib/map/constants";

function strokeColor(theme: MapTheme): string {
  return theme === "dark" ? "#ffffff" : "#1e293b";
}

export function syncBeaconLayers(
  map: MaplibreMap,
  beacons: V16Beacon[],
  theme: MapTheme,
): void {
  const data = beaconsToFeatureCollection(beacons);
  const stroke = strokeColor(theme);

  const existingSource = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
  if (existingSource) {
    existingSource.setData(data);
    if (map.getLayer(LAYER_UNCLUSTERED_ID)) {
      map.setPaintProperty(LAYER_UNCLUSTERED_ID, "circle-stroke-color", stroke);
    }
    if (map.getLayer(LAYER_CLUSTERS_ID)) {
      map.setPaintProperty(LAYER_CLUSTERS_ID, "circle-stroke-color", stroke);
      map.setPaintProperty(
        LAYER_CLUSTERS_ID,
        "circle-color",
        theme === "dark" ? "#b45309" : "#f59e0b",
      );
    }
    if (map.getLayer(LAYER_CLUSTER_COUNT_ID)) {
      map.setPaintProperty(
        LAYER_CLUSTER_COUNT_ID,
        "text-color",
        theme === "dark" ? "#ffffff" : "#1e293b",
      );
    }
    return;
  }

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data,
    cluster: true,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
    clusterRadius: CLUSTER_RADIUS,
    promoteId: "id",
  });

  map.addLayer({
    id: LAYER_CLUSTERS_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": theme === "dark" ? "#b45309" : "#d4622a",
      "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 30],
      "circle-opacity": 0.88,
      "circle-stroke-width": 2,
      "circle-stroke-color": stroke,
    },
  });

  map.addLayer({
    id: LAYER_CLUSTER_COUNT_ID,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 13,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": theme === "dark" ? "#ffffff" : "#1e293b",
    },
  });

  map.addLayer({
    id: LAYER_GLOW_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": [
        "match",
        ["get", "severity"],
        "critical",
        "#ef4444",
        "high",
        "#f97316",
        "medium",
        "#f59e0b",
        "#fbbf24",
      ],
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        8,
        10,
        14,
        14,
        18,
      ],
      "circle-opacity": 0.18,
      "circle-blur": 0.8,
    },
  });

  map.addLayer({
    id: LAYER_UNCLUSTERED_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": [
        "match",
        ["get", "severity"],
        "critical",
        "#ef4444",
        "high",
        "#f97316",
        "medium",
        "#f59e0b",
        "#fbbf24",
      ],
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        4,
        10,
        7,
        14,
        10,
      ],
      "circle-stroke-width": [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        3,
        ["boolean", ["feature-state", "hover"], false],
        2.5,
        1,
      ],
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        theme === "dark" ? "#f0a060" : "#d4622a",
        stroke,
      ],
      "circle-opacity": 0.95,
    },
  });
}
