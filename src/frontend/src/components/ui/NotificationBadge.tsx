import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number | bigint;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  const num = typeof count === "bigint" ? Number(count) : count;
  if (num <= 0) return null;

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full",
        "bg-destructive text-destructive-foreground text-[10px] font-bold",
        "flex items-center justify-center leading-none",
        className,
      )}
      aria-label={`${num} notifications`}
    >
      {num > 99 ? "99+" : num}
    </span>
  );
}
