import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { NotificationId } from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useNotifications() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useNotificationBadgeCount() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["notificationBadgeCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getNotificationBadgeCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useDismissNotification() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: NotificationId) => {
      if (!actor) throw new Error("Not connected");
      return actor.dismissNotification(notificationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notificationBadgeCount"] });
    },
  });
}
