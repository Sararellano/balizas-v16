"use client";

import dynamic from "next/dynamic";
import type { V16Beacon } from "@/lib/beacons/types";
import { useBeaconRefresh } from "@/hooks/useBeaconRefresh";

const BeaconMap = dynamic(
  () => import("@/components/BeaconMap").then((module) => module.BeaconMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-5 bg-[var(--bg)]">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border-strong)]" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent)]" />
        </div>
        <p className="text-sm font-medium text-[var(--muted)]">Cargando mapa de balizas V16…</p>
      </div>
    ),
  },
);

interface BeaconMapClientProps {
  beacons: V16Beacon[];
  updatedAt: string;
  publicationTime?: string;
}

export function BeaconMapClient({
  beacons: initialBeacons,
  updatedAt: initialUpdatedAt,
  publicationTime: initialPublicationTime,
}: BeaconMapClientProps) {
  const {
    beacons,
    updatedAt,
    publicationTime,
    isRefreshing,
    secondsToRefresh,
    refresh,
  } = useBeaconRefresh({
    initialBeacons,
    initialUpdatedAt,
    initialPublicationTime,
  });

  return (
    <BeaconMap
      beacons={beacons}
      updatedAt={updatedAt}
      publicationTime={publicationTime}
      isRefreshing={isRefreshing}
      secondsToRefresh={secondsToRefresh}
      onManualRefresh={refresh}
    />
  );
}
