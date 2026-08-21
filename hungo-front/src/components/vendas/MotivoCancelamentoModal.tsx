import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Venda } from "@/lib/api";

interface MotivoCancelamentoModalProps {
  venda: Venda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MotivoCancelamentoModal({
  venda,
  open,
  onOpenChange,
}: MotivoCancelamentoModalProps) {
  if (!venda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            Motivo do Cancelamento — Comanda #{venda.id}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <div className="text-xs text-muted-foreground">
            Comanda referente a:{" "}
            <span className="font-semibold text-foreground">
              {venda.mesa?.nome
                ? venda.mesa.nome
                : venda.cliente?.nome ||
                  venda.nomeCliente ||
                  (venda.tipoAtendimento === "LOCAL" || venda.tipoAtendimento === "SALAO"
                    ? "Mesa"
                    : "Balcão")}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-sm text-foreground space-y-1">
            <p className="font-semibold text-xs text-destructive">Motivo registrado:</p>
            <p className="leading-relaxed text-xs">
              {venda.motivoCancelamento || "Exclusão de comanda solicitada pelo operador."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
