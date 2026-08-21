import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Ocorreu um erro ao carregar os dados.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex h-48 flex-col items-center justify-center text-center p-4 text-destructive",
        className
      )}
    >
      <AlertCircle className="size-7 mb-2 text-destructive" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          Tentar Novamente
        </Button>
      )}
    </div>
  );
}
