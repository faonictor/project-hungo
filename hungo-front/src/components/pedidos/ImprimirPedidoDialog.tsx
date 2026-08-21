import { Printer } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pedido, Produto } from "@/lib/api";

interface ImprimirPedidoDialogProps {
  pedido: Pedido | null;
  produtosList: Produto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
}

export function ImprimirPedidoDialog({
  pedido,
  produtosList,
  open,
  onOpenChange,
  onPrint,
}: ImprimirPedidoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base font-bold text-primary">
            <Printer className="size-5 text-primary" />
            Deseja imprimir a via de produção?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            O pedido <strong>#{pedido?.id}</strong> foi alterado para <strong>Em preparo</strong>. Deseja enviar a via da cozinha para a impressora agora?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {pedido && (
          <div className="p-3 border rounded-lg bg-muted/40 space-y-1.5 text-xs">
            <div className="flex justify-between font-semibold">
              <span>Pedido #{pedido.id}</span>
              <span className="font-mono">{pedido.venda?.mesa?.nome || "Mesa/Balcão"}</span>
            </div>
            <div className="text-muted-foreground text-[11px] font-mono">
              {pedido.itens
                ?.filter((i) => (i.statusItem || "").toUpperCase() !== "CANCELADO")
                .map((i) => {
                  const prodId = (i as any).produtoId || (i as any).produto?.id;
                  const prod = produtosList.find((p) => p.id === prodId);
                  return `${i.quantidade}x ${(i as any).produto?.nome || prod?.nome || "Item"}`;
                })
                .join(", ")}
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full gap-2 pt-2">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="text-xs border-input/60"
          >
            Não Imprimir
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onPrint}
            className="bg-brand text-primary-foreground hover:opacity-90 font-bold h-9 px-4 text-xs shadow-xs flex items-center gap-1.5"
          >
            <Printer className="size-4" /> Imprimir Via de Cozinha
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
