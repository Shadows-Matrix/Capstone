import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex" aria-label={`Rated ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          if (rounded >= i) return <Star key={i} className="size-4 fill-amber-400 text-amber-400" />;
          if (rounded >= i - 0.5) return <StarHalf key={i} className="size-4 fill-amber-400 text-amber-400" />;
          return <Star key={i} className="size-4 text-muted-foreground/40" />;
        })}
      </span>
      <span className="text-sm text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : "New"}
        {count !== undefined && count > 0 ? ` (${count})` : ""}
      </span>
    </span>
  );
}
