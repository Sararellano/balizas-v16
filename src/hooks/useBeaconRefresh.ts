"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BeaconsResponse } from "@/lib/beacons/types";
import { REFRESH_INTERVAL_MS } from "@/lib/map/constants";

interface UseBeaconRefreshOptions {
  initialBeacons: BeaconsResponse["beacons"];
  initialUpdatedAt: string;
  initialPublicationTime?: string;
}

export function useBeaconRefresh({
  initialBeacons,
  initialUpdatedAt,
  initialPublicationTime,
}: UseBeaconRefreshOptions) {
  const [beacons, setBeacons] = useState(initialBeacons);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [publicationTime, setPublicationTime] = useState(initialPublicationTime);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(
    REFRESH_INTERVAL_MS / 1000,
  );
  const isMountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/beacons", { cache: "no-store" });
      if (!response.ok || !isMountedRef.current) return;

      const data = (await response.json()) as BeaconsResponse;
      setBeacons(data.beacons);
      setUpdatedAt(data.updatedAt);
      setPublicationTime(data.publicationTime);
      setSecondsToRefresh(REFRESH_INTERVAL_MS / 1000);
    } finally {
      if (isMountedRef.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    const countdownId = window.setInterval(() => {
      setSecondsToRefresh((current) => (current <= 1 ? REFRESH_INTERVAL_MS / 1000 : current - 1));
    }, 1000);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(intervalId);
      window.clearInterval(countdownId);
    };
  }, [refresh]);

  return {
    beacons,
    updatedAt,
    publicationTime,
    isRefreshing,
    secondsToRefresh,
    refresh,
  };
}
