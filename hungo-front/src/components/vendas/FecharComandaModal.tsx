import { useState, useEffect } from "react";
import {
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  PieChart,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { toast } from "sonner";
import { Venda, ItemPedido } from "@/lib/api";
import { brl } from "@/lib/mock-data";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

interface FecharComandaModalProps {
  venda: Venda | null;
  itensAbertos: ItemPedido[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    tipoFechamento: "TOTAL" | "PARCIAL";
    formaPagamento: string;
    desconto: number;
    valorPagoAgora: number;
  }) => Promise<void>;
  loading: boolean;
}

const paymentMethods = [
  {
    label: "Pix",
    icon: QrCode,
    activeClass:
      "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs",
    hoverClass: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
  },
  {
    label: "Cartão de Crédito",
    icon: CreditCard,
    activeClass:
      "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs",
    hoverClass: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
  },
  {
    label: "Cartão de Débito",
    icon: CreditCard,
    activeClass:
      "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold shadow-2xs",
    hoverClass: "hover:border-sky-500/50 hover:bg-sky-500/5",
  },
  {
    label: "Dinheiro",
    icon: Banknote,
    activeClass:
      "border-emerald-600 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs",
    hoverClass: "hover:border-emerald-600/50 hover:bg-emerald-600/5",
  },
  {
    label: "Vale Refeição",
    icon: PieChart,
    activeClass:
      "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-2xs",
    hoverClass: "hover:border-amber-500/50 hover:bg-amber-500/5",
  },
];

