"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import maplibregl, {
  type GeoJSONSource,
  type Map as MaplibreMap,
  type Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BeaconFilters, V16Beacon } from "@/lib/beacons/types";
import {
  beaconsToBounds,
  buildFilterOptions,
  filterBeacons,
} from "@/lib/beacons/filters";
import { BeaconFiltersPanel } from "@/components/BeaconFiltersPanel";
import { BeaconTooltipCard, ClusterTooltipCard } from "@/components/BeaconTooltipCard";
import { formatSeverity } from "@/lib/beacons/format";
import { syncBeaconLayers } from "@/lib/map/beacon-layers";
import {
  LAYER_CLUSTERS_ID,
  LAYER_UNCLUSTERED_ID,
  MAP_STYLES,
  SPAIN_CENTER,
  SPAIN_ZOOM,
  SOURCE_ID,
  type MapTheme,
} from "@/lib/map/constants";
import { useMapTheme } from "@/hooks/useMapTheme";
import { createRoot, type Root } from "react-dom/client";

interface BeaconMapProps {
  beacons: V16Beacon[];
  updatedAt: string;
  publicationTime?: string;
  isRefreshing: boolean;
  secondsToRefresh: number;
  onManualRefresh: () => void;
}

function MapLoadingShell() {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-5 bg-[var(--bg)]">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--border-strong)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent)]" />
      </div>
      <p className="text-sm font-medium text-[var(--muted)]">Cargando mapa de España…</p>
    </div>
  );
}

