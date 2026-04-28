import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, max = 5, size = "sm" }: { rating: number; max?: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(sizeClass, i < Math.floor(rating) ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
      <span className={cn("ml-1 font-medium", size === "sm" ? "text-xs" : "text-sm")}>{rating.toFixed(1)}</span>
    </div>
  );
}
