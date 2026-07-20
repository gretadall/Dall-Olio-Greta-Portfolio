export const RESERVED_SLUGS = ["admin", "login", "auth", "api"];

const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
