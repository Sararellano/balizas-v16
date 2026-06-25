export type MapTheme = "dark" | "light";

export const SPAIN_CENTER: [number, number] = [-3.7, 40.2];
export const SPAIN_ZOOM = 5.3;
export const REFRESH_INTERVAL_MS = 60_000;
export const THEME_STORAGE_KEY = "balizas-v16-theme";

export const MAP_STYLES: Record<MapTheme, string> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
};

export const SOURCE_ID = "beacons";
export const LAYER_CLUSTERS_ID = "beacons-clusters";
export const LAYER_CLUSTER_COUNT_ID = "beacons-cluster-count";
export const LAYER_GLOW_ID = "beacons-glow";
export const LAYER_UNCLUSTERED_ID = "beacons-points";

export const CLUSTER_MAX_ZOOM = 12;
export const CLUSTER_RADIUS = 50;
