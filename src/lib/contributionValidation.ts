import { z } from "zod";
import { BEER_STYLES } from "../constants/beerStyles";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const trimmedString = z.string().trim();

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("URL invalide").optional(),
);

const optionalCoordinate = z.preprocess(
  emptyToUndefined,
  z.coerce.number().finite().optional(),
);

const idSchema = trimmedString
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9._-]+$/, "Identifiant invalide")
  .optional();

export const breweryContributionSchema = z.object({
  id: idSchema,
  name: trimmedString.min(2).max(120),
  address: trimmedString.min(5).max(240),
  city: trimmedString.min(2).max(120),
  lat: optionalCoordinate,
  lng: optionalCoordinate,
  website: optionalUrl,
  hours: trimmedString.max(160).optional().default(""),
  description: trimmedString.min(10).max(2000),
});

export const beerContributionSchema = z.object({
  id: idSchema,
  breweryId: idSchema.unwrap(),
  name: trimmedString.min(2).max(120),
  style: z.enum(BEER_STYLES),
  abv: trimmedString
    .regex(/^\d{1,2}([.,]\d)?%?$/, "ABV invalide")
    .transform((value) => (value.endsWith("%") ? value : `${value}%`)),
  imageUrl: optionalUrl,
  description: trimmedString.min(10).max(2000),
});

export const contributionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("brewery"),
    data: breweryContributionSchema,
    timestamp: trimmedString.datetime().optional(),
  }),
  z.object({
    type: z.literal("beer"),
    data: beerContributionSchema,
    timestamp: trimmedString.datetime().optional(),
  }),
]);

export type ContributionPayload = z.infer<typeof contributionSchema>;

export function parseContribution(payload: unknown): ContributionPayload {
  return contributionSchema.parse(payload);
}
