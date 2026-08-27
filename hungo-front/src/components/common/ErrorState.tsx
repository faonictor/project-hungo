import { AlertCircle, RefreshCw, Database, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFriendlyErrorMessage } from "@/lib/api";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  title?: string;
}

export function ErrorState({
  title = "Falha ao carregar informações",
  message = "Ocorreu um erro ao comunicar com o servidor.",
  onRetry,
  className,
}: ErrorStateProps) {
  const friendlyMsg = formatFriendlyErrorMessage(message);
  const isDb =
    friendlyMsg.toLowerCase().includes("banco") ||
    friendlyMsg.toLowerCase().includes("mysql");
  const isNetwork =
    friendlyMsg.toLowerCase().includes("conexão") ||
    friendlyMsg.toLowerCase().includes("servidor") ||
    friendlyMsg.toLowerCase().includes("execução");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-destructive/20 bg-destructive/5 rounded-2xl my-4 text-foreground max-w-md mx-auto shadow-2xs",
        className
      )}
    >
      <div className="size-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mb-3">
        {isDb ? (
          <Database className="size-6" />
        ) : isNetwork ? (
          <WifiOff className="size-6" />
        ) : (
          <AlertCircle className="size-6" />
        )}
      </div>

      <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-sm">
        {friendlyMsg}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 px-4 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          <span>Tentar Novamente</span>
        </Button>
      )}
    </div>
  );
}