export function FecharComandaModal({
  venda,
  itensAbertos,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: FecharComandaModalProps) {
  const [tipoFechamento, setTipoFechamento] = useState<"TOTAL" | "PARCIAL">("TOTAL");
  const [formaPagamento, setFormaPagamento] = useState<string>("Pix");
  const [aplicarDesconto, setAplicarDesconto] = useState<boolean>(false);
  const [descontoValorInput, setDescontoValorInput] = useState<string>("");
  const [valorPagoParcialInput, setValorPagoParcialInput] = useState<string>("");

  useEffect(() => {
    if (venda && open) {
      const itens = itensAbertos.filter(
        (i) =>
          i.vendaId === venda.id ||
          (i as any).vendaId === venda.id ||
          i.pedido?.venda?.id === venda.id
      );

      const subtotalGeral = round2(
        itens
          .filter((i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO")
          .reduce((acc, i) => acc + (i.total || 0), 0)
      );

      const taxa = round2(venda.taxaEntrega || 0);
      const valorPago = round2(venda.valorPago || 0);

      const totalConsumidoCalculado = round2(subtotalGeral + taxa);
      const saldoPendente = round2(
        Math.max(0, totalConsumidoCalculado - valorPago)
      );

      setTipoFechamento("TOTAL");
      setFormaPagamento("Pix");
      setAplicarDesconto(false);
      setDescontoValorInput("");
      setValorPagoParcialInput(
        saldoPendente > 0 ? saldoPendente.toString() : ""
      );
    }
  }, [venda, open, itensAbertos]);

  if (!venda) return null;

  const itens = itensAbertos.filter(
    (i) =>
      i.vendaId === venda.id ||
      (i as any).vendaId === venda.id ||
      i.pedido?.venda?.id === venda.id
  );

  const subtotalGeral = round2(
    itens
      .filter((i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO")
      .reduce((acc, i) => acc + (i.total || 0), 0)
  );

  const taxa = round2(venda.taxaEntrega || 0);
  const valorJaPago = round2(venda.valorPago || 0);

  const totalConsumidoCalculado = round2(subtotalGeral + taxa);

  const saldoPendente = round2(
    Math.max(0, totalConsumidoCalculado - valorJaPago)
  );

  const descontoNum = aplicarDesconto
    ? Math.min(
        saldoPendente,
        Math.max(0, parseFloat(descontoValorInput) || 0)
      )
    : 0;

  const maximoPagamentoPermitido = Math.max(
    0,
    saldoPendente - descontoNum
  );

  const valorPagoAgora =
    tipoFechamento === "TOTAL"
      ? maximoPagamentoPermitido
      : Math.min(
          maximoPagamentoPermitido,
          Math.max(0, parseFloat(valorPagoParcialInput) || 0)
        );

  const saldoRestanteAposPagamento = round2(
    Math.max(0, saldoPendente - descontoNum - valorPagoAgora)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saldoPendente <= 0) {
      toast.error(
        "Esta comanda não possui saldo pendente para pagamento."
      );
      return;
    }

    if (descontoNum > saldoPendente) {
      toast.error(
        `O desconto (${brl(descontoNum)}) não pode ser maior do que o saldo pendente (${brl(saldoPendente)}).`
      );
      return;
    }

    if (tipoFechamento === "PARCIAL" && valorPagoAgora <= 0) {
      toast.warning("Informe o valor a ser pago nesta etapa parcial.");
      return;
    }

    await onConfirm({
      tipoFechamento,
      formaPagamento,
      desconto: descontoNum,
      valorPagoAgora,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-3 border-b space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Receipt className="size-5 text-primary" />
            Pagamento / Encerramento — Comanda #{venda.id}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <ChannelBadge tipo={venda.tipoAtendimento} mesaNome={venda.mesa?.nome} />
            {(venda.cliente?.nome || venda.nomeCliente) && (
              <Badge variant="outline" className="text-xs border-border bg-muted/40 font-medium">
                <User className="size-3 mr-1 text-primary" />
                {venda.cliente?.nome || venda.nomeCliente}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1.5 font-mono">
            <div className="flex justify-between text-muted-foreground font-sans">
              <span>Total Consumido Acumulado:</span>
              <span className="font-bold text-foreground">
                {brl(totalConsumidoCalculado)}
              </span>
            </div>
            {valorJaPago > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-sans">
                <span>Total Já Quitado (Parciais):</span>
                <span className="font-bold">- {brl(valorJaPago)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t font-sans font-bold text-sm text-foreground">
              <span>Saldo Pendente a Pagar:</span>
              <span className="text-primary font-mono font-bold">
                {brl(saldoPendente)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Tipo de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoFechamento("TOTAL")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  tipoFechamento === "TOTAL"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <CheckCircle2 className="size-4" />
                <span>Total</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoFechamento("PARCIAL")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  tipoFechamento === "PARCIAL"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Clock className="size-4" />
                <span>Parcial</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Forma de Pagamento</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = formaPagamento === pm.label;
                return (
                  <button
                    key={pm.label}
                    type="button"
                    onClick={() => setFormaPagamento(pm.label)}
                    className={`p-2.5 border rounded-xl flex items-center gap-2 transition-all text-xs ${
                      isSelected
                        ? pm.activeClass
                        : `text-muted-foreground border-border ${pm.hoverClass}`
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-dashed">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checkDesc"
                checked={aplicarDesconto}
                onCheckedChange={(c) => setAplicarDesconto(Boolean(c))}
              />
              <label
                htmlFor="checkDesc"
                className="text-xs font-medium cursor-pointer"
              >
                Aplicar desconto neste pagamento
              </label>
            </div>

            {aplicarDesconto && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="descVal" className="text-xs">
                  Valor do Desconto (R$)
                </Label>
                <Input
                  id="descVal"
                  type="number"
                  step="0.01"
                  min="0"
                  max={saldoPendente}
                  placeholder="0.00"
                  value={descontoValorInput}
                  onChange={(e) => setDescontoValorInput(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            )}

            {tipoFechamento === "PARCIAL" && (
              <div className="space-y-2">
                <Label htmlFor="valParcial" className="text-xs">
                  Valor a Pagar Agora (R$)
                </Label>
                <Input
                  id="valParcial"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maximoPagamentoPermitido}
                  placeholder="0.00"
                  value={valorPagoParcialInput}
                  onChange={(e) => setValorPagoParcialInput(e.target.value)}
                  className="h-8 text-xs font-mono font-bold"
                  required
                />
              </div>
            )}
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border space-y-1 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground font-sans">
              <span>Valor Quitado Agora:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {brl(valorPagoAgora)}
              </span>
            </div>
            {descontoNum > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-sans">
                <span>Desconto Concedido:</span>
                <span className="font-mono">{brl(descontoNum)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t font-sans font-bold text-sm text-foreground">
              <span>Saldo Restante após Pagamento:</span>
              <span className="font-mono text-primary">
                {brl(saldoRestanteAposPagamento)}
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
              disabled={loading || valorPagoAgora <= 0}
              className="bg-brand text-primary-foreground font-bold text-xs h-9 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" /> Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>
                    {tipoFechamento === "TOTAL"
                      ? "Confirmar Encerramento Total"
                      : "Registrar Pagamento Parcial"}
                  </span>
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
