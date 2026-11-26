import { describe, expect, it } from "vitest";

import {
  isLocalOrigin,
  isLoopbackHostname,
  isPrivateHostname,
  isPubliclyReachableOrigin,
  normalizeOrigin,
  resolveSiteOrigin,
} from "@/lib/site";

describe("normalizeOrigin", () => {
  it("keeps the scheme and the host only", () => {
    expect(normalizeOrigin("https://morporfiil.app")).toBe("https://morporfiil.app");
    expect(normalizeOrigin("https://morporfiil.app/")).toBe("https://morporfiil.app");
    expect(normalizeOrigin("https://morporfiil.app/some/path")).toBe(
      "https://morporfiil.app",
    );
    expect(normalizeOrigin("https://morporfiil.app:8443")).toBe(
      "https://morporfiil.app:8443",
    );
  });

  it("returns an empty string for values that are not http(s) origins", () => {
    expect(normalizeOrigin("")).toBe("");
    expect(normalizeOrigin("   ")).toBe("");
    expect(normalizeOrigin(null)).toBe("");
    expect(normalizeOrigin("morporfiil.app")).toBe("");
    expect(normalizeOrigin("ftp://morporfiil.app")).toBe("");
    expect(normalizeOrigin("javascript:alert(1)")).toBe("");
  });
});

describe("host safety", () => {
  it("detects loopback hosts", () => {
    expect(isLoopbackHostname("localhost")).toBe(true);
    expect(isLoopbackHostname("127.0.0.1")).toBe(true);
    expect(isLoopbackHostname("127.1.2.3")).toBe(true);
    expect(isLoopbackHostname("0.0.0.0")).toBe(true);
    expect(isLoopbackHostname("::1")).toBe(true);
    expect(isLoopbackHostname("app.localhost")).toBe(true);
    expect(isLoopbackHostname("morporfiil.app")).toBe(false);
  });

  it("detects private hosts", () => {
    expect(isPrivateHostname("192.168.1.10")).toBe(true);
    expect(isPrivateHostname("10.0.0.5")).toBe(true);
    expect(isPrivateHostname("172.16.4.4")).toBe(true);
    expect(isPrivateHostname("printer.local")).toBe(true);
    expect(isPrivateHostname("service.internal")).toBe(true);
    expect(isPrivateHostname("morporfiil.app")).toBe(false);
  });

  it("classifies origins as public or local", () => {
    expect(isPubliclyReachableOrigin("https://morporfiil.app")).toBe(true);
    expect(isPubliclyReachableOrigin("http://localhost:3000")).toBe(false);
    expect(isPubliclyReachableOrigin("")).toBe(false);

    expect(isLocalOrigin("http://localhost:3000")).toBe(true);
    expect(isLocalOrigin("https://morporfiil.app")).toBe(false);
  });
});

describe("resolveSiteOrigin", () => {
  it("prefers the configured public site URL in every environment", () => {
    expect(
      resolveSiteOrigin({
        configured: "https://morporfiil.app",
        windowOrigin: "http://localhost:3000",
        nodeEnv: "development",
      }),
    ).toBe("https://morporfiil.app");

    expect(
      resolveSiteOrigin({
        configured: "https://staging.morporfiil.app",
        windowOrigin: "https://staging.morporfiil.app",
        nodeEnv: "production",
      }),
    ).toBe("https://staging.morporfiil.app");

    expect(
      resolveSiteOrigin({
        configured: "https://morporfiil.app/",
        windowOrigin: "https://morporfiil.app",
        nodeEnv: "production",
      }),
    ).toBe("https://morporfiil.app");
  });

  it("keeps the configured origin separate per environment", () => {
    const development = resolveSiteOrigin({
      configured: "http://localhost:3000",
      windowOrigin: "http://localhost:3000",
      nodeEnv: "development",
    });
    const production = resolveSiteOrigin({
      configured: "https://morporfiil.app",
      windowOrigin: "https://morporfiil.app",
      nodeEnv: "production",
    });

    expect(development).toBe("http://localhost:3000");
    expect(production).toBe("https://morporfiil.app");
    expect(development).not.toBe(production);
  });

  it("falls back to the origin the app is served from", () => {
    expect(
      resolveSiteOrigin({
        windowOrigin: "https://morporfiil.app",
        nodeEnv: "production",
      }),
    ).toBe("https://morporfiil.app");
  });

  it("allows a local origin while developing", () => {
    expect(
      resolveSiteOrigin({
        windowOrigin: "http://localhost:3000",
        nodeEnv: "development",
      }),
    ).toBe("http://localhost:3000");
  });

  it("never returns a local origin in production", () => {
    expect(
      resolveSiteOrigin({
        configured: "http://localhost:3000",
        windowOrigin: "http://localhost:3000",
        nodeEnv: "production",
      }),
    ).toBe("");

    expect(
      resolveSiteOrigin({
        configured: "http://127.0.0.1:3000",
        windowOrigin: "http://127.0.0.1:3000",
        nodeEnv: "production",
      }),
    ).toBe("");
  });

  it("returns an empty origin when nothing is configured", () => {
    expect(resolveSiteOrigin({ nodeEnv: "production" })).toBe("");
    expect(resolveSiteOrigin({})).toBe("");
  });

  it("ignores a configured value that is not a usable origin", () => {
    expect(
      resolveSiteOrigin({
        configured: "not-a-url",
        windowOrigin: "https://morporfiil.app",
        nodeEnv: "production",
      }),
    ).toBe("https://morporfiil.app");
  });
});
