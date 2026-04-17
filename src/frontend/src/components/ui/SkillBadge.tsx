import { cn } from "@/lib/utils";
import type { Proficiency } from "@/types";

type SkillBadgeVariant = "offered" | "wanted" | "neutral";

interface SkillBadgeProps {
  name: string;
  proficiency?: Proficiency;
  variant?: SkillBadgeVariant;
  className?: string;
}

const proficiencyLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

export function SkillBadge({
  name,
  proficiency,
  variant = "neutral",
  className,
}: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
        variant === "offered" && "bg-secondary text-secondary-foreground",
        variant === "wanted" &&
          "bg-accent/20 text-accent-foreground border border-accent/30",
        variant === "neutral" && "bg-muted text-muted-foreground",
        className,
      )}
      title={proficiency ? proficiencyLabel[proficiency] : undefined}
    >
      {name}
      {proficiency && (
        <span className="opacity-60 text-[10px] uppercase tracking-wide">
          {proficiency.charAt(0)}
        </span>
      )}
    </span>
  );
}
