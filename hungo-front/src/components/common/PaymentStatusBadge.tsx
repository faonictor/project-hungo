import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status?: "pago" | "pendente" | "cancelado" | "parcial" | "encerrada" | string;
  className?: string;
}

export function PaymentStatusBadge({ status = "pendente", className }: PaymentStatusBadgeProps) {
  const norm = status.toLowerCase();

  if (norm === "pago" || norm === "encerrada" || norm === "concluido" || norm === "concluído") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold whitespace-nowrap text-xs",
          className
        )}
      >
        {norm === "encerrada" ? "Encerrada" : "Pago"}
      </Badge>
    );
  }

  if (norm === "cancelado" || norm === "cancelada") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-destructive/15 text-destructive border-destructive/30 font-semibold whitespace-nowrap text-xs",
          className
        )}
      >
        Cancelado
      </Badge>
    );
  }

  if (norm === "parcial") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold whitespace-nowrap text-xs",
          className
        )}
      >
        Parcial
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold whitespace-nowrap text-xs",
        className
      )}
    >
      Pendente
    </Badge>
  );
}
