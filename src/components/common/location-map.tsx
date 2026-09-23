"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { LatLng } from "@/lib/geocode";

const LeafletMap = dynamic(() => import("@/components/common/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
});

/**
 * Real interactive map (Leaflet + OpenStreetMap tiles — no API key needed).
 * To switch to Google Maps tiles later, point TileLayer at the Google
 * tile endpoint with NEXT_PUBLIC_GOOGLE_MAPS_KEY.
 */
export function LocationMap({ center, zoom = 12 }: { center: LatLng; zoom?: number }) {
  return <LeafletMap center={center} zoom={zoom} />;
}
