import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Loader2,
  Calendar,
  User,
  Clock,
  Receipt,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { Venda, ItemPedido, Pedido, apiPedidos } from "@/lib/api";
import { brl } from "@/lib/mock-data";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

interface VerPedidosVendaModalProps {
  venda: Venda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerPedidosVendaModal({
  venda,
  open,
  onOpenChange,
}: VerPedidosVendaModalProps) {
  const [itensList, setItensList] = useState<ItemPedido[]>([]);
  const [pedidosList, setPedidosList] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarItensCancelados, setMostrarItensCancelados] = useState(false);

  useEffect(() => {
    if (open && venda?.id) {
      setLoading(true);
      Promise.all([
        apiPedidos.buscarItensPorVenda(venda.id).catch(() => []),
        apiPedidos.buscarPorVenda(venda.id).catch(() => []),
      ])
        .then(([itens, peds]) => {
          setItensList(itens || []);
          setPedidosList(peds || []);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setItensList([]);
      setPedidosList([]);
      setMostrarItensCancelados(false);
    }
  }, [open, venda?.id]);

  if (!venda) return null;

  const itensAtivos = itensList.filter(
    (i) => (i.statusItem || "").toUpperCase() !== "CANCELADO"
  );
  const itensCancelados = itensList.filter(
    (i) => (i.statusItem || "").toUpperCase() === "CANCELADO"
  );

  const subtotalItens = round2(
    itensAtivos.reduce((acc, i) => acc + (i.total || (i.quantidade * (i.precoUnitario || i.produto?.preco || 0))), 0)
  );
  const taxaEntrega = round2(venda.taxaEntrega || 0);
  const totalGeral = round2(subtotalItens + taxaEntrega);
  const totalPago = round2(venda.valorPago || 0);

  const clienteNome = venda.cliente?.nome || venda.nomeCliente || "Consumo Local";
  const isCadastrado = Boolean(venda.cliente);
  const isCancelada = venda.status === "CANCELADA";
  const isEncerrada = Boolean(venda.dataFimVenda);
  const isAPrazo = venda.formaPagamento === "A_PRAZO";
  const saldoPendente = round2(venda.statusPagamento === "PAGO" ? 0 : venda.total || 0);
  const isAPrazoPendente = isAPrazo && saldoPendente > 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b flex flex-col space-y-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            Pedidos da Venda #{venda.id} (Comanda #{venda.numeroComanda || venda.id})
          </DialogTitle>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                isCancelada
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : isAPrazoPendente
                  ? "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  : isAPrazo
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : isEncerrada
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-primary/30 bg-primary/10 text-primary"
              }`}
            >
              {isCancelada
                ? "Cancelada"
                : isAPrazoPendente
                ? "A Prazo"
                : isAPrazo
                ? "A Prazo (Quitada)"
                : isEncerrada
                ? "Encerrada"
                : "Em Aberto"}
            </Badge>
            <ChannelBadge tipo={venda.tipoAtendimento} mesaNome={venda.mesa?.nome} />
            <Badge variant="outline" className="text-xs border-border bg-muted/40 font-medium">
              <User
                className={`size-3 mr-1 ${
                  isCadastrado ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                }`}
              />
              {clienteNome}
            </Badge>
            {pedidosList.length > 0 && (
              <Badge variant="outline" className="text-xs border-border bg-muted/40 font-mono">
                {pedidosList.length} {pedidosList.length === 1 ? "pedido" : "pedidos"}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
            <div>
              <span className="font-semibold block text-foreground">Abertura:</span>
              <span>
                {venda.dataInicioVenda
                  ? new Date(venda.dataInicioVenda).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "-"}
              </span>
            </div>
            <div>
              <span className="font-semibold block text-foreground">Fechamento:</span>
              <span>
                {venda.dataFimVenda
                  ? new Date(venda.dataFimVenda).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Ainda aberta"}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {loading ? (
            <div className="flex h-36 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando pedidos e itens da venda...
            </div>
          ) : itensAtivos.length === 0 && itensCancelados.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center text-muted-foreground border rounded-xl p-4 text-center">
              <ShoppingBag className="size-8 text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground">Nenhum item registrado nesta venda</p>
            </div>
          ) : (
            <div className="border rounded-xl max-h-64 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/95 z-10 backdrop-blur-xs">
                  <TableRow>
                    <TableHead className="text-xs font-bold">Produto</TableHead>
                    <TableHead className="text-xs font-bold">Pedido</TableHead>
                    <TableHead className="text-xs font-bold text-center">Qtd</TableHead>
                    <TableHead className="text-xs font-bold text-right">Unitário</TableHead>
                    <TableHead className="text-xs font-bold text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensAtivos.map((item) => {
                    const statusPedido = item.pedido?.statusPedido || "Concluído";
                    const isConcluido = statusPedido === "Concluído" || statusPedido === "Concluido";
                    const isPreparo = statusPedido === "Em preparo";

                    return (
                      <TableRow key={item.id} className="text-xs">
                        <TableCell className="font-medium">
                          <p className="font-bold text-foreground">
                            {item.produto?.nome || `Item #${item.id}`}
                          </p>
                          {item.observacao && (
                            <p className="text-[10px] text-muted-foreground italic">
                              Obs: {item.observacao}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono whitespace-nowrap ${
                              isConcluido
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : isPreparo
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            #{item.pedido?.id || item.pedidoId || "-"} • {statusPedido}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center font-bold font-mono">
                          {item.quantidade}x
                        </TableCell>

                        <TableCell className="text-right font-mono text-muted-foreground">
                          {brl(item.precoUnitario || item.produto?.preco || 0)}
                        </TableCell>

                        <TableCell className="text-right font-bold font-mono text-foreground">
                          {brl(item.total || item.quantidade * (item.precoUnitario || item.produto?.preco || 0))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {itensCancelados.length > 0 && (
            <div className="pt-2 border-t border-dashed">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarItensCancelados(!mostrarItensCancelados)}
                className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10 justify-between h-8 cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="size-3.5 text-destructive" /> Itens Cancelados ({itensCancelados.length})
                </span>
                <span className="text-[11px] font-medium flex items-center gap-1">
                  {mostrarItensCancelados ? (
                    <>
                      <EyeOff className="size-3.5" /> Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" /> Ver
                    </>
                  )}
                </span>
              </Button>

              {mostrarItensCancelados && (
                <div className="mt-2 p-2.5 border border-destructive/20 bg-destructive/5 rounded-lg space-y-2 text-xs">
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {itensCancelados.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 border border-destructive/20 bg-destructive/5 rounded-md text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <span className="line-through text-muted-foreground">
                            {item.produto?.nome || `Item #${item.id}`} ({item.quantidade}x)
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {brl(item.total || item.quantidade * (item.precoUnitario || item.produto?.preco || 0))}
                          </span>
                        </div>
                        {item.motivoCancelamento && (
                          <p className="text-[10px] text-destructive font-medium">
                            Motivo: <span className="font-normal text-foreground">{item.motivoCancelamento}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal dos Produtos:</span>
              <span className="font-mono font-medium">{brl(subtotalItens)}</span>
            </div>
            {taxaEntrega > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Taxa de Entrega:</span>
                <span className="font-mono font-medium">{brl(taxaEntrega)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t font-bold text-sm text-foreground">
              <span>Total da Venda:</span>
              <span className="font-mono">{brl(totalGeral)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Total Pago:</span>
              <span className="font-mono">{brl(totalPago)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t flex flex-row items-center justify-end w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-xs cursor-pointer"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
