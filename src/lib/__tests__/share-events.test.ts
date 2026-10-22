import { describe, expect, it, vi } from "vitest";

import { createShareEventRecorder } from "@/lib/share-events";

describe("createShareEventRecorder", () => {
  it("sends the event with the profile, source and method", async () => {
    const send = vi.fn().mockResolvedValue({ recorded: true });
    const recorder = createShareEventRecorder({
      role: "talent",
      slug: "asha",
      source: "talent_dashboard",
      send,
    });

    await expect(
      recorder.record({ type: "link_copy", destination: "copy", method: "clipboard" }),
    ).resolves.toBe(true);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      target: "talent",
      slug: "asha",
      event_type: "link_copy",
      destination: "copy",
      method: "clipboard",
      source: "talent_dashboard",
    });
  });

  it("drops a repeated event inside the dedupe window", async () => {
    const send = vi.fn().mockResolvedValue({ recorded: true });
    let clock = 1000;
    const recorder = createShareEventRecorder({
      role: "talent",
      slug: "asha",
      source: "talent_dashboard",
      send,
      now: () => clock,
      dedupeWindowMs: 4000,
    });

    await recorder.record({ type: "link_copy", destination: "copy" });
    clock += 1000;
    await recorder.record({ type: "link_copy", destination: "copy" });

    expect(send).toHaveBeenCalledTimes(1);
  });

  it("records the event again once the dedupe window passed", async () => {
    const send = vi.fn().mockResolvedValue({ recorded: true });
    let clock = 1000;
    const recorder = createShareEventRecorder({
      role: "talent",
      slug: "asha",
      source: "talent_dashboard",
      send,
      now: () => clock,
      dedupeWindowMs: 4000,
    });

    await recorder.record({ type: "link_copy", destination: "copy" });
    clock += 5000;
    await recorder.record({ type: "link_copy", destination: "copy" });

    expect(send).toHaveBeenCalledTimes(2);
  });

  it("keeps different destinations apart", async () => {
    const send = vi.fn().mockResolvedValue({ recorded: true });
    const recorder = createShareEventRecorder({
      role: "talent",
      slug: "asha",
      source: "talent_dashboard",
      send,
    });

    await recorder.record({
      type: "destination_selected",
      destination: "whatsapp",
    });
    await recorder.record({
      type: "destination_selected",
      destination: "linkedin",
    });

    expect(send).toHaveBeenCalledTimes(2);
  });

  it("never throws when the transport fails", async () => {
    const send = vi.fn().mockRejectedValue(new Error("network down"));
    const recorder = createShareEventRecorder({
      role: "talent",
      slug: "asha",
      source: "talent_dashboard",
      send,
    });

    await expect(
      recorder.record({ type: "dialog_open" }),
    ).resolves.toBe(false);
  });

  it("does not send anything when the profile has no slug", async () => {
    const send = vi.fn().mockResolvedValue({ recorded: true });
    const recorder = createShareEventRecorder({
      role: "talent",
      slug: "",
      source: "talent_dashboard",
      send,
    });

    await expect(recorder.record({ type: "dialog_open" })).resolves.toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("forgets recorded events after a reset", async () => {
    const send = vi.fn().mockResolvedValue({ recorded: true });
    const recorder = createShareEventRecorder({
      role: "talent",
      slug: "asha",
      source: "talent_dashboard",
      send,
    });

    await recorder.record({ type: "dialog_open" });
    recorder.reset();
    await recorder.record({ type: "dialog_open" });

    expect(send).toHaveBeenCalledTimes(2);
  });
});
