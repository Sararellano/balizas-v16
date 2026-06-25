import type { ReactNode } from "react";
import type { V16Beacon } from "@/lib/beacons/types";
import {
  formatCause,
  formatCoordinates,
  formatDateTime,
  formatDelay,
  formatDirection,
  formatDurationSince,
  formatInformationStatus,
  formatManagementType,
  formatObstructionSubtype,
  formatProbability,
  formatSeverity,
  formatValidityStatus,
} from "@/lib/beacons/format";

interface BeaconTooltipCardProps {
  beacon: V16Beacon;
  onClose?: () => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (value === undefined || value === "") return null;

  return (
    <div className="grid grid-cols-[minmax(0,36%)_1fr] gap-x-3 gap-y-0.5 text-xs leading-relaxed">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

export function BeaconTooltipCard({ beacon, onClose }: BeaconTooltipCardProps) {
  const activeFor = formatDurationSince(beacon.startedAt);
  const whatHappens =
    formatObstructionSubtype(beacon.obstructionSubtype) ??
    formatCause(beacon.cause) ??
    formatManagementType(beacon.managementType) ??
    "Vehículo obstruyendo la vía";

  const roadLabel = beacon.roadName && beacon.roadName !== beacon.road
    ? `${beacon.road} (${beacon.roadName})`
    : beacon.road || "Vía sin identificar";

  return (
    <article
      className="animate-fade-up w-[min(24rem,calc(100vw-2rem))] max-h-[min(70dvh,32rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-panel)]"
      aria-label={`Baliza V16 en ${beacon.municipality}`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Baliza V16 activa
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-base font-semibold leading-snug text-[var(--foreground)]">
            {roadLabel}
            {beacon.kilometerPoint !== undefined ? ` · PK ${beacon.kilometerPoint}` : ""}
          </h3>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{whatHappens}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
            {formatSeverity(beacon.severity)}
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
              aria-label="Cerrar detalle"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </header>

      <div className="space-y-4 border-t border-[var(--border)] pt-3">
        <DetailSection title="Ubicación">
          <DetailRow
            label="Municipio"
            value={`${beacon.municipality}, ${beacon.province}`}
          />
          <DetailRow label="Comunidad" value={beacon.autonomousCommunity} />
          <DetailRow label="Coordenadas" value={formatCoordinates(beacon.lat, beacon.lon)} />
          <DetailRow
            label="Sentido"
            value={formatDirection(beacon.direction) ?? formatDirection(beacon.tpegDirection)}
          />
        </DetailSection>

        <DetailSection title="Incidente">
          <DetailRow label="Tipo" value={whatHappens} />
          <DetailRow label="Causa" value={formatCause(beacon.cause)} />
          <DetailRow
            label="Subtipo"
            value={formatObstructionSubtype(beacon.obstructionSubtype)}
          />
          <DetailRow
            label="Gestión vía"
            value={formatManagementType(beacon.managementType)}
          />
          <DetailRow label="Uso carril" value={beacon.laneUsage} />
          <DetailRow
            label="Carriles afectados"
            value={
              beacon.affectedLanes !== undefined && beacon.totalLanes !== undefined
                ? `${beacon.affectedLanes} de ${beacon.totalLanes}`
                : undefined
            }
          />
        </DetailSection>

        <DetailSection title="Tiempos">
          <DetailRow label="Activada" value={formatDateTime(beacon.startedAt)} />
          <DetailRow label="Tiempo activa" value={activeFor} />
          <DetailRow label="Registrada" value={formatDateTime(beacon.createdAt)} />
          <DetailRow label="Fin previsto" value={formatDateTime(beacon.endsAt)} />
        </DetailSection>

        <DetailSection title="Impacto">
          <DetailRow label="Retraso" value={formatDelay(beacon.delaySeconds)} />
          <DetailRow
            label="Longitud cola"
            value={
              beacon.queueLengthMeters !== undefined
                ? `${beacon.queueLengthMeters} m`
                : undefined
            }
          />
        </DetailSection>

        <DetailSection title="Estado DGT">
          <DetailRow label="Validez" value={formatValidityStatus(beacon.validityStatus)} />
          <DetailRow label="Probabilidad" value={formatProbability(beacon.probability)} />
          <DetailRow
            label="Información"
            value={formatInformationStatus(beacon.informationStatus)}
          />
          <DetailRow label="Fuente" value={beacon.source ?? "DGT"} />
          <DetailRow label="ID situación" value={beacon.situationId} />
          <DetailRow label="ID registro" value={beacon.recordId} />
        </DetailSection>

        {beacon.description ? (
          <div className="rounded-xl bg-[var(--bg-warm)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              Descripción
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--foreground)]">
              {beacon.description}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

interface ClusterTooltipCardProps {
  count: number;
}

export function ClusterTooltipCard({ count }: ClusterTooltipCardProps) {
  return (
    <article className="animate-fade-up rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-panel)]">
      <p className="text-sm font-semibold text-[var(--foreground)]">
        {count} balizas en esta zona
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">Haz clic para acercar el mapa</p>
    </article>
  );
}
