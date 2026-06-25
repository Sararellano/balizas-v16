import type { BeaconSeverity, V16Beacon } from "./types";

const DGT_DATEX2_URL =
  "https://nap.dgt.es/datex2/v3/dgt/SituationPublication/datex2_v37.xml";

const CACHE_TTL_MS = 60_000;

let cachedPayload: {
  beacons: V16Beacon[];
  publicationTime?: string;
  timestamp: number;
} | null = null;

const VEHICLE_OBSTRUCTION_CAUSES = new Set(["vehicleObstruction", "obstruction"]);

const SITUATION_REGEX =
  /<[^:]*:?situation\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/[^:]*:?situation>/gi;

function readTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<[^:]*:?${tag}[^>]*>([^<]+)<`, "i"));
  return match?.[1]?.trim();
}

function readNestedTag(block: string, parent: string, child: string): string | undefined {
  const parentMatch = block.match(
    new RegExp(`<[^:]*:?${parent}[^>]*>([\\s\\S]*?)<\\/[^:]*:?${parent}>`, "i"),
  );
  if (!parentMatch) return undefined;
  return readTag(parentMatch[1], child);
}

function extractCoordinates(block: string): { lat: number; lon: number } | null {
  const latitudes = [...block.matchAll(/<[^:]*:?latitude[^>]*>([^<]+)</gi)].map((m) =>
    parseFloat(m[1].trim()),
  );
  const longitudes = [...block.matchAll(/<[^:]*:?longitude[^>]*>([^<]+)</gi)].map((m) =>
    parseFloat(m[1].trim()),
  );

  for (let i = 0; i < latitudes.length; i += 1) {
    const lat = latitudes[i];
    const lon = longitudes[i];
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return { lat, lon };
    }
  }

  return null;
}

function mapSeverity(value?: string): BeaconSeverity {
  if (!value) return "low";
  const normalized = value.toLowerCase();
  if (normalized === "highest" || normalized === "critical") return "critical";
  if (normalized === "high" || normalized === "severe") return "high";
  if (normalized === "medium" || normalized === "moderate") return "medium";
  return "low";
}

function readSpanishComment(block: string): string | undefined {
  const spanish = block.match(/<[^:]*:?value[^>]*lang="es"[^>]*>([^<]+)</i);
  if (spanish) return spanish[1].trim().slice(0, 500);
  const generic = block.match(/<[^:]*:?value[^>]*>([^<]+)</i);
  return generic?.[1]?.trim().slice(0, 500);
}

function parseSituation(situationId: string, block: string): V16Beacon | null {
  const cause = readTag(block, "causeType");
  if (!cause || !VEHICLE_OBSTRUCTION_CAUSES.has(cause)) {
    return null;
  }

  const coords = extractCoordinates(block);
  if (!coords) return null;

  const recordId = block.match(/<[^:]*:?situationRecord[^>]*id="([^"]+)"/i)?.[1];
  const roadName =
    readTag(block, "roadName") ??
    readNestedTag(block, "roadInformation", "roadName") ??
    readTag(block, "roadNumber");

  return {
    id: `v16-${situationId}`,
    situationId,
    recordId,
    lat: coords.lat,
    lon: coords.lon,
    road: roadName ?? "",
    roadName: readTag(block, "roadName"),
    kilometerPoint: (() => {
      const km = readTag(block, "kilometerPoint");
      return km ? parseFloat(km) : undefined;
    })(),
    direction: readTag(block, "tpegDirectionRoad") ?? readTag(block, "tpegDirection"),
    tpegDirection: readTag(block, "tpegDirection"),
    municipality: readTag(block, "municipality") ?? "",
    province: readTag(block, "province") ?? "",
    autonomousCommunity: readTag(block, "autonomousCommunity") ?? "",
    description: readSpanishComment(block),
    severity: mapSeverity(readTag(block, "overallSeverity")),
    incidentType: "vehicle_obstruction",
    obstructionSubtype:
      readNestedTag(block, "detailedCauseType", "vehicleObstructionType") ??
      readTag(block, "vehicleObstructionType"),
    cause,
    managementType: readTag(block, "roadOrCarriagewayOrLaneManagementType"),
    laneUsage: readTag(block, "laneUsage"),
    startedAt: readTag(block, "overallStartTime"),
    createdAt: readTag(block, "situationRecordCreationTime"),
    endsAt: readTag(block, "overallEndTime"),
    validityStatus: readTag(block, "validityStatus"),
    probability: readTag(block, "probabilityOfOccurrence"),
    informationStatus: readTag(block, "informationStatus"),
    source: readTag(block, "sourceIdentification"),
    affectedLanes: (() => {
      const value = readTag(block, "numberOfLanesRestricted");
      return value ? parseInt(value, 10) : undefined;
    })(),
    totalLanes: (() => {
      const value = readTag(block, "numberOfLanes");
      return value ? parseInt(value, 10) : undefined;
    })(),
    delaySeconds: (() => {
      const value = readTag(block, "delayTimeValue");
      return value ? parseInt(value, 10) : undefined;
    })(),
    queueLengthMeters: (() => {
      const value = readTag(block, "queueLengthValue");
      return value ? parseInt(value, 10) : undefined;
    })(),
  };
}

export function parseDatex2(xml: string): {
  beacons: V16Beacon[];
  publicationTime?: string;
} {
  const beacons: V16Beacon[] = [];
  const publicationTime = readTag(xml, "publicationTime");

  let match: RegExpExecArray | null;
  SITUATION_REGEX.lastIndex = 0;

  while ((match = SITUATION_REGEX.exec(xml)) !== null) {
    const [, situationId, situationBody] = match;
    const beacon = parseSituation(situationId, situationBody);
    if (beacon) beacons.push(beacon);
  }

  return { beacons, publicationTime };
}

export async function fetchActiveBeacons(): Promise<{
  beacons: V16Beacon[];
  publicationTime?: string;
}> {
  const now = Date.now();
  if (cachedPayload && now - cachedPayload.timestamp < CACHE_TTL_MS) {
    return {
      beacons: cachedPayload.beacons,
      publicationTime: cachedPayload.publicationTime,
    };
  }

  const response = await fetch(DGT_DATEX2_URL, {
    headers: {
      Accept: "application/xml, text/xml, */*",
      "Accept-Encoding": "gzip, deflate",
      "User-Agent": "balizas-v16-map/1.0 (+https://github.com/balizas-v16)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DGT DATEX2 error: HTTP ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parseDatex2(xml);

  cachedPayload = {
    ...parsed,
    timestamp: now,
  };

  return parsed;
}
