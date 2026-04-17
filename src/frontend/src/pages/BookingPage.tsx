import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useActiveSessions,
  useCompleteSession,
  useMyProfile,
  useRequestSession,
  useRespondToSession,
  useUserProfile,
} from "@/hooks/useBackend";
import type { SessionPublic, UserId } from "@/types";
import { SessionStatus } from "@/types";
import { Principal } from "@icp-sdk/core/principal";
import { useSearch } from "@tanstack/react-router";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

function isSessionPast(scheduledAt: bigint): boolean {
  const ms = Number(scheduledAt / 1_000_000n);
  return Date.now() > ms;
}

function statusVariant(
  status: SessionStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === SessionStatus.confirmed) return "default";
  if (status === SessionStatus.rejected) return "destructive";
  if (status === SessionStatus.completed) return "secondary";
  return "outline";
}

function statusLabel(status: SessionStatus): string {
  if (status === SessionStatus.confirmed) return "Confirmed";
  if (status === SessionStatus.rejected) return "Rejected";
  if (status === SessionStatus.completed) return "Completed";
  return "Pending";
}

// ─── Session Card — Incoming Request ─────────────────────────────────────────

function IncomingCard({
  session,
  index,
}: { session: SessionPublic; index: number }) {
  const respond = useRespondToSession();
  const { data: requester } = useUserProfile(session.requesterId);

  const accept = () => {
    respond.mutate(
      { sessionId: session.id, accept: true },
      {
        onSuccess: () => toast.success("Session accepted!"),
        onError: () => toast.error("Failed to respond"),
      },
    );
  };

  const reject = () => {
    respond.mutate(
      { sessionId: session.id, accept: false },
      {
        onSuccess: () => toast.success("Session rejected."),
        onError: () => toast.error("Failed to respond"),
      },
    );
  };

  return (
    <Card
      data-ocid={`booking.incoming_request.item.${index}`}
      className="border border-border bg-card hover:shadow-md transition-shadow duration-200"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {requester?.name ?? "Loading…"}
              </p>
              <p className="text-sm text-muted-foreground">wants to exchange</p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{session.topic}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{formatTimestamp(session.scheduledAt)}</span>
        </div>
        {session.message && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 italic line-clamp-2">
            "{session.message}"
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            className="flex-1"
            onClick={accept}
            disabled={respond.isPending}
            data-ocid={`booking.incoming_request.accept_button.${index}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={reject}
            disabled={respond.isPending}
            data-ocid={`booking.incoming_request.reject_button.${index}`}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Session Card — My Requests ───────────────────────────────────────────────

function MyRequestCard({
  session,
  index,
}: { session: SessionPublic; index: number }) {
  const respond = useRespondToSession();
  const { data: receiver } = useUserProfile(session.receiverId);

  const cancel = () => {
    respond.mutate(
      { sessionId: session.id, accept: false },
      {
        onSuccess: () => toast.success("Request cancelled."),
        onError: () => toast.error("Failed to cancel"),
      },
    );
  };

  return (
    <Card
      data-ocid={`booking.my_request.item.${index}`}
      className="border border-border bg-card hover:shadow-md transition-shadow duration-200"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {receiver?.name ?? "Loading…"}
              </p>
              <p className="text-sm text-muted-foreground">requested session</p>
            </div>
          </div>
          <Badge
            variant={statusVariant(session.status)}
            className="shrink-0 text-xs"
            data-ocid={`booking.my_request.status_badge.${index}`}
          >
            {statusLabel(session.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{session.topic}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{formatTimestamp(session.scheduledAt)}</span>
        </div>
        {session.message && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 italic line-clamp-2">
            "{session.message}"
          </p>
        )}
        {session.status === SessionStatus.pending && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={cancel}
            disabled={respond.isPending}
            data-ocid={`booking.my_request.cancel_button.${index}`}
          >
            Cancel Request
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Session Card — Active Sessions ──────────────────────────────────────────

function ActiveSessionCard({
  session,
  myId,
  index,
}: { session: SessionPublic; myId: string; index: number }) {
  const complete = useCompleteSession();
  const partnerId =
    session.requesterId.toText() === myId
      ? session.receiverId
      : session.requesterId;
  const { data: partner } = useUserProfile(partnerId);
  const past = isSessionPast(session.scheduledAt);

  const markComplete = () => {
    complete.mutate(session.id, {
      onSuccess: () => toast.success("Session marked as completed!"),
      onError: () => toast.error("Failed to complete session"),
    });
  };

  return (
    <Card
      data-ocid={`booking.active_session.item.${index}`}
      className="border border-border bg-card hover:shadow-md transition-shadow duration-200"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {partner?.name ?? "Loading…"}
              </p>
              <p className="text-sm text-muted-foreground">confirmed session</p>
            </div>
          </div>
          <Badge
            variant="default"
            className="shrink-0 text-xs bg-primary/15 text-primary border-primary/30"
          >
            Confirmed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{session.topic}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{formatTimestamp(session.scheduledAt)}</span>
        </div>
        {!past && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Mark Complete available after session time</span>
          </div>
        )}
        {past && (
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={markComplete}
            disabled={complete.isPending}
            data-ocid={`booking.active_session.complete_button.${index}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Mark Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Send Session Request Modal ───────────────────────────────────────────────

function RequestSessionModal({
  open,
  onClose,
  defaultReceiverId,
}: {
  open: boolean;
  onClose: () => void;
  defaultReceiverId?: string;
}) {
  const requestSession = useRequestSession();
  const { data: receiver } = useUserProfile(
    defaultReceiverId
      ? (Principal.fromText(defaultReceiverId) as UserId)
      : null,
  );

  const [topic, setTopic] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [message, setMessage] = useState("");
  const [topicError, setTopicError] = useState("");
  const [dateError, setDateError] = useState("");

  // Reset form on open
  useEffect(() => {
    if (open) {
      setTopic("");
      setDateTime("");
      setMessage("");
      setTopicError("");
      setDateError("");
    }
  }, [open]);

  const minDateTime = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  }, []);

  const validate = () => {
    let valid = true;
    if (!topic.trim()) {
      setTopicError("Topic is required");
      valid = false;
    } else {
      setTopicError("");
    }
    if (!dateTime) {
      setDateError("Please choose a date and time");
      valid = false;
    } else if (new Date(dateTime).getTime() <= Date.now()) {
      setDateError("Session must be scheduled in the future");
      valid = false;
    } else {
      setDateError("");
    }
    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (!defaultReceiverId) return;

    const scheduledMs = new Date(dateTime).getTime();
    const scheduledAt = BigInt(scheduledMs) * 1_000_000n;

    requestSession.mutate(
      {
        topic: topic.trim(),
        receiverId: Principal.fromText(defaultReceiverId) as UserId,
        message: message.trim() || undefined,
        scheduledAt,
      },
      {
        onSuccess: () => {
          toast.success("Session request sent!");
          onClose();
        },
        onError: () => toast.error("Failed to send request"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="booking.request_session.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Request a Session
          </DialogTitle>
        </DialogHeader>
        {receiver && (
          <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-3 py-2 -mt-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {receiver.name}
              </p>
              <p className="text-xs text-muted-foreground">Partner</p>
            </div>
          </div>
        )}
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-sm font-medium">
              Topic
            </Label>
            <Input
              id="topic"
              placeholder="e.g., Introduction to React hooks"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onBlur={validate}
              data-ocid="booking.request_session.topic_input"
            />
            {topicError && (
              <p
                className="text-xs text-destructive"
                data-ocid="booking.request_session.topic_field_error"
              >
                {topicError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="datetime" className="text-sm font-medium">
              Date &amp; Time
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              min={minDateTime}
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              onBlur={validate}
              data-ocid="booking.request_session.datetime_input"
            />
            {dateError && (
              <p
                className="text-xs text-destructive"
                data-ocid="booking.request_session.date_field_error"
              >
                {dateError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm font-medium">
              Message{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="message"
              placeholder="Add a note about what you'd like to cover…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              data-ocid="booking.request_session.message_textarea"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="booking.request_session.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={requestSession.isPending || !defaultReceiverId}
              data-ocid="booking.request_session.submit_button"
            >
              <Send className="w-4 h-4 mr-1" />
              {requestSession.isPending ? "Sending…" : "Send Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  description,
  ocid,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  ocid: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-ocid={ocid}
    >
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}

// ─── Skeleton List ────────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-full mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const { data: sessions, isLoading } = useActiveSessions();
  const { data: myProfile } = useMyProfile();
  const myId = myProfile?.id?.toText() ?? "";

  // Read userId query param to auto-open modal
  const search = useSearch({ strict: false }) as { userId?: string };
  const [modalOpen, setModalOpen] = useState(!!search.userId);
  const [modalReceiverId, setModalReceiverId] = useState<string | undefined>(
    search.userId,
  );

  const openModal = (receiverId?: string) => {
    setModalReceiverId(receiverId);
    setModalOpen(true);
  };

  // Partition sessions by role and status
  const incoming = useMemo(
    () =>
      (sessions ?? []).filter(
        (s) =>
          s.status === SessionStatus.pending && s.receiverId.toText() === myId,
      ),
    [sessions, myId],
  );

  const myRequests = useMemo(
    () => (sessions ?? []).filter((s) => s.requesterId.toText() === myId),
    [sessions, myId],
  );

  const activeSessions = useMemo(
    () => (sessions ?? []).filter((s) => s.status === SessionStatus.confirmed),
    [sessions],
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto" data-ocid="booking.page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Session Booking
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your skill exchange sessions
          </p>
        </div>
        <Button
          type="button"
          onClick={() => openModal()}
          data-ocid="booking.open_modal_button"
          className="shrink-0"
        >
          <CalendarClock className="w-4 h-4 mr-2" />
          Book a Session
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incoming" data-ocid="booking.tabs">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger
            value="incoming"
            data-ocid="booking.incoming_tab"
            className="flex-1 sm:flex-none gap-1.5"
          >
            Incoming Requests
            {incoming.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                {incoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="my-requests"
            data-ocid="booking.my_requests_tab"
            className="flex-1 sm:flex-none"
          >
            My Requests
          </TabsTrigger>
          <TabsTrigger
            value="active"
            data-ocid="booking.active_tab"
            className="flex-1 sm:flex-none"
          >
            Active Sessions
          </TabsTrigger>
        </TabsList>

        {/* Incoming Requests */}
        <TabsContent value="incoming" className="mt-0">
          {isLoading ? (
            <SkeletonCards />
          ) : incoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No incoming requests"
              description="When others send you session requests, they'll appear here for you to accept or reject."
              ocid="booking.incoming_empty_state"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incoming.map((session, i) => (
                <IncomingCard
                  key={session.id.toString()}
                  session={session}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Requests */}
        <TabsContent value="my-requests" className="mt-0">
          {isLoading ? (
            <SkeletonCards />
          ) : myRequests.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No sent requests"
              description="Start by booking a session with one of your matches. Your requests will show up here."
              ocid="booking.my_requests_empty_state"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myRequests.map((session, i) => (
                <MyRequestCard
                  key={session.id.toString()}
                  session={session}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="active" className="mt-0">
          {isLoading ? (
            <SkeletonCards />
          ) : activeSessions.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No active sessions"
              description="Confirmed sessions will appear here. Accept an incoming request or get one of yours confirmed."
              ocid="booking.active_empty_state"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session, i) => (
                <ActiveSessionCard
                  key={session.id.toString()}
                  session={session}
                  myId={myId}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Session Modal */}
      <RequestSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultReceiverId={modalReceiverId}
      />
    </div>
  );
}
