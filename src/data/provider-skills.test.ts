import { describe, expect, it } from "vitest";
import {
  findProviderSkill,
  PROVIDER_SKILLS,
  searchProviderSkills,
} from "@/data/provider-skills";

describe("provider skills", () => {
  it("provides a broad library with a distinct icon for each skill", () => {
    expect(PROVIDER_SKILLS.length).toBeGreaterThan(70);
    expect(new Set(PROVIDER_SKILLS.map((skill) => skill.name.toLowerCase())).size)
      .toBe(PROVIDER_SKILLS.length);
    const duplicateIconSkills = PROVIDER_SKILLS.filter(
      (skill, index) =>
        PROVIDER_SKILLS.findIndex((other) => other.icon === skill.icon) !== index,
    ).map((skill) => skill.name);
    expect(duplicateIconSkills).toEqual([]);
  });

  it("finds skills and searches names without regard to case or surrounding spaces", () => {
    expect(findProviderSkill("  ui/ux DESIGN ")?.name).toBe("UI/UX Design");
    expect(searchProviderSkills("  marketing ").map((skill) => skill.name)).toContain(
      "Email Marketing",
    );
  });
});
