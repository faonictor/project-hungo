import { RotateCcw, AlertTriangle, XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pedido, Venda } from "@/lib/api";
import { brl } from "@/lib/mock-data";

interface PerguntaEstornoPedidoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido | null;
  venda: Venda | null;
  valorPedido: number;
  motivoCancelamento: string;
  onDecisaoEstornar: () => void;
  onNaoEstornar: () => void;
}

export function PerguntaEstornoPedidoModal({
  open,
  onOpenChange,
  pedido,
  venda,
  valorPedido,
  motivoCancelamento,
  onDecisaoEstornar,
  onNaoEstornar,
}: PerguntaEstornoPedidoModalProps) {
  if (!pedido) return null;

  const totalPagoNaComanda = venda?.valorPago || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-3 border-b space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5 shrink-0" />
            Pedido #{pedido.id} Cancelado — Estornar Valor?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            O pedido foi cancelado com sucesso. Deseja realizar o estorno financeiro deste valor para o cliente?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1.5 font-mono">
            <div className="flex justify-between text-muted-foreground font-sans">
              <span>Pedido Cancelado:</span>
              <span className="font-bold text-foreground">#{pedido.id}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-sans">
              <span>Valor do Pedido:</span>
              <span className="font-bold text-foreground font-mono">{brl(valorPedido)}</span>
            </div>
            {motivoCancelamento && (
              <div className="flex justify-between text-muted-foreground font-sans pt-1 border-t">
                <span>Motivo informado:</span>
                <span className="font-medium text-foreground italic">{motivoCancelamento}</span>
              </div>
            )}
            {venda && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-sans pt-1 border-t">
                <span>Total já pago na Comanda #{venda.id}:</span>
                <span className="font-bold font-mono">{brl(totalPagoNaComanda)}</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200">
            <p className="font-semibold flex items-center gap-1">
              <RotateCcw className="size-3.5" /> Estorno no Histórico e Caixa:
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              Ao confirmar o estorno, uma saída financeira será lançada e o valor será deduzido do saldo pago da comanda no histórico de vendas.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t flex flex-row items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onNaoEstornar}
            className="text-xs"
          >
            Não Estornar
          </Button>
          <Button
            type="button"
            onClick={onDecisaoEstornar}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Sim, Realizar Estorno</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
