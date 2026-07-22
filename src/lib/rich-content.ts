const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

export function looksLikeHtml(content: string): boolean {
  return HTML_TAG_PATTERN.test(content);
}

export function legacyTextToHtml(text: string): string {
  if (!text.trim()) return "<p></p>";

  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.split("\n").join("<br>")}</p>`)
    .join("");
}
