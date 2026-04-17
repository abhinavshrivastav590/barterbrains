// Re-export all backend types for convenience
export type {
  SaveProfileInput,
  NotificationPublic,
  MessagePublic,
  NotificationKind,
  SkillEntry,
  UserProfilePublic,
  MatchResult,
  Skill,
  SessionPublic,
  Conversation,
  Review,
  SessionRequest,
  Timestamp,
  UserId,
  SkillId,
  SessionId,
  MatchId,
  MessageId,
  NotificationId,
  ReviewId,
} from "../backend";
export { Proficiency, SessionStatus } from "../backend";

// UI-specific types
export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export type DashboardStats = {
  completedSessionsCount: bigint;
  activeSessionsCount: bigint;
  averageTrustScore: number;
};