export function BeaconMap({
  beacons,
  updatedAt,
  publicationTime,
  isRefreshing,
  secondsToRefresh,
  onManualRefresh,
}: BeaconMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const clusterPopupRef = useRef<Popup | null>(null);
  const clusterPopupContainerRef = useRef<HTMLDivElement | null>(null);
  const clusterPopupRootRef = useRef<Root | null>(null);
  const selectedPopupRef = useRef<Popup | null>(null);
  const selectedPopupContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedPopupRootRef = useRef<Root | null>(null);
  const selectedFeatureIdRef = useRef<string | number | undefined>(undefined);
  const selectedBeaconIdRef = useRef<string | null>(null);
  const closeSelectedBeaconRef = useRef<() => void>(() => {});
  const beaconIndexRef = useRef<Map<string, V16Beacon>>(new Map());
  const filteredBeaconsRef = useRef<V16Beacon[]>([]);
  const interactionsBoundRef = useRef(false);
  const prevThemeRef = useRef<MapTheme | null>(null);

  const { theme, toggleTheme, isReady: isThemeReady } = useMapTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const [filters, setFilters] = useState<BeaconFilters>({
    autonomousCommunity: "",
    province: "",
  });
  const [hoveredBeacon, setHoveredBeacon] = useState<V16Beacon | null>(null);
  const [selectedBeacon, setSelectedBeacon] = useState<V16Beacon | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const filterOptions = useMemo(() => buildFilterOptions(beacons), [beacons]);
  const filteredBeacons = useMemo(
    () => filterBeacons(beacons, filters),
    [beacons, filters],
  );

  filteredBeaconsRef.current = filteredBeacons;

  const provinces = filters.autonomousCommunity
    ? filterOptions.provincesByCommunity.get(filters.autonomousCommunity) ?? []
    : [];

  const hasActiveFilters = Boolean(filters.autonomousCommunity || filters.province);

  useEffect(() => {
    beaconIndexRef.current = new Map(beacons.map((beacon) => [beacon.id, beacon]));
  }, [beacons]);

  useEffect(() => {
    if (!selectedBeaconIdRef.current) return;

    const updated = beacons.find((beacon) => beacon.id === selectedBeaconIdRef.current);
    if (!updated) {
      closeSelectedBeaconRef.current();
      return;
    }

    setSelectedBeacon(updated);
    selectedPopupRootRef.current?.render(
      <BeaconTooltipCard
        beacon={updated}
        onClose={() => closeSelectedBeaconRef.current()}
      />,
    );
  }, [beacons]);

  const renderClusterPopup = (content: ReactNode) => {
    if (!clusterPopupContainerRef.current) {
      clusterPopupContainerRef.current = document.createElement("div");
      clusterPopupRootRef.current = createRoot(clusterPopupContainerRef.current);
    }
    clusterPopupRootRef.current?.render(content);
  };

  const bindMapInteractions = (map: MaplibreMap) => {
    if (interactionsBoundRef.current) return;
    interactionsBoundRef.current = true;

    let hoveredFeatureId: string | number | undefined;

    const closeSelectedBeacon = () => {
      if (hoveredFeatureId !== undefined) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredFeatureId }, { hover: false });
        hoveredFeatureId = undefined;
      }
      if (selectedFeatureIdRef.current !== undefined) {
        map.setFeatureState(
          { source: SOURCE_ID, id: selectedFeatureIdRef.current },
          { selected: false },
        );
      }
      selectedFeatureIdRef.current = undefined;
      selectedBeaconIdRef.current = null;
      selectedPopupRef.current?.remove();
      setSelectedBeacon(null);
    };

    closeSelectedBeaconRef.current = closeSelectedBeacon;

    const showSelectedBeacon = (
      beacon: V16Beacon,
      lngLat: maplibregl.LngLatLike,
      featureId: string | number,
    ) => {
      if (
        selectedFeatureIdRef.current !== undefined &&
        selectedFeatureIdRef.current !== featureId
      ) {
        map.setFeatureState(
          { source: SOURCE_ID, id: selectedFeatureIdRef.current },
          { selected: false },
        );
      }

      selectedFeatureIdRef.current = featureId;
      selectedBeaconIdRef.current = beacon.id;
      map.setFeatureState({ source: SOURCE_ID, id: featureId }, { selected: true });

      if (!selectedPopupContainerRef.current) {
        selectedPopupContainerRef.current = document.createElement("div");
        selectedPopupRootRef.current = createRoot(selectedPopupContainerRef.current);
      }

      selectedPopupRootRef.current?.render(
        <BeaconTooltipCard beacon={beacon} onClose={closeSelectedBeacon} />,
      );

      if (!selectedPopupRef.current) {
        selectedPopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 24,
          maxWidth: "none",
          className: "beacon-selected-popup",
        }).setDOMContent(selectedPopupContainerRef.current);
      }

      selectedPopupRef.current.setLngLat(lngLat).addTo(map);
      setSelectedBeacon(beacon);
    };

    map.on("mousemove", LAYER_UNCLUSTERED_ID, (event) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = event.features?.[0];
      if (!feature?.id) return;

      if (hoveredFeatureId !== undefined && hoveredFeatureId !== feature.id) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredFeatureId },
          { hover: false },
        );
      }

      hoveredFeatureId = feature.id;
      map.setFeatureState({ source: SOURCE_ID, id: hoveredFeatureId }, { hover: true });

      const beacon = beaconIndexRef.current.get(String(feature.id));
      if (beacon) setHoveredBeacon(beacon);
    });

    map.on("mouseleave", LAYER_UNCLUSTERED_ID, () => {
      map.getCanvas().style.cursor = "";
      if (hoveredFeatureId !== undefined) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredFeatureId },
          { hover: false },
        );
      }
      hoveredFeatureId = undefined;
      setHoveredBeacon(null);
    });

    map.on("click", LAYER_UNCLUSTERED_ID, (event) => {
      const feature = event.features?.[0];
      if (!feature?.id) return;

      const beacon = beaconIndexRef.current.get(String(feature.id));
      if (!beacon) return;

      showSelectedBeacon(beacon, event.lngLat, feature.id);
    });

    map.on("click", (event) => {
      const onBeacon = map.queryRenderedFeatures(event.point, {
        layers: [LAYER_UNCLUSTERED_ID],
      });
      const onCluster = map.queryRenderedFeatures(event.point, {
        layers: [LAYER_CLUSTERS_ID],
      });
      if (onBeacon.length === 0 && onCluster.length === 0) {
        closeSelectedBeacon();
      }
    });

    map.on("mouseenter", LAYER_CLUSTERS_ID, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mousemove", LAYER_CLUSTERS_ID, (event) => {
      const feature = event.features?.[0];
      const count = feature?.properties?.point_count;
      if (!count) return;

      renderClusterPopup(<ClusterTooltipCard count={count} />);

      if (!clusterPopupRef.current) {
        clusterPopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          maxWidth: "none",
        }).setDOMContent(clusterPopupContainerRef.current!);
      }

      clusterPopupRef.current.setLngLat(event.lngLat).addTo(map);
    });

    map.on("mouseleave", LAYER_CLUSTERS_ID, () => {
      map.getCanvas().style.cursor = "";
      clusterPopupRef.current?.remove();
    });

    map.on("click", LAYER_CLUSTERS_ID, async (event) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      const coordinates = (feature?.geometry as GeoJSON.Point | undefined)?.coordinates;
      if (clusterId === undefined || !coordinates) return;

      const source = map.getSource(SOURCE_ID) as GeoJSONSource;
      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: coordinates as [number, number],
          zoom,
          duration: 500,
          essential: true,
        });
      } catch {
        // Ignore cluster expansion errors.
      }
    });
  };

  useEffect(() => {
    if (!isThemeReady || !mapContainerRef.current || mapRef.current) return;

    const container = mapContainerRef.current;

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLES[theme],
      center: SPAIN_CENTER,
      zoom: SPAIN_ZOOM,
      minZoom: 4,
      maxZoom: 18,
      attributionControl: { compact: true },
      fadeDuration: 300,
      renderWorldCopies: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "bottom-right");

    const handleStyleReady = () => {
      syncBeaconLayers(map, filteredBeaconsRef.current, themeRef.current);
      bindMapInteractions(map);
      map.resize();
      setMapReady(true);
      setMapError(null);
    };

    map.on("load", handleStyleReady);
    map.on("error", (event) => {
      const message = event.error?.message ?? "Error al cargar el mapa";
      setMapError(message);
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(container);

    const handleWindowResize = () => map.resize();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      resizeObserver.disconnect();
      clusterPopupRef.current?.remove();
      selectedPopupRef.current?.remove();
      clusterPopupRootRef.current?.unmount();
      selectedPopupRootRef.current?.unmount();
      clusterPopupContainerRef.current = null;
      selectedPopupContainerRef.current = null;
      clusterPopupRootRef.current = null;
      selectedPopupRootRef.current = null;
      selectedFeatureIdRef.current = undefined;
      selectedBeaconIdRef.current = null;
      interactionsBoundRef.current = false;
      setMapReady(false);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThemeReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isThemeReady) return;

    if (prevThemeRef.current === null) {
      prevThemeRef.current = theme;
      return;
    }

    if (prevThemeRef.current === theme) return;

    prevThemeRef.current = theme;
    map.setStyle(MAP_STYLES[theme]);
    map.once("style.load", () => {
      syncBeaconLayers(map, filteredBeaconsRef.current, theme);
      map.resize();
    });
  }, [theme, isThemeReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateLayers = () => {
      syncBeaconLayers(map, filteredBeacons, theme);
    };

    if (map.isStyleLoaded()) {
      updateLayers();
      return;
    }

    map.once("style.load", updateLayers);
  }, [filteredBeacons, theme]);

  const zoomToSpain = () => {
    mapRef.current?.flyTo({
      center: SPAIN_CENTER,
      zoom: SPAIN_ZOOM,
      essential: true,
      duration: 900,
    });
  };

  const handleZoomToFilters = () => {
    setIsFiltersCollapsed(true);
    const bounds = beaconsToBounds(filteredBeacons);
    if (!bounds || !mapRef.current) return;

    mapRef.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 72, left: 72, right: 72 },
      maxZoom: 12,
      duration: 900,
      essential: true,
    });
  };

  const handleCommunityChange = (value: string) => {
    setFilters({ autonomousCommunity: value, province: "" });
  };

  const handleProvinceChange = (value: string) => {
    setFilters((current) => ({ ...current, province: value }));
  };

  const handleClearFilters = () => {
    setFilters({ autonomousCommunity: "", province: "" });
    zoomToSpain();
  };

  const formattedUpdatedAt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(updatedAt));

  if (!isThemeReady) {
    return <MapLoadingShell />;
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[var(--bg-warm)]">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 h-full w-full"
        aria-label="Mapa de balizas V16"
        role="application"
      />

      {!mapReady && !mapError ? (
        <div className="absolute inset-0 z-[5] skeleton-shimmer" aria-hidden />
      ) : null}

      {mapError ? (
        <div className="absolute inset-0 z-[5] flex items-center justify-center bg-[var(--bg)]/90 p-6">
          <div className="max-w-sm rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-panel)]">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)]">
              No se pudo cargar el mapa
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{mapError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-4 md:p-5">
        <header className="animate-fade-up pointer-events-auto mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="animate-pulse-ring flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] shadow-[var(--shadow-soft)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--foreground)] md:text-2xl">
                Balizas V16
              </h1>
              <p className="text-xs text-[var(--muted)]">España · datos DGT en vivo</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 shadow-[var(--shadow-soft)] sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
              {filteredBeacons.length}
            </span>
            <span className="text-xs text-[var(--muted)]">activas</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <BeaconFiltersPanel
            filters={filters}
            communities={filterOptions.communities}
            provinces={provinces}
            visibleCount={filteredBeacons.length}
            totalCount={beacons.length}
            hasActiveFilters={hasActiveFilters}
            theme={theme}
            isRefreshing={isRefreshing}
            secondsToRefresh={secondsToRefresh}
            isCollapsed={isFiltersCollapsed}
            onToggleCollapsed={() => setIsFiltersCollapsed((value) => !value)}
            onCommunityChange={handleCommunityChange}
            onProvinceChange={handleProvinceChange}
            onZoomToFilters={handleZoomToFilters}
            onClearFilters={handleClearFilters}
            onToggleTheme={toggleTheme}
            onManualRefresh={onManualRefresh}
          />
        </div>

        <footer className="animate-fade-up stagger-3 pointer-events-none mt-auto space-y-1 pt-2">
          <p className="text-[10px] leading-relaxed text-[var(--muted-soft)]">
            Fuente oficial · DGT DATEX2
            {" · "}
            Actualizado: {formattedUpdatedAt}
            {isRefreshing ? " · sincronizando…" : ""}
            {publicationTime ? ` · Publicación DGT: ${publicationTime}` : ""}
          </p>
          {selectedBeacon ? (
            <p className="text-[10px] text-[var(--accent)]">
              <span className="font-medium">{selectedBeacon.municipality}</span>
              {" · "}
              {selectedBeacon.road}
              {selectedBeacon.kilometerPoint !== undefined
                ? ` PK ${selectedBeacon.kilometerPoint}`
                : ""}
            </p>
          ) : hoveredBeacon ? (
            <p className="text-[10px] text-[var(--muted)]">
              <span className="font-medium">{hoveredBeacon.municipality}</span>
              {" · "}
              {formatSeverity(hoveredBeacon.severity)}
              {" · clic para detalle"}
            </p>
          ) : (
            <p className="text-[10px] text-[var(--muted-soft)]">
              Haz clic en una baliza para ver el detalle completo
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
