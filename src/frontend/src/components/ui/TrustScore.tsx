import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface TrustScoreProps {
  score: number;
  compact?: boolean;
  className?: string;
}

export function TrustScore({
  score,
  compact = false,
  className,
}: TrustScoreProps) {
  const stars = Math.round(score * 5) / 5; // Round to nearest 0.2
  const fullStars = Math.floor(stars);
  const hasPartial = stars - fullStars >= 0.5;

  if (compact) {
    return (
      <span className={cn("trust-badge text-accent", className)}>
        <Star className="w-3.5 h-3.5 fill-current" />
        <span className="font-semibold">{score.toFixed(1)}</span>
      </span>
    );
  }

  return (
    <div className={cn("trust-badge", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => i).map((i) => (
          <Star
            key={`star-${i}`}
            className={cn(
              "w-3.5 h-3.5",
              i < fullStars
                ? "fill-accent text-accent"
                : i === fullStars && hasPartial
                  ? "fill-accent/50 text-accent"
                  : "fill-muted text-muted-foreground",
            )}
          />
        ))}
      </div>
      <span className="text-muted-foreground font-normal ml-1">
        {score.toFixed(1)}
      </span>
    </div>
  );
}
