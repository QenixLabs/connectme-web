// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TalentCard } from "@/components/find-talent/TalentCard";
import type { TalentProfile } from "@/lib/api/talent";

vi.mock("@/hooks/use-talent-actions", () => ({
  useSaveTalent: () => ({
    isSaved: false,
    isPending: false,
    toggleSave: vi.fn(),
  }),
}));

const talent: TalentProfile = {
  _id: "talent-1",
  user_id: "user-1",
  username: "jane-doe",
  full_legal_name: "Jane Doe",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("TalentCard", () => {
  it("closes the profile preview without the card reopening it", () => {
    render(<TalentCard talent={talent} />);

    fireEvent.click(screen.getByRole("button", { name: /preview jane doe's talent profile/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
