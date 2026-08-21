import { Utensils, ShoppingBag, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TipoAtendimento = "LOCAL" | "SALAO" | "RETIRADA" | "BALCAO" | "DELIVERY" | string;

interface ChannelBadgeProps {
  tipo?: TipoAtendimento;
  mesaNome?: string | null;
  className?: string;
}

export function ChannelBadge({ tipo = "LOCAL", mesaNome, className }: ChannelBadgeProps) {
  const normalized = (tipo || "LOCAL").toUpperCase();
  const isDelivery = normalized === "DELIVERY" || normalized === "ENTREGA";
  const isRetirada = normalized === "RETIRADA" || normalized === "BALCAO";

  const Icon = isDelivery ? Truck : isRetirada ? ShoppingBag : Utensils;
  const label = isDelivery
    ? "Delivery"
    : isRetirada
    ? "Retirada"
    : mesaNome || "Consumo Local";

  const style = isDelivery
    ? "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
    : isRetirada
    ? "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold"
    : "border-primary/30 bg-primary/10 text-primary font-semibold";

  return (
    <Badge
      variant="outline"
      className={cn("text-xs flex items-center gap-1 w-fit whitespace-nowrap", style, className)}
    >
      <Icon className="size-3 shrink-0" />
      <span>{label}</span>
    </Badge>
  );
}
