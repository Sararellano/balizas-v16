import { fetchActiveBeacons } from "@/lib/beacons/parse-datex2";
import type { V16Beacon } from "@/lib/beacons/types";
import { BeaconMapClient } from "@/components/BeaconMapClient";

export const revalidate = 60;

export default async function HomePage() {
  let beacons: V16Beacon[] = [];
  const updatedAt = new Date().toISOString();
  let publicationTime: string | undefined;
  let errorMessage: string | undefined;

  try {
    const data = await fetchActiveBeacons();
    beacons = data.beacons;
    publicationTime = data.publicationTime;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudieron cargar las balizas.";
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg)] px-6 text-center">
        <div className="max-w-md animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-panel)]">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)]">
            Balizas V16 España
          </h1>
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BeaconMapClient
        beacons={beacons}
        updatedAt={updatedAt}
        publicationTime={publicationTime}
      />
    </main>
  );
}
