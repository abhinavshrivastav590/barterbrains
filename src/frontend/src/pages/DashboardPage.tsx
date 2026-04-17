import { TrustScore } from "@/components/ui/TrustScore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useActiveSessions,
  useCompleteSession,
  useCompletedSessions,
  useDashboardStats,
  useMyProfile,
  useReceivedReviews,
  useRespondToSession,
  useSubmitReview,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { SessionStatus } from "@/types";
import type { Review, SessionId, SessionPublic } from "@/types";
import {
  ActivityIcon,
  CalendarCheck2,
  CheckCircle2,
  MessageCircleIcon,
  Star,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatDateShort(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const variants: Record<SessionStatus, { label: string; className: string }> =
    {
      [SessionStatus.pending]: {
        label: "Pending",
        className: "session-state-pending border",
      },
      [SessionStatus.confirmed]: {
        label: "Confirmed",
        className: "session-state-active border",
      },
      [SessionStatus.completed]: {
        label: "Completed",
        className: "session-state-completed border",
      },
      [SessionStatus.rejected]: {
        label: "Rejected",
        className:
          "bg-destructive/10 border-destructive/30 text-destructive border",
      },
    };
  const v = variants[status] ?? variants[SessionStatus.pending];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        v.className,
      )}
    >
      {v.label}
    </span>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn("relative overflow-hidden", accent && "border-primary/30")}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-display font-bold text-foreground">
                {value}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              accent
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Rating Modal ─────────────────────────────────────────────────────────────

