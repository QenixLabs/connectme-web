// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CommunicationPage from "@/app/(admin-app)/admin/communication/page";
import TermsPage from "@/app/(admin-app)/admin/terms-and-conditions/page";
import { adminContentApi, type Communication } from "@/lib/api/admin-content";
import { FormattedContent, safeActionLink } from "./formatted-content";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const item: Communication = {
  _id: "0123456789abcdef01234567",
  kind: "notice",
  status: "draft",
  title: "Scheduled update",
  message: "Review the new workflow.",
  audience: ["talent"],
  action_link: "/talent/dashboard",
  revision: 2,
  delivered: 0,
  suppressed: 0,
  created_at: "2026-01-01T00:00:00.000Z",
};

function mount(component: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{component}</QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.spyOn(adminContentApi, "roles").mockResolvedValue([
    "talent",
    "recruiter",
    "provider",
    "admin",
  ]);
  vi.spyOn(adminContentApi, "list").mockResolvedValue({
    items: [item],
    total: 1,
    page: 1,
    total_pages: 1,
  });
  vi.spyOn(adminContentApi, "audience").mockResolvedValue({
    audience: ["talent"],
    count: 42,
    revision: 2,
    note: "Active accounts only.",
  });
  vi.spyOn(adminContentApi, "publish").mockResolvedValue({});
  vi.spyOn(adminContentApi, "save").mockResolvedValue(item);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Communication admin flows", () => {
  it("requires audience confirmation before publication", async () => {
    mount(<CommunicationPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Publish" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByText("42 active accounts currently match.");
    expect(adminContentApi.publish).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm publication" }),
    );
    await waitFor(() =>
      expect(adminContentApi.publish).toHaveBeenCalledWith(
        item,
        expect.objectContaining({ audience: ["talent"], revision: 2 }),
      ),
    );
  });

  it("creates a validated draft using existing audience roles", async () => {
    mount(<CommunicationPage />);
    const create = await screen.findByRole("button", { name: "Create notice" });
    await waitFor(() =>
      expect((create as HTMLButtonElement).disabled).toBe(false),
    );
    fireEvent.click(create);
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Title"), {
      target: { value: "New notice" },
    });
    fireEvent.change(within(dialog).getByLabelText("Message"), {
      target: { value: "New message" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save draft" }));
    expect(await within(dialog).findByRole("alert")).toHaveProperty(
      "textContent",
      "Select at least one audience role.",
    );
    expect(adminContentApi.save).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByLabelText("provider"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(adminContentApi.save).toHaveBeenCalledWith(
        {
          kind: "notice",
          title: "New notice",
          message: "New message",
          audience: ["provider"],
          action_link: "",
        },
        undefined,
      ),
    );
  });

  it("blocks confirmation if another admin edited the saved item", async () => {
    vi.mocked(adminContentApi.audience).mockResolvedValue({
      audience: ["recruiter"],
      count: 1,
      revision: 3,
      note: "",
    });
    mount(<CommunicationPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Publish" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByText("1 active accounts currently match.");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm publication" }),
    );
    await within(dialog).findByText(
      "Item changed. Close and reload before confirming.",
    );
    expect(adminContentApi.publish).not.toHaveBeenCalled();
  });
});

describe("Legal content and permissions", () => {
  it("previews the saved legal version before publishing", async () => {
    const document = {
      key: "terms" as const,
      revision: 1,
      versions: [],
      draft: {
        title: "Approved terms",
        content: "## Heading\n**Approved** content",
        effective_at: "2026-01-01T00:00:00.000Z",
      },
    };
    vi.spyOn(adminContentApi, "legal").mockResolvedValue(document);
    vi.spyOn(adminContentApi, "publishLegal").mockResolvedValue({
      ...document,
      revision: 2,
      draft: null,
    });
    mount(<TermsPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Publish saved draft" }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Heading" }),
    ).toBeTruthy();
    expect(adminContentApi.publishLegal).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm publication" }),
    );
    await waitFor(() =>
      expect(adminContentApi.publishLegal).toHaveBeenCalledWith("terms", 1),
    );
  });

  it("renders formatting safely and rejects unsafe action links", () => {
    const { container } = render(
      <FormattedContent
        content={
          "## Title\n**Bold** and *italic*\n<script>alert(1)</script>\n<img src=x onerror=alert(1)>"
        }
      />,
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeTruthy();
    expect(container.querySelector("strong")?.textContent).toBe("Bold");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    for (const url of [
      "javascript:alert(1)",
      "//evil.test",
      "/\\evil.test",
      "https://user:pass@evil.test",
      "data:text/html,test",
    ]) {
      expect(safeActionLink(url)).toBeUndefined();
    }
    expect(safeActionLink("/terms")).toBe("/terms");
    expect(safeActionLink("https://example.com/update")).toBe(
      "https://example.com/update",
    );
  });
});
