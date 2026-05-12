import type { Beer, Brewery } from "../types";

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export function normalizeBreweries(rawBreweries: Brewery[]): Brewery[] {
  return rawBreweries
    .map((brewery) => {
      const lat = toNumber(brewery.lat);
      const lng = toNumber(brewery.lng);

      return {
        ...brewery,
        lat: lat ?? 0,
        lng: lng ?? 0,
        hours: brewery.hours ?? "",
        description: brewery.description ?? "",
      };
    })
    .filter((brewery) => brewery.lat !== 0 && brewery.lng !== 0);
}

export function normalizeBeers(rawBeers: Beer[]): Beer[] {
  return rawBeers.map((beer) => ({
    ...beer,
    description: beer.description ?? "",
    imageUrl: beer.imageUrl || undefined,
  }));
}
