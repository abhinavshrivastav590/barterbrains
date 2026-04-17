import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SaveProfileInput {
    bio: string;
    skillsOffered: Array<SkillEntry>;
    name: string;
    avatar?: string;
    skillsWanted: Array<SkillEntry>;
}
export interface NotificationPublic {
    id: NotificationId;
    kind: NotificationKind;
    createdAt: Timestamp;
    dismissed: boolean;
}
export type Timestamp = bigint;
export interface MessagePublic {
    id: MessageId;
    content: string;
    isRead: boolean;
    receiverId: UserId;
    timestamp: Timestamp;
    senderId: UserId;
}
export type NotificationKind = {
    __kind__: "sessionAccepted";
    sessionAccepted: {
        sessionId: SessionId;
    };
} | {
    __kind__: "newMatch";
    newMatch: {
        fromUserId: UserId;
        matchId: MatchId;
    };
} | {
    __kind__: "sessionRequest";
    sessionRequest: {
        fromUserId: UserId;
        sessionId: SessionId;
    };
} | {
    __kind__: "sessionCompleted";
    sessionCompleted: {
        sessionId: SessionId;
    };
} | {
    __kind__: "newMessage";
    newMessage: {
        messageId: MessageId;
        fromUserId: UserId;
    };
} | {
    __kind__: "sessionRejected";
    sessionRejected: {
        sessionId: SessionId;
    };
};
export type SkillId = bigint;
export type SessionId = bigint;
export interface SkillEntry {
    skillId: SkillId;
    name: string;
    proficiency: Proficiency;
}
export type MatchId = bigint;
export interface UserProfilePublic {
    id: UserId;
    bio: string;
    completedSessions: bigint;
    skillsOffered: Array<SkillEntry>;
    name: string;
    createdAt: Timestamp;
    trustScore: number;
    avatar?: string;
    skillsWanted: Array<SkillEntry>;
}
export type UserId = Principal;
export interface MatchResult {
    createdAt: Timestamp;
    user: UserProfilePublic;
    youOfferTheyWant: Array<SkillEntry>;
    matchId: MatchId;
    theyOfferYouWant: Array<SkillEntry>;
}
export interface Skill {
    id: SkillId;
    name: string;
}
export type NotificationId = bigint;
export type MessageId = bigint;
export type ReviewId = bigint;
export interface SessionPublic {
    id: SessionId;
    status: SessionStatus;
    topic: string;
    createdAt: Timestamp;
    receiverId: UserId;
    message?: string;
    requesterId: UserId;
    scheduledAt: Timestamp;
}
export interface Conversation {
    partnerName: string;
    lastMessage?: string;
    partnerId: UserId;
    unreadCount: bigint;
    lastTimestamp?: Timestamp;
}
export interface Review {
    id: ReviewId;
    createdAt: Timestamp;
    revieweeId: UserId;
    reviewerId: UserId;
    comment?: string;
    sessionId: SessionId;
    rating: bigint;
}
export interface SessionRequest {
    topic: string;
    receiverId: UserId;
    message?: string;
    scheduledAt: Timestamp;
}
export enum Proficiency {
    intermediate = "intermediate",
    beginner = "beginner",
    expert = "expert"
}
export enum SessionStatus {
    pending = "pending",
    completed = "completed",
    rejected = "rejected",
    confirmed = "confirmed"
}
export interface backendInterface {
    addSkill(name: string): Promise<Skill>;
    completeSession(sessionId: SessionId): Promise<SessionPublic>;
    dismissNotification(notificationId: NotificationId): Promise<void>;
    getActiveSessions(): Promise<Array<SessionPublic>>;
    getCallerUserProfile(): Promise<UserProfilePublic | null>;
    getCompletedSessions(): Promise<Array<SessionPublic>>;
    getConversations(): Promise<Array<Conversation>>;
    getDashboardStats(): Promise<{
        completedSessionsCount: bigint;
        activeSessionsCount: bigint;
        averageTrustScore: number;
    }>;
    getMatches(): Promise<Array<MatchResult>>;
    getMessages(partnerId: UserId, since: Timestamp | null): Promise<Array<MessagePublic>>;
    getNotificationBadgeCount(): Promise<bigint>;
    getNotifications(): Promise<Array<NotificationPublic>>;
    getReceivedReviews(): Promise<Array<Review>>;
    getReviewsForUser(userId: UserId): Promise<Array<Review>>;
    getUserProfile(userId: UserId): Promise<UserProfilePublic | null>;
    listSkills(): Promise<Array<Skill>>;
    markMessagesRead(partnerId: UserId): Promise<void>;
    refreshMatches(): Promise<Array<MatchResult>>;
    requestSession(input: SessionRequest): Promise<SessionPublic>;
    respondToSession(sessionId: SessionId, accept: boolean): Promise<SessionPublic>;
    saveCallerUserProfile(input: SaveProfileInput): Promise<void>;
    searchSkills(searchQuery: string): Promise<Array<Skill>>;
    sendMessage(receiverId: UserId, content: string): Promise<MessagePublic>;
    submitReview(sessionId: SessionId, rating: bigint, comment: string | null): Promise<Review>;
}
