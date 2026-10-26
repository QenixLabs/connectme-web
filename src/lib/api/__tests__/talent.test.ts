import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "../client";
import { talentApi } from "../talent";

vi.mock("../client", () => ({
  apiClient: { patch: vi.fn() },
}));

describe("talentApi.updateMyProfile", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: {} } as never);
  });

  it("omits persisted language IDs from profile update payloads", async () => {
    const languages = [
      Object.assign({ name: "Hindi", fluency: "Beginner" }, { _id: "language-id" }),
    ];

    await talentApi.updateMyProfile({ languages });

    expect(apiClient.patch).toHaveBeenCalledWith("/talent", {
      languages: [{ name: "Hindi", fluency: "Beginner" }],
    });
  });
});
