import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InquiryStatus } from "./inquiry-status";

describe("InquiryStatus", () => {
  it.each([
    ["new", "New"],
    ["responded", "Responded"],
    ["closed", "Closed"],
  ] as const)("renders %s with its label", (status, label) => {
    expect(renderToStaticMarkup(<InquiryStatus status={status} />)).toContain(
      label,
    );
  });
});
