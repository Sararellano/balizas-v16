import type { BeaconSeverity } from "./types";

const SEVERITY_LABELS: Record<BeaconSeverity, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

const OBSTRUCTION_LABELS: Record<string, string> = {
  vehicleStuck: "Vehículo inmovilizado",
  brokenDownVehicle: "Vehículo averiado",
  accident: "Accidente",
  spilledLoad: "Carga derramada",
  obstruction: "Obstrucción",
  vehicleObstruction: "Obstrucción por vehículo",
};

const MANAGEMENT_LABELS: Record<string, string> = {
  carriagewayClosures: "Cierre de calzada",
  narrowLanes: "Carril estrecho",
  laneClosures: "Cierre de carril",
  contraflow: "Contracarril",
};

const CAUSE_LABELS: Record<string, string> = {
  vehicleObstruction: "Obstrucción por vehículo",
  obstruction: "Obstrucción en la vía",
};

const DIRECTION_LABELS: Record<string, string> = {
  both: "Ambos sentidos",
  northBound: "Sentido norte",
  southBound: "Sentido sur",
  eastBound: "Sentido este",
  westBound: "Sentido oeste",
  unknown: "Desconocido",
};

const VALIDITY_LABELS: Record<string, string> = {
  active: "Activa",
  suspended: "Suspendida",
  definedByValidityTimeSpec: "Definida por horario",
};

const INFORMATION_STATUS_LABELS: Record<string, string> = {
  real: "Confirmada",
  test: "Prueba",
  exercise: "Ejercicio",
};

const PROBABILITY_LABELS: Record<string, string> = {
  certain: "Cierta",
  probable: "Probable",
  riskOf: "Riesgo de",
  improbable: "Improbable",
};

export function formatSeverity(severity: BeaconSeverity): string {
  return SEVERITY_LABELS[severity];
}

export function formatObstructionSubtype(value?: string): string | undefined {
  if (!value) return undefined;
  return OBSTRUCTION_LABELS[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

export function formatManagementType(value?: string): string | undefined {
  if (!value) return undefined;
  return MANAGEMENT_LABELS[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

export function formatCause(value?: string): string | undefined {
  if (!value) return undefined;
  return CAUSE_LABELS[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

export function formatDirection(value?: string): string | undefined {
  if (!value) return undefined;
  return DIRECTION_LABELS[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

export function formatValidityStatus(value?: string): string | undefined {
  if (!value) return undefined;
  return VALIDITY_LABELS[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

export function formatInformationStatus(value?: string): string | undefined {
  if (!value) return undefined;
  return INFORMATION_STATUS_LABELS[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

export function formatProbability(value?: string): string | undefined {
  if (!value) return undefined;
  return PROBABILITY_LABELS[value] ?? value.replace(/([A-Z])/g, " $1").trim();
}

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lon).toFixed(5)}° ${lonDir}`;
}

export function formatDurationSince(isoDate?: string): string | undefined {
  if (!isoDate) return undefined;
  const start = new Date(isoDate);
  if (Number.isNaN(start.getTime())) return undefined;

  const diffMs = Date.now() - start.getTime();
  if (diffMs < 0) return "Recién activada";

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} d ${hours % 24} h`;
  if (hours > 0) return `${hours} h ${minutes % 60} min`;
  if (minutes > 0) return `${minutes} min`;
  return "Menos de 1 min";
}

export function formatDateTime(isoDate?: string): string | undefined {
  if (!isoDate) return undefined;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDelay(seconds?: number): string | undefined {
  if (seconds === undefined) return undefined;
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
