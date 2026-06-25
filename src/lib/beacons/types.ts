export type BeaconSeverity = "low" | "medium" | "high" | "critical";

export interface V16Beacon {
  id: string;
  lat: number;
  lon: number;
  road: string;
  roadName?: string;
  kilometerPoint?: number;
  direction?: string;
  tpegDirection?: string;
  municipality: string;
  province: string;
  autonomousCommunity: string;
  description?: string;
  severity: BeaconSeverity;
  incidentType: string;
  obstructionSubtype?: string;
  cause: string;
  managementType?: string;
  laneUsage?: string;
  startedAt?: string;
  createdAt?: string;
  endsAt?: string;
  validityStatus?: string;
  probability?: string;
  informationStatus?: string;
  source?: string;
  affectedLanes?: number;
  totalLanes?: number;
  delaySeconds?: number;
  queueLengthMeters?: number;
  recordId?: string;
  situationId?: string;
}

export interface BeaconsResponse {
  updatedAt: string;
  publicationTime?: string;
  source: string;
  total: number;
  beacons: V16Beacon[];
}

export interface BeaconFilters {
  autonomousCommunity: string;
  province: string;
}
