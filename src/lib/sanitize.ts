import sanitizeHtml from "sanitize-html";

export function sanitizeEntryBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "div",
      "iframe",
      "video",
      "source",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      div: ["data-video-embed", "data-provider", "data-src", "class"],
      iframe: ["src", "allow", "allowfullscreen", "frameborder", "style"],
      video: ["src", "controls", "style"],
      source: ["src", "type"],
    },
    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      a: ["http", "https", "mailto"],
    },
  });
}
