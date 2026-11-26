export const TALENT_TOUR_REPLAY_EVENT = "morporfiil:replay-talent-tour";
export const RECRUITER_TOUR_REPLAY_EVENT = "morporfiil:replay-recruiter-tour";
export const PROVIDER_TOUR_REPLAY_EVENT = "morporfiil:replay-provider-tour";

export function tourReplayEventForRole(role: "talent" | "recruiter" | "provider") {
  if (role === "recruiter") return RECRUITER_TOUR_REPLAY_EVENT;
  if (role === "provider") return PROVIDER_TOUR_REPLAY_EVENT;
  return TALENT_TOUR_REPLAY_EVENT;
}
