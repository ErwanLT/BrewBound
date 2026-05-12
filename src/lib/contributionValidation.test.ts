import { describe, expect, it } from "vitest";
import { parseContribution } from "./contributionValidation";

describe("parseContribution", () => {
  it("normalizes brewery coordinates and trims text", () => {
    const contribution = parseContribution({
      type: "brewery",
      data: {
        name: "  Brasserie Test  ",
        address: "1 rue du Test, Paris",
        city: " Paris ",
        lat: "48.85",
        lng: "2.35",
        website: "",
        hours: "",
        description: "Une brasserie de test serieuse.",
      },
      timestamp: new Date().toISOString(),
    });

    expect(contribution.type).toBe("brewery");
    if (contribution.type !== "brewery") throw new Error("Expected brewery contribution");
    expect(contribution.data.name).toBe("Brasserie Test");
    expect(contribution.data.lat).toBe(48.85);
    expect(contribution.data.lng).toBe(2.35);
    expect(contribution.data.website).toBeUndefined();
  });

  it("rejects unknown beer styles", () => {
    expect(() =>
      parseContribution({
        type: "beer",
        data: {
          breweryId: "ermitage-bruxelles",
          name: "Test Beer",
          style: "Mystery Juice",
          abv: "6.5",
          description: "Une description assez longue.",
        },
      }),
    ).toThrow();
  });

  it("normalizes beer ABV", () => {
    const contribution = parseContribution({
      type: "beer",
      data: {
        breweryId: "ermitage-bruxelles",
        name: "Test Beer",
        style: "IPA",
        abv: "6.5",
        description: "Une description assez longue.",
      },
    });

    expect(contribution.type).toBe("beer");
    if (contribution.type !== "beer") throw new Error("Expected beer contribution");
    expect(contribution.data.abv).toBe("6.5%");
  });
});
