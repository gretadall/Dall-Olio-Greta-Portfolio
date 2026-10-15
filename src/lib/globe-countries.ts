import { toEnglishCountryName } from "@/lib/country-names";
// Country outlines with coordinates rounded to two decimals (~1 km, plenty at
// globe scale). Generated from public/globe/countries.geojson.
import allCountries from "@/data/countries.json";

export type CountryShape = {
  type: "Feature";
  properties: { name: string };
  geometry: { type: string; coordinates: unknown };
};

// Only the outlines of the countries that have at least one pin: the globe
// texture already shows the land, so shipping and triangulating all ~240
// countries in the browser was pure cost.
export function getVisitedCountryShapes(pins: { country: string | null }[]): CountryShape[] {
  const visited = new Set(
    pins.map((p) => p.country).filter((c): c is string => Boolean(c)).map(toEnglishCountryName)
  );
  return (allCountries as CountryShape[]).filter((c) => visited.has(c.properties.name));
}
