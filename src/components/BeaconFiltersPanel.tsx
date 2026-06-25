"use client";

import type { BeaconFilters } from "@/lib/beacons/types";
import type { MapTheme } from "@/lib/map/constants";

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface BeaconFiltersPanelProps {
  filters: BeaconFilters;
  communities: string[];
  provinces: string[];
  visibleCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  theme: MapTheme;
  isRefreshing: boolean;
  secondsToRefresh: number;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onCommunityChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onZoomToFilters: () => void;
  onClearFilters: () => void;
  onToggleTheme: () => void;
  onManualRefresh: () => void;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}

export function BeaconFiltersPanel({
  filters,
  communities,
  provinces,
  visibleCount,
  totalCount,
  hasActiveFilters,
  theme,
  isRefreshing,
  secondsToRefresh,
  isCollapsed,
  onToggleCollapsed,
  onCommunityChange,
  onProvinceChange,
  onZoomToFilters,
  onClearFilters,
  onToggleTheme,
  onManualRefresh,
}: BeaconFiltersPanelProps) {
  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="animate-fade-in pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-panel)] transition hover:border-[var(--border-strong)] hover:shadow-lg"
        aria-label="Abrir filtros"
        aria-expanded={false}
        title="Abrir filtros"
      >
        <MenuIcon />
        {hasActiveFilters ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
            {visibleCount}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <section
      className="animate-slide-left pointer-events-auto w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-panel)]"
      aria-label="Filtros de balizas"
      aria-expanded
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Explorar
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)]">
            Filtrar balizas
          </h2>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            <span
              key={visibleCount}
              className="animate-count-pop inline-block font-semibold text-[var(--foreground)] tabular-nums"
            >
              {visibleCount}
            </span>
            {" visibles · "}
            <span className="tabular-nums">{totalCount}</span> en España
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-warm)] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            aria-label="Cerrar filtros"
            title="Cerrar filtros"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-warm)] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Comunidad autónoma
          </span>
          <select
            value={filters.autonomousCommunity}
            onChange={(event) => onCommunityChange(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-warm)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          >
            <option value="">Todas las comunidades</option>
            {communities.map((community) => (
              <option key={community} value={community}>
                {community}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Provincia
          </span>
          <select
            value={filters.province}
            onChange={(event) => onProvinceChange(event.target.value)}
            disabled={!filters.autonomousCommunity}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-warm)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {filters.autonomousCommunity
                ? "Todas las provincias"
                : "Selecciona una comunidad"}
            </option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onZoomToFilters}
          disabled={!hasActiveFilters || visibleCount === 0}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ir al filtro
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-warm)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-warm)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRefreshing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-transparent" />
              Actualizando
            </span>
          ) : (
            "Actualizar"
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-1000 ease-linear"
            style={{ width: `${((60 - secondsToRefresh) / 60) * 100}%` }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-[var(--muted-soft)]">
          {secondsToRefresh}s
        </span>
      </div>
    </section>
  );
}
