import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusToneMap: Record<string, string> = {
  aberto: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 font-semibold",
  "em preparo": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 font-semibold",
  concluído: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  concluido: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  entregue: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  pago: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  cancelado: "bg-destructive/10 text-destructive border-destructive/25 font-semibold",
};

interface OrderStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function OrderStatusBadge({ status = "Aberto", className }: OrderStatusBadgeProps) {
  const normalizedKey = (status || "Aberto").toLowerCase().trim();
  const toneClass = statusToneMap[normalizedKey] || statusToneMap["aberto"];

  return (
    <Badge
      variant="outline"
      className={cn("whitespace-nowrap text-xs", toneClass, className)}
    >
      {status || "Aberto"}
    </Badge>
  );
}
