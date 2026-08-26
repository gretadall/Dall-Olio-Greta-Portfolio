import { getMediaUrl } from "@/lib/supabase/media";

export function SectionBackground({
  imagePath,
  opacity = 100,
  darkness = 0,
}: {
  imagePath: string | null;
  opacity?: number;
  darkness?: number;
}) {
  if (!imagePath) return null;

  return (
    <>
      <div
        aria-hidden
        className="-z-20"
        style={{
          position: "fixed",
          top: "-10vh",
          bottom: "-10vh",
          left: 0,
          right: 0,
          backgroundImage: `url('${getMediaUrl(imagePath)}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: opacity / 100,
        }}
      />
      <div
        aria-hidden
        className="-z-10"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: `rgba(0, 0, 0, ${darkness / 100})`,
        }}
      />
    </>
  );
}
