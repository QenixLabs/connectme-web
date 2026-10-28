import { beforeEach, describe, expect, it, vi } from "vitest";

const { client } = vi.hoisted(() => ({
  client: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../client", () => ({ apiClient: client }));

import { serviceInquiriesApi } from "../inquiries";

describe("serviceInquiriesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an inquiry using the public provider slug and idempotency key", async () => {
    const inquiry = { id: "inquiry-1", status: "new" };
    client.post.mockResolvedValue({ data: { inquiry } });
    const payload = {
      provider_slug: "public-provider",
      service_id: "service-1",
      description: "Need help with a project",
      idempotency_key: "81c2c75e-4362-46e7-91f7-10cc126fc6f2",
    };

    await expect(serviceInquiriesApi.create(payload)).resolves.toEqual({
      inquiry,
    });
    expect(client.post).toHaveBeenCalledWith("/service-inquiries", payload);
  });

  it("requests paginated requester and provider inboxes", async () => {
    const result = { data: [], total: 0, page: 2, limit: 10, hasMore: false };
    client.get.mockResolvedValue({ data: result });

    await expect(
      serviceInquiriesApi.getMine({ page: 2, limit: 10 }),
    ).resolves.toEqual(result);
    expect(client.get).toHaveBeenCalledWith("/service-inquiries/mine", {
      params: { page: 2, limit: 10 },
    });

    await expect(
      serviceInquiriesApi.getIncoming({ status: "new" }),
    ).resolves.toEqual(result);
    expect(client.get).toHaveBeenLastCalledWith("/service-inquiries/incoming", {
      params: { status: "new" },
    });
  });

  it("encodes inquiry ids and exposes detail and permitted status updates", async () => {
    client.get.mockResolvedValue({
      data: { inquiry: { id: "x/y" }, viewer_role: "requester" },
    });
    client.patch.mockResolvedValue({
      data: { inquiry: { id: "x/y", status: "closed" } },
    });

    await serviceInquiriesApi.getOne("x/y");
    expect(client.get).toHaveBeenCalledWith("/service-inquiries/x%2Fy");

    await serviceInquiriesApi.update("x/y", { status: "closed" });
    expect(client.patch).toHaveBeenCalledWith("/service-inquiries/x%2Fy", {
      status: "closed",
    });
  });
});
