import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  User,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { Venda, ItemPedido } from "@/lib/api";
import { brl } from "@/lib/mock-data";

const round2 = (n: number) => Math.round(n * 100) / 100;

interface EncerrarComandaModalProps {
  venda: Venda | null;
  itensAbertos: ItemPedido[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vendaId: number) => Promise<void>;
  loading: boolean;
}

export function EncerrarComandaModal({
  venda,
  itensAbertos,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: EncerrarComandaModalProps) {
  if (!open || !venda || !venda.id) return null;

  const itens = itensAbertos.filter(
    (i) =>
      i.vendaId === venda.id ||
      (i as any).vendaId === venda.id ||
      i.pedido?.venda?.id === venda.id
  );

  const itensAtivos = itens.filter(
    (i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO"
  );

  const itensNaoConcluidos = itensAtivos.filter((i) => {
    const status = (i.pedido?.statusPedido || "").trim().toLowerCase();
    return !(
      status === "concluído" ||
      status === "concluido" ||
      status === "entregue" ||
      status === "cancelado"
    );
  });

  const temPedidosNaoConcluidos = itensNaoConcluidos.length > 0;

  const subtotalItens = round2(
    itensAtivos.reduce((acc, i) => acc + (i.total || 0), 0)
  );
  const taxa = round2(venda.taxaEntrega || 0);
  const subtotalGeral = subtotalItens > 0
    ? subtotalItens
    : Math.max(0, round2((venda.totalBruto || venda.total || 0) - taxa));
  const totalConsumido = round2(
    Math.max(subtotalGeral + taxa, venda.totalBruto || venda.total || 0)
  );
  const valorJaPago = round2(venda.valorPago || 0);
  const descontoAcumulado = round2(venda.desconto || 0);

  const isCadastrado = Boolean(venda.cliente);
  const clienteNome = venda.cliente?.nome || venda.nomeCliente || "Consumo Local";
  const numComanda = venda.numeroComanda || venda.id;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (temPedidosNaoConcluidos) return;
    await onConfirm(venda.id!);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <CheckCircle2 className="size-5 text-primary" />
            Encerramento — Comanda #{numComanda}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <ChannelBadge tipo={venda.tipoAtendimento} mesaNome={venda.mesa?.nome} />
            <Badge variant="outline" className="text-xs border-border bg-muted/40 font-medium">
              <User
                className={`size-3 mr-1 ${
                  isCadastrado
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-primary"
                }`}
              />
              {clienteNome}
            </Badge>
            {temPedidosNaoConcluidos && (
              <Badge
                variant="outline"
                className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-normal flex items-center gap-1"
              >
                <AlertTriangle className="size-3 shrink-0" />
                <span>Existem pedidos em aberto ou em preparo</span>
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-4 py-2 text-xs">
          <div className="p-2.5 border border-emerald-500/30 bg-emerald-500/10 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="text-xs font-semibold">Comanda Quitada</span>
          </div>

          {/* Card Resumo Financeiro */}
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1.5 font-mono">
            <div className="flex justify-between text-muted-foreground font-sans">
              <span>Total Consumido:</span>
              <span className="font-mono font-normal text-foreground">
                {brl(totalConsumido)}
              </span>
            </div>
            {descontoAcumulado > 0 && (
              <div className="flex justify-between text-muted-foreground font-sans">
                <span>Descontos:</span>
                <span className="font-mono font-normal">- {brl(descontoAcumulado)}</span>
              </div>
            )}
            {valorJaPago > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-sans">
                <span>Total Pago:</span>
                <span className="font-mono font-normal">- {brl(valorJaPago)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t font-sans font-bold text-sm text-foreground">
              <span>Saldo Pendente:</span>
              <span className="font-mono font-bold text-foreground">
                {brl(0)}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-row items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-9 px-4 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || temPedidosNaoConcluidos}
              className="font-bold text-xs h-9 px-4 flex items-center gap-1.5 cursor-pointer bg-brand hover:bg-brand/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" /> Encerrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Confirmar Encerramento</span>
                  <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
