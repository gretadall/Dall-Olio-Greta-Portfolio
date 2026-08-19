import { getMediaUrl } from "@/lib/supabase/media";

export function SectionBackground({
  imagePath,
  opacity = 100,
}: {
  imagePath: string | null;
  opacity?: number;
}) {
  if (!imagePath) return null;

  return (
    <div
      aria-hidden
      className="-z-10"
      style={{
        position: "fixed",
        top: "-10vh",
        bottom: "-10vh",
        left: 0,
        right: 0,
        backgroundImage: `url('${getMediaUrl(imagePath)}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        opacity: opacity / 100,
      }}
    />
  );
}
