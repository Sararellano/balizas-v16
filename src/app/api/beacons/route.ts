import { NextResponse } from "next/server";
import { fetchActiveBeacons } from "@/lib/beacons/parse-datex2";
import type { BeaconsResponse } from "@/lib/beacons/types";

export const revalidate = 60;

export async function GET() {
  try {
    const { beacons, publicationTime } = await fetchActiveBeacons();

    const payload: BeaconsResponse = {
      updatedAt: new Date().toISOString(),
      publicationTime,
      source: "DGT NAP DATEX2 v3.7",
      total: beacons.length,
      beacons,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
