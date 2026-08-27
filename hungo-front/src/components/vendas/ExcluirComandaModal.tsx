import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Venda } from "@/lib/api";

interface ExcluirComandaModalProps {
  venda: Venda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => Promise<void>;
  loading: boolean;
}

export function ExcluirComandaModal({
  venda,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: ExcluirComandaModalProps) {
  const [confirmacaoNumero, setConfirmacaoNumero] = useState<string>("");
  const [motivoExclusaoOpcao, setMotivoExclusaoOpcao] = useState<string>("Cliente desistiu");
  const [motivoExclusaoObs, setMotivoExclusaoObs] = useState<string>("");

  if (!venda) return null;

  const handleExcluir = async () => {
    if (confirmacaoNumero.trim() !== venda.id?.toString()) {
      toast.error(`Digite o número #${venda.id} para confirmar a exclusão.`);
      return;
    }

    const motivoFinal = `${motivoExclusaoOpcao}${
      motivoExclusaoObs.trim() ? `: ${motivoExclusaoObs.trim()}` : ""
    }`;
    await onConfirm(motivoFinal);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
            <AlertTriangle className="size-5 text-destructive" />
            Excluir Comanda #{venda.numeroComanda || venda.id}?
          </DialogTitle>
          <DialogDescription className="text-xs">
            Esta ação cancelará a comanda e todos os seus pedidos vinculados. Um registro de auditoria será gerado no histórico de cancelamentos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="p-3 bg-muted/40 rounded-lg border space-y-1">
            <p className="font-semibold text-foreground">
              Comanda #{venda.numeroComanda || venda.id} — {venda.tipoAtendimento || "LOCAL"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {venda.mesa?.nome
                ? `Mesa: ${venda.mesa.nome}`
                : venda.cliente?.nome
                ? `Cliente: ${venda.cliente.nome}`
                : "Sem identificação"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Motivo do Cancelamento / Exclusão</Label>
            <Select value={motivoExclusaoOpcao} onValueChange={setMotivoExclusaoOpcao}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Selecione o motivo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cliente desistiu">Cliente desistiu</SelectItem>
                <SelectItem value="Comanda aberta por engano">Comanda aberta por engano</SelectItem>
                <SelectItem value="Erro de lançamento">Erro de lançamento do operador</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="obsExcluir" className="text-xs">
              Observações Adicionais (Opcional)
            </Label>
            <textarea
              id="obsExcluir"
              placeholder="Descreva detalhes adicionais..."
              value={motivoExclusaoObs}
              onChange={(e) => setMotivoExclusaoObs(e.target.value)}
              className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="confirmNum" className="text-xs font-bold text-destructive">
              Para confirmar, digite o número {venda.id} abaixo:
            </Label>
            <Input
              id="confirmNum"
              placeholder={`Digite ${venda.id}`}
              value={confirmacaoNumero}
              onChange={(e) => setConfirmacaoNumero(e.target.value)}
              className="h-9 text-xs font-mono font-bold"
            />
          </div>
        </div>

        <DialogFooter className="pt-2 flex flex-row items-center justify-between sm:justify-between w-full">
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
            onClick={handleExcluir}
            disabled={loading || confirmacaoNumero.trim() !== venda.id?.toString()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1" /> Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="size-4 mr-1" /> Excluir Comanda
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
