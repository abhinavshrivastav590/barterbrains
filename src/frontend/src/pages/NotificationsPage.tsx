import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDismissNotification,
  useNotifications,
} from "@/hooks/useNotifications";
import type { NotificationKind, NotificationPublic } from "@/types";
import {
  Bell,
  BellOff,
  CalendarCheck2,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Kind Config ─────────────────────────────────────────────────────────────

type KindMeta = {
  icon: React.ElementType;
  label: string;
  description: string;
  colorClass: string;
};

function getKindMeta(kind: NotificationKind): KindMeta {
  switch (kind.__kind__) {
    case "newMatch":
      return {
        icon: Sparkles,
        label: "New Match",
        description: "You have a new skill match! Check your matches page.",
        colorClass: "bg-primary/15 text-primary",
      };
    case "newMessage":
      return {
        icon: MessageCircle,
        label: "New Message",
        description: "You received a new message.",
        colorClass: "bg-accent/20 text-accent-foreground",
      };
    case "sessionRequest":
      return {
        icon: CalendarCheck2,
        label: "Session Request",
        description: "Someone sent you a session request.",
        colorClass: "bg-secondary/40 text-secondary-foreground",
      };
    case "sessionAccepted":
      return {
        icon: UserCheck,
        label: "Session Accepted",
        description: "Your session request was accepted.",
        colorClass: "bg-primary/15 text-primary",
      };
    case "sessionRejected":
      return {
        icon: XCircle,
        label: "Session Declined",
        description: "Your session request was declined.",
        colorClass: "bg-destructive/10 text-destructive",
      };
    case "sessionCompleted":
      return {
        icon: CheckCircle2,
        label: "Session Completed",
        description: "A session has been marked as complete.",
        colorClass: "bg-primary/15 text-primary",
      };
    default:
      return {
        icon: Bell,
        label: "Notification",
        description: "You have a new notification.",
        colorClass: "bg-muted text-muted-foreground",
      };
  }
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  index,
}: {
  notification: NotificationPublic;
  index: number;
}) {
  const dismiss = useDismissNotification();
  const meta = getKindMeta(notification.kind);
  const Icon = meta.icon;

  async function handleDismiss() {
    try {
      await dismiss.mutateAsync(notification.id);
    } catch {
      toast.error("Failed to dismiss notification.");
    }
  }

  return (
    <Card
      className={`match-card transition-smooth ${notification.dismissed ? "opacity-60" : ""}`}
      data-ocid={`notifications.item.${index + 1}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${meta.colorClass}`}
          >
            <Icon className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">
                {meta.label}
              </span>
              {!notification.dismissed && (
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0 h-4 bg-primary/15 text-primary border-primary/20"
                  data-ocid={`notifications.unread_badge.${index + 1}`}
                >
                  New
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-snug">
              {meta.description}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {formatRelative(notification.createdAt)}
            </p>
          </div>

          {/* Dismiss */}
          {!notification.dismissed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0 w-7 h-7 text-muted-foreground hover:text-foreground rounded-lg"
              onClick={handleDismiss}
              disabled={dismiss.isPending}
              aria-label="Dismiss notification"
              data-ocid={`notifications.dismiss_button.${index + 1}`}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <Card className="match-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.dismissed).length;

  return (
    <div className="min-h-full flex flex-col" data-ocid="notifications.page">
      {/* Page header */}
      <div className="bg-card border-b border-border px-6 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Badge
              className="bg-primary text-primary-foreground"
              data-ocid="notifications.unread_count_badge"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Stay up to date with your skill exchange activity
        </p>
      </div>

      <div className="flex-1 px-6 py-6 md:px-8 bg-background">
        {isLoading ? (
          <div className="space-y-3 max-w-2xl">
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4 text-center max-w-sm mx-auto"
            data-ocid="notifications.empty_state"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <BellOff className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="font-display font-semibold text-foreground">
                All caught up!
              </p>
              <p className="text-sm text-muted-foreground">
                No notifications yet. When you match with someone, receive
                messages, or get session updates, they'll appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 max-w-2xl" data-ocid="notifications.list">
            {notifications.map((notification, i) => (
              <NotificationRow
                key={notification.id.toString()}
                notification={notification}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
