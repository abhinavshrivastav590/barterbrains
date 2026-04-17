import { SkillBadge } from "@/components/ui/SkillBadge";
import { TrustScore } from "@/components/ui/TrustScore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatches, useRefreshMatches } from "@/hooks/useBackend";
import type { MatchResult } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  MessageSquare,
  RefreshCw,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({
  match,
  index,
}: {
  match: MatchResult;
  index: number;
}) {
  const navigate = useNavigate();
  const userId = match.user.id.toText();
  const initials = match.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      data-ocid={`matches.item.${index + 1}`}
    >
      <Card className="group relative overflow-hidden border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card">
        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-12 h-12 shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                {match.user.avatar && (
                  <AvatarImage src={match.user.avatar} alt={match.user.name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground font-display truncate">
                  {match.user.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                  {match.user.bio || "No bio provided."}
                </p>
              </div>
            </div>

            {/* Trust score + match quality badge */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge
                variant="secondary"
                className="text-[10px] font-medium px-2 py-0.5 bg-primary/10 text-primary border-0"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Match
              </Badge>
              <TrustScore score={match.user.trustScore} compact />
            </div>
          </div>

          {/* Skills they offer that I want (teal) */}
          {match.theyOfferYouWant.length > 0 && (
            <div className="mb-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                They offer — you want
              </p>
              <div className="flex flex-wrap gap-1.5">
                {match.theyOfferYouWant.map((skill) => (
                  <span
                    key={`they-offer-${skill.skillId}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills I offer that they want (amber) */}
          {match.youOfferTheyWant.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                You offer — they want
              </p>
              <div className="flex flex-wrap gap-1.5">
                {match.youOfferTheyWant.map((skill) => (
                  <span
                    key={`you-offer-${skill.skillId}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 text-xs gap-1.5"
              onClick={() => navigate({ to: `/messages?userId=${userId}` })}
              data-ocid={`matches.chat_button.${index + 1}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 text-xs gap-1.5"
              onClick={() => navigate({ to: `/sessions?userId=${userId}` })}
              data-ocid={`matches.book_button.${index + 1}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Book Session
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="px-2.5"
              onClick={() => navigate({ to: `/profile?userId=${userId}` })}
              data-ocid={`matches.view_profile_button.${index + 1}`}
              aria-label={`View profile of ${match.user.name}`}
            >
              <User className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function MatchCardSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="w-14 h-5 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      data-ocid="matches.empty_state"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Users className="w-9 h-9 text-primary" />
      </div>
      <h2 className="text-xl font-display font-bold text-foreground mb-2">
        No matches yet
      </h2>
      <p className="text-muted-foreground max-w-sm leading-relaxed mb-6">
        Add more skills you want to learn and skills you can teach to your
        profile — we'll find people who complement you perfectly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          data-ocid="matches.empty.go_to_profile_button"
        >
          Update My Skills
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          data-ocid="matches.empty.refresh_button"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Searching..." : "Try Again"}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const { data: matches, isLoading } = useMatches();
  const refreshMutation = useRefreshMatches();

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: (data) => {
        const count = Array.isArray(data) ? data.length : 0;
        toast.success(
          count > 0
            ? `Found ${count} match${count === 1 ? "" : "es"}!`
            : "No new matches found. Try adding more skills.",
        );
      },
      onError: () => toast.error("Failed to refresh matches. Try again."),
    });
  };

  const matchList: MatchResult[] = Array.isArray(matches) ? matches : [];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-display font-bold text-foreground"
          >
            My Matches
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            {isLoading
              ? "Finding your skill exchange partners…"
              : matchList.length > 0
                ? `${matchList.length} complementary match${matchList.length === 1 ? "" : "es"} found`
                : "People whose skills complement yours"}
          </motion.p>
        </div>

        <Button
          type="button"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
          className="shrink-0 gap-2"
          data-ocid="matches.refresh_button"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
          />
          {refreshMutation.isPending ? "Refreshing…" : "Refresh Matches"}
        </Button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2"
          data-ocid="matches.loading_state"
        >
          {(["s1", "s2", "s3", "s4"] as const).map((k) => (
            <MatchCardSkeleton key={k} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && matchList.length === 0 && (
        <EmptyState
          onRefresh={handleRefresh}
          isRefreshing={refreshMutation.isPending}
        />
      )}

      {/* Match grid */}
      {!isLoading && matchList.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {matchList.map((match, i) => (
            <MatchCard key={match.matchId.toString()} match={match} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
