import { getMediaUrl } from "@/lib/supabase/media";
import type { getPublishedTravelPins } from "@/lib/queries";
import type { GlobePin } from "@/components/TravelGlobe";

type RawPin = Awaited<ReturnType<typeof getPublishedTravelPins>>[number];

export function buildGlobePins(rawPins: RawPin[]): GlobePin[] {
  return rawPins.map((pin) => {
    const entry = Array.isArray(pin.entries) ? pin.entries[0] : pin.entries;
    const entrySections = entry
      ? Array.isArray(entry.sections)
        ? entry.sections[0]
        : entry.sections
      : null;
    return {
      id: pin.id,
      label: pin.label,
      country: pin.country,
      lat: pin.lat,
      lng: pin.lng,
      href:
        entry && entrySections
          ? `/${entrySections.slug}/${entry.slug}`
          : null,
      photoUrl: pin.photo_path ? getMediaUrl(pin.photo_path) : null,
    };
  });
}
