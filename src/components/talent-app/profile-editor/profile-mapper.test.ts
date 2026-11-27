import { describe, expect, it } from "vitest";
import { mapViewToPayload } from "./profile-mapper";

describe("mapViewToPayload", () => {
  it("maps an empty date of birth to null so the optional field can be cleared", () => {
    expect(mapViewToPayload({ dateOfBirth: "" })).toEqual({
      date_of_birth: null,
    });
  });

  it("preserves a valid date of birth", () => {
    expect(mapViewToPayload({ dateOfBirth: "1990-04-15" })).toEqual({
      date_of_birth: "1990-04-15",
    });
  });
});
