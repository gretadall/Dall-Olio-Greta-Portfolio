export type ParsedVideoUrl = {
  provider: "youtube" | "vimeo";
  embedUrl: string;
};

export function parseVideoUrl(url: string): ParsedVideoUrl | null {
  const trimmed = url.trim();

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (youtubeMatch) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return null;
}
