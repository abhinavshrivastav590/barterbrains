import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  NotificationId,
  SaveProfileInput,
  SessionId,
  SessionRequest,
  Timestamp,
  UserId,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(userId: UserId | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["userProfile", userId?.toText()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSaveProfile() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveProfileInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myProfile"] }),
  });
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export function useSkills() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSkills();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchSkills(query: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["searchSkills", query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchSkills(query);
    },
    enabled: !!actor && !isFetching && query.trim().length > 0,
  });
}

export function useAddSkill() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSkill(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export function useMatches() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRefreshMatches() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.refreshMatches();
    },
    onSuccess: (data) => qc.setQueryData(["matches"], data),
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function useConversations() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useMessages(
  partnerId: UserId | null,
  since: Timestamp | null = null,
) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["messages", partnerId?.toText()],
    queryFn: async () => {
      if (!actor || !partnerId) return [];
      return actor.getMessages(partnerId, since);
    },
    enabled: !!actor && !isFetching && !!partnerId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      receiverId,
      content,
    }: { receiverId: UserId; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(receiverId, content);
    },
    onSuccess: (_, { receiverId }) => {
      qc.invalidateQueries({ queryKey: ["messages", receiverId.toText()] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkMessagesRead() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partnerId: UserId) => {
      if (!actor) throw new Error("Not connected");
      return actor.markMessagesRead(partnerId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export function useActiveSessions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCompletedSessions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["completedSessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestSession() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SessionRequest) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestSession(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeSessions"] }),
  });
}

export function useRespondToSession() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      accept,
    }: { sessionId: SessionId; accept: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.respondToSession(sessionId, accept);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeSessions"] }),
  });
}

export function useCompleteSession() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: SessionId) => {
      if (!actor) throw new Error("Not connected");
      return actor.completeSession(sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeSessions"] });
      qc.invalidateQueries({ queryKey: ["completedSessions"] });
    },
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useReceivedReviews() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["receivedReviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReceivedReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReviewsForUser(userId: UserId | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["reviewsForUser", userId?.toText()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getReviewsForUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSubmitReview() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      rating,
      comment,
    }: {
      sessionId: SessionId;
      rating: bigint;
      comment: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitReview(sessionId, rating, comment);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivedReviews"] });
      qc.invalidateQueries({ queryKey: ["completedSessions"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}