function RatingModal({
  open,
  onClose,
  session,
}: {
  open: boolean;
  onClose: () => void;
  session: SessionPublic | null;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const submitReview = useSubmitReview();

  function handleClose() {
    setRating(0);
    setHovered(0);
    setComment("");
    onClose();
  }

  async function handleSubmit() {
    if (!session || rating === 0) return;
    try {
      await submitReview.mutateAsync({
        sessionId: session.id,
        rating: BigInt(rating),
        comment: comment.trim() || null,
      });
      toast.success("Review submitted!");
      handleClose();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md" data-ocid="rating.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Rate this session</DialogTitle>
        </DialogHeader>
        {session && (
          <div className="space-y-5 pt-1">
            <p className="text-sm text-muted-foreground">
              How was your{" "}
              <span className="font-semibold text-foreground">
                {session.topic}
              </span>{" "}
              session?
            </p>

            {/* Star selector */}
            <fieldset
              className="flex items-center gap-1.5 border-0 p-0 m-0"
              data-ocid="rating.star_selector"
              aria-label="Select a rating from 1 to 5 stars"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={`star-btn-${n}`}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 rounded transition-smooth focus-visible:outline-2 focus-visible:outline-primary"
                  data-ocid={`rating.star.${n}`}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hovered || rating) >= n
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted-foreground",
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-muted-foreground ml-1">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </span>
              )}
            </fieldset>

            {/* Comment */}
            <div className="space-y-1.5">
              <label
                htmlFor="review-comment"
                className="text-sm font-medium text-foreground"
              >
                Comment{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                id="review-comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none"
                data-ocid="rating.comment.textarea"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-ocid="rating.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={rating === 0 || submitReview.isPending}
                onClick={handleSubmit}
                data-ocid="rating.submit_button"
              >
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Active Session Card ──────────────────────────────────────────────────────

function ActiveSessionCard({
  session,
  index,
}: {
  session: SessionPublic;
  index: number;
}) {
  const respondMutation = useRespondToSession();
  const completeMutation = useCompleteSession();

  async function handleRespond(accept: boolean) {
    try {
      await respondMutation.mutateAsync({ sessionId: session.id, accept });
      toast.success(accept ? "Session accepted!" : "Session declined.");
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  async function handleComplete() {
    try {
      await completeMutation.mutateAsync(session.id);
      toast.success("Session marked as complete!");
    } catch {
      toast.error("Failed to complete session.");
    }
  }

  const isPending = session.status === SessionStatus.pending;
  const isConfirmed = session.status === SessionStatus.confirmed;
  const isLoading = respondMutation.isPending || completeMutation.isPending;

  return (
    <Card
      className="match-card"
      data-ocid={`active_sessions.item.${index + 1}`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={session.status} />
            </div>
            <h3 className="font-display font-semibold text-foreground truncate">
              {session.topic}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarCheck2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatDate(session.scheduledAt)}</span>
            </div>
            {session.message && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                <MessageCircleIcon className="w-3 h-3 inline mr-1" />
                {session.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {isPending && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond(false)}
                  disabled={isLoading}
                  className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  data-ocid={`active_sessions.reject_button.${index + 1}`}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleRespond(true)}
                  disabled={isLoading}
                  data-ocid={`active_sessions.accept_button.${index + 1}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Accept
                </Button>
              </>
            )}
            {isConfirmed && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleComplete}
                disabled={isLoading}
                className="border-primary/40 text-primary hover:bg-primary/10"
                data-ocid={`active_sessions.complete_button.${index + 1}`}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                {completeMutation.isPending ? "Completing..." : "Mark Complete"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Completed Session Card ───────────────────────────────────────────────────

function CompletedSessionCard({
  session,
  hasRated,
  onRate,
  index,
}: {
  session: SessionPublic;
  hasRated: boolean;
  onRate: (session: SessionPublic) => void;
  index: number;
}) {
  return (
    <Card
      className="match-card opacity-90"
      data-ocid={`completed_sessions.item.${index + 1}`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-display font-semibold text-foreground truncate">
              {session.topic}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarCheck2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatDateShort(session.scheduledAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasRated ? (
              <Badge
                variant="secondary"
                className="text-xs"
                data-ocid={`completed_sessions.rated_badge.${index + 1}`}
              >
                <Star className="w-3 h-3 mr-1 fill-current text-accent" />
                Rated
              </Badge>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onRate(session)}
                className="border-accent/40 text-accent-foreground hover:bg-accent/10"
                data-ocid={`completed_sessions.rate_button.${index + 1}`}
              >
                <Star className="w-3.5 h-3.5 mr-1" />
                Rate Session
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <Card
      className="match-card"
      data-ocid={`received_reviews.item.${index + 1}`}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {review.reviewerId.toText().slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                {review.reviewerId.toText().slice(0, 12)}…
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateShort(review.createdAt)}
              </p>
            </div>
          </div>
          <TrustScore score={Number(review.rating) / 5} compact />
        </div>
        {review.comment && (
          <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-3">
            "{review.comment}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section Heading ─────────────────────────────────────────────────────────

function SectionHeading({
  title,
  count,
  icon: Icon,
}: {
  title: string;
  count?: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-base font-display font-semibold text-foreground">
        {title}
      </h2>
      {count !== undefined && (
        <Badge variant="secondary" className="text-xs ml-1">
          {count}
        </Badge>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  message,
  ocid,
}: {
  message: string;
  ocid: string;
}) {
  return (
    <div
      className="flex items-center justify-center py-10 border border-dashed border-border rounded-xl bg-muted/30 text-sm text-muted-foreground"
      data-ocid={ocid}
    >
      {message}
    </div>
  );
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card className="match-card">
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activeSessions = [], isLoading: activeLoading } =
    useActiveSessions();
  const { data: completedSessions = [], isLoading: completedLoading } =
    useCompletedSessions();
  const { data: receivedReviews = [], isLoading: reviewsLoading } =
    useReceivedReviews();
  const { data: profile } = useMyProfile();

  const [ratingSession, setRatingSession] = useState<SessionPublic | null>(
    null,
  );

  // Build a set of session IDs that have been reviewed (by current user)
  const ratedSessionIds = new Set<string>(
    receivedReviews
      .filter((r) => profile && r.reviewerId.toText() === profile.id.toText())
      .map((r) => r.sessionId.toString()),
  );

  // Filter active sessions — exclude rejected ones from the "active" list
  const shownActiveSessions = activeSessions.filter(
    (s) => s.status !== SessionStatus.rejected,
  );

  return (
    <div className="min-h-full flex flex-col" data-ocid="dashboard.page">
      {/* Page header */}
      <div className="bg-card border-b border-border px-6 py-5 md:px-8">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {profile
            ? `Welcome back, ${profile.name.split(" ")[0]}!`
            : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your skill exchange activity at a glance
        </p>
      </div>

      <div className="flex-1 px-6 py-6 md:px-8 space-y-8 bg-background">
        {/* ── Summary Cards ─────────────────────────────────────── */}
        <section data-ocid="dashboard.stats.section">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Active Sessions"
              value={stats ? Number(stats.activeSessionsCount) : 0}
              icon={ActivityIcon}
              loading={statsLoading}
              accent
            />
            <StatCard
              label="Completed Sessions"
              value={stats ? Number(stats.completedSessionsCount) : 0}
              icon={CalendarCheck2}
              loading={statsLoading}
            />
            <StatCard
              label="Avg. Trust Score"
              value={
                stats
                  ? stats.averageTrustScore > 0
                    ? `${(stats.averageTrustScore * 5).toFixed(1)} / 5`
                    : "—"
                  : "—"
              }
              icon={Star}
              loading={statsLoading}
            />
          </div>
        </section>

        {/* ── Active Sessions ────────────────────────────────────── */}
        <section data-ocid="active_sessions.section">
          <SectionHeading
            title="Active Sessions"
            count={shownActiveSessions.length}
            icon={ActivityIcon}
          />
          {activeLoading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : shownActiveSessions.length === 0 ? (
            <EmptyState
              message="No active sessions. Accept a match to get started!"
              ocid="active_sessions.empty_state"
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {shownActiveSessions.map((session, i) => (
                <ActiveSessionCard
                  key={session.id.toString()}
                  session={session}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Completed Sessions ─────────────────────────────────── */}
        <section
          className="bg-muted/30 -mx-6 md:-mx-8 px-6 md:px-8 py-6 rounded-none border-y border-border"
          data-ocid="completed_sessions.section"
        >
          <SectionHeading
            title="Completed Sessions"
            count={completedSessions.length}
            icon={CheckCircle2}
          />
          {completedLoading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : completedSessions.length === 0 ? (
            <EmptyState
              message="No completed sessions yet."
              ocid="completed_sessions.empty_state"
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {completedSessions.map((session, i) => (
                <CompletedSessionCard
                  key={session.id.toString()}
                  session={session}
                  index={i}
                  hasRated={ratedSessionIds.has(session.id.toString())}
                  onRate={setRatingSession}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Received Ratings ────────────────────────────────────── */}
        <section data-ocid="received_reviews.section">
          <SectionHeading
            title="Ratings Received"
            count={receivedReviews.length}
            icon={Star}
          />
          {reviewsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : receivedReviews.length === 0 ? (
            <EmptyState
              message="No ratings received yet — complete sessions to earn reviews."
              ocid="received_reviews.empty_state"
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {receivedReviews.map((review, i) => (
                <ReviewCard
                  key={review.id.toString()}
                  review={review}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Rating Modal */}
      <RatingModal
        open={ratingSession !== null}
        onClose={() => setRatingSession(null)}
        session={ratingSession}
      />
    </div>
  );
}
