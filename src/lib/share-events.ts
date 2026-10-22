/**
 * Client side recorder for profile-share analytics events.
 *
 * The recorder exists so that:
 * - every share entry point reports the same event vocabulary;
 * - a double click cannot produce two events;
 * - a failing analytics request never breaks the sharing flow.
 *
 * It is deliberately framework agnostic so it can be unit tested without a
 * DOM or a React renderer.
 */

import type {
  ProfileShareDestinationType,
  ProfileShareEventType,
  ProfileShareMethodType,
  ProfileShareTargetType,
  RecordProfileShareEventPayload,
} from "@/lib/api/profile-shares";

export interface ShareEvent {
  type: ProfileShareEventType;
  destination?: ProfileShareDestinationType;
  method?: ProfileShareMethodType;
}

export interface ShareEventRecorderOptions {
  /** Role of the shared profile owner. */
  role: ProfileShareTargetType;
  /** Canonical username / slug of the shared profile. */
  slug: string;
  /** Entry point that opened the share interface. */
  source: string;
  /** Transport used to send the event. */
  send: (payload: RecordProfileShareEventPayload) => Promise<unknown>;
  /** Clock override, mainly for tests. */
  now?: () => number;
  /** Minimum gap between two identical events. */
  dedupeWindowMs?: number;
}

export interface ShareEventRecorder {
  /** Sends the event unless an identical one was just sent. */
  record: (event: ShareEvent) => Promise<boolean>;
  /** Clears the dedupe memory. */
  reset: () => void;
}

export const DEFAULT_SHARE_EVENT_DEDUPE_WINDOW_MS = 4000;

export function createShareEventRecorder(
  options: ShareEventRecorderOptions,
): ShareEventRecorder {
  const sent = new Map<string, number>();
  const now = options.now ?? (() => Date.now());
  const windowMs =
    options.dedupeWindowMs ?? DEFAULT_SHARE_EVENT_DEDUPE_WINDOW_MS;

  return {
    async record(event) {
      // Without a slug the event cannot be attributed to a profile.
      if (!options.slug) return false;

      const key = `${event.type}:${event.destination ?? ""}:${event.method ?? ""}`;
      const timestamp = now();
      const previous = sent.get(key);

      if (previous !== undefined && timestamp - previous < windowMs) {
        return false;
      }
      sent.set(key, timestamp);

      try {
        await options.send({
          target: options.role,
          slug: options.slug,
          event_type: event.type,
          destination: event.destination,
          method: event.method,
          source: options.source,
        });
        return true;
      } catch {
        // Analytics must never break the sharing flow.
        return false;
      }
    },
    reset() {
      sent.clear();
    },
  };
}
