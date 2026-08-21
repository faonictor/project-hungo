import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Carregando dados...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex h-48 items-center justify-center text-sm text-muted-foreground",
        className
      )}
    >
      <Loader2 className="size-5 animate-spin mr-2" />
      <span>{message}</span>
    </div>
  );
}
