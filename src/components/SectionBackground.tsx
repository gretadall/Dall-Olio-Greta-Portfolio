import { getMediaUrl } from "@/lib/supabase/media";

export function SectionBackground({
  imagePath,
}: {
  imagePath: string | null;
}) {
  if (!imagePath) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: `url('${getMediaUrl(imagePath)}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    />
  );
}
