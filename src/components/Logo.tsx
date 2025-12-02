import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const textClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-md",
          sizeClasses[size]
        )}
      >
        <Scissors className={cn(size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground", textClasses[size])}>
          Agende<span className="text-primary">Corte</span>
        </span>
      )}
    </div>
  );
}
