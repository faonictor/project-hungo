import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pedido } from "@/lib/api";

interface CancelarPedidoModalProps {
  pedido: Pedido | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motivoOpcao: string;
  onMotivoOpcaoChange: (val: string) => void;
  motivoObservacao: string;
  onMotivoObservacaoChange: (val: string) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function CancelarPedidoModal({
  pedido,
  open,
  onOpenChange,
  motivoOpcao,
  onMotivoOpcaoChange,
  motivoObservacao,
  onMotivoObservacaoChange,
  onConfirm,
  loading = false,
}: CancelarPedidoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
            <AlertTriangle className="size-5 text-destructive" /> Motivo do Cancelamento do Pedido #{pedido?.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Informe a justificativa para o cancelamento deste pedido. Todos os itens associados serão marcados como cancelados e o valor total da comanda será atualizado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="p-3 bg-muted/40 rounded-lg border space-y-1">
            <p className="font-semibold text-foreground">
              Pedido #{pedido?.id} — {pedido?.tipoPedido || "Mesa"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {pedido?.venda?.mesa?.nome
                ? `Comanda da ${pedido.venda.mesa.nome}`
                : pedido?.cliente?.nome
                ? `Cliente: ${pedido.cliente.nome}`
                : `Comanda #${pedido?.venda?.id || "-"}`}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Motivo Principal</Label>
            <Select value={motivoOpcao} onValueChange={onMotivoOpcaoChange}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cliente desistiu">Cliente desistiu</SelectItem>
                <SelectItem value="Produto faltando">Produto faltando / indisponível</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="obsCancelPed" className="text-xs">Observação (Opcional)</Label>
            <textarea
              id="obsCancelPed"
              placeholder="Descreva detalhes adicionais sobre o cancelamento..."
              value={motivoObservacao}
              onChange={(e) => onMotivoObservacaoChange(e.target.value)}
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold flex items-center gap-1"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1" /> Removendo...
              </>
            ) : (
              <>
                <Trash2 className="size-4 mr-1" /> Remover Pedido
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
