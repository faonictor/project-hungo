import { useState, useEffect } from "react";
import { RotateCcw, AlertTriangle, Loader2, DollarSign, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Venda } from "@/lib/api";
import { brl } from "@/lib/mock-data";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const formasEstorno = [
  "Pix",
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Mesma Forma de Pagamento",
];

interface EstornoPagamentoModalProps {
  venda: Venda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxValorPermitido?: number;
  valorSugerido?: number;
  motivoSugerido?: string;
  loading?: boolean;
  onConfirm: (payload: {
    valorEstorno: number;
    motivo: string;
    formaEstorno: string;
  }) => Promise<void>;
}

export function EstornoPagamentoModal({
  venda,
  open,
  onOpenChange,
  maxValorPermitido,
  valorSugerido,
  motivoSugerido,
  loading = false,
  onConfirm,
}: EstornoPagamentoModalProps) {
  const [valorInput, setValorInput] = useState<string>("");
  const [formaEstorno, setFormaEstorno] = useState<string>("Pix");
  const [motivo, setMotivo] = useState<string>("");

  const maximoEstornavel = round2(
    maxValorPermitido ?? (venda?.valorPago || venda?.total || 0)
  );

  useEffect(() => {
    if (open && venda) {
      const inicial =
        valorSugerido && valorSugerido > 0
          ? Math.min(maximoEstornavel, valorSugerido)
          : maximoEstornavel;

      setValorInput(inicial > 0 ? inicial.toString() : "");
      setMotivo(motivoSugerido || "Cancelamento de pedido / Desistência do cliente");
      setFormaEstorno("Pix");
    }
  }, [open, venda, valorSugerido, motivoSugerido, maximoEstornavel]);

  if (!venda) return null;

  const valorEstornoNum = Math.min(
    maximoEstornavel,
    Math.max(0, parseFloat(valorInput) || 0)
  );

  const saldoAposEstorno = round2(Math.max(0, maximoEstornavel - valorEstornoNum));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (valorEstornoNum <= 0) {
      toast.error("Informe um valor válido maior que zero para realizar o estorno.");
      return;
    }

    if (valorEstornoNum > maximoEstornavel) {
      toast.error(
        `O valor do estorno (${brl(valorEstornoNum)}) não pode ser superior ao valor pago disponível (${brl(maximoEstornavel)}).`
      );
      return;
    }

    if (!motivo.trim()) {
      toast.warning("Informe o motivo do estorno para registro de auditoria.");
      return;
    }

    await onConfirm({
      valorEstorno: valorEstornoNum,
      motivo: motivo.trim(),
      formaEstorno,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-3 border-b space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
            <RotateCcw className="size-5 shrink-0" />
            Estorno de Pagamento — Comanda #{venda.id}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registre a devolução do dinheiro pago pelo cliente. A saída será registrada no fluxo de caixa e no histórico da comanda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl space-y-1.5 font-mono">
            <div className="flex justify-between text-muted-foreground font-sans">
              <span>Total Pago Disponível p/ Estorno:</span>
              <span className="font-bold text-foreground font-mono">
                {brl(maximoEstornavel)}
              </span>
            </div>
            <div className="flex justify-between text-destructive font-sans font-bold pt-1 border-t border-destructive/20 text-xs">
              <span>Valor a ser Devolvido:</span>
              <span className="font-mono">{brl(valorEstornoNum)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-sans text-[11px]">
              <span>Saldo Pago Restante na Comanda:</span>
              <span className="font-mono font-medium">{brl(saldoAposEstorno)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorEstorno" className="text-xs">
              Valor a Estornar (R$)
            </Label>
            <Input
              id="valorEstorno"
              type="number"
              step="0.01"
              min="0.01"
              max={maximoEstornavel}
              placeholder="0.00"
              value={valorInput}
              onChange={(e) => setValorInput(e.target.value)}
              className="h-9 text-xs font-mono font-bold"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formaEstorno" className="text-xs">
              Forma da Devolução
            </Label>
            <Select value={formaEstorno} onValueChange={setFormaEstorno} disabled={loading}>
              <SelectTrigger id="formaEstorno" className="h-9 text-xs">
                <SelectValue placeholder="Selecione a forma" />
              </SelectTrigger>
              <SelectContent>
                {formasEstorno.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivoEstorno" className="text-xs">
              Motivo da Devolução / Estorno
            </Label>
            <Input
              id="motivoEstorno"
              placeholder="Ex: Cancelamento do pedido pelo cliente, produto indisponível..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="h-9 text-xs"
              required
              disabled={loading}
            />
          </div>

          <DialogFooter className="pt-2 border-t flex flex-row items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || valorEstornoNum <= 0 || !motivo.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" /> Processando...
                </>
              ) : (
                <>
                  <RotateCcw className="size-4 mr-1" />
                  <span>Confirmar Estorno</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
