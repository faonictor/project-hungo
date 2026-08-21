import {
  FileText,
  Truck,
  ShoppingBag,
  MapPin,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  Printer,
  RefreshCw,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Pedido, PedidoDTO, Produto } from "@/lib/api";
import { brl } from "@/lib/mock-data";

interface PedidoDetalhesModalProps {
  pedidoId: number | null;
  pedidoDetalhe: PedidoDTO | null;
  pedidoListItem?: Pedido;
  produtosList: Produto[];
  loading: boolean;
  savingStatus: boolean;
  mostrarItensCancelados: boolean;
  onMostrarItensCanceladosChange: (show: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onAvancarStatus: (nextStatus: string) => void;
  onOpenCancelModal: (pedido: Pedido) => void;
  onImprimir: (pedido: Pedido | PedidoDTO) => void;
  tempoPreparoText?: string;
}

export function PedidoDetalhesModal({
  pedidoId,
  pedidoDetalhe,
  pedidoListItem,
  produtosList,
  loading,
  savingStatus,
  mostrarItensCancelados,
  onMostrarItensCanceladosChange,
  onOpenChange,
  onAvancarStatus,
  onOpenCancelModal,
  onImprimir,
  tempoPreparoText = "-",
}: PedidoDetalhesModalProps) {
  if (pedidoId === null) return null;

  const isDelivery =
    pedidoDetalhe?.tipoPedido?.toUpperCase() === "DELIVERY" ||
    pedidoListItem?.tipoPedido?.toUpperCase() === "DELIVERY";
  const isRetirada =
    pedidoDetalhe?.tipoPedido?.toUpperCase() === "RETIRADA" ||
    pedidoDetalhe?.tipoPedido?.toUpperCase() === "BALCAO" ||
    pedidoListItem?.tipoPedido?.toUpperCase() === "RETIRADA";

  const titleHoverColor = isDelivery
    ? "hover:text-amber-500"
    : isRetirada
    ? "hover:text-purple-500"
    : "hover:text-primary";
  const iconColor = isDelivery
    ? "text-amber-500"
    : isRetirada
    ? "text-purple-500"
    : "text-primary";

  const clienteNome =
    pedidoListItem?.cliente?.nome ||
    pedidoListItem?.venda?.cliente?.nome ||
    pedidoListItem?.venda?.nomeCliente;
  const isCadastrado = Boolean(
    pedidoListItem?.cliente?.id || pedidoListItem?.venda?.cliente?.id
  );
  const mesaNome = pedidoListItem?.venda?.mesa?.nome;

  const isConcluido =
    pedidoDetalhe?.statusPedido === "Concluído" ||
    pedidoDetalhe?.statusPedido === "Concluido";
  const isCancelado =
    (pedidoDetalhe?.statusPedido || "").toLowerCase() === "cancelado" ||
    (pedidoDetalhe as any)?.venda?.status === "CANCELADA";

  const itensAtivos = (pedidoDetalhe?.itens || []).filter(
    (item) => (item.statusItem || "").toUpperCase() !== "CANCELADO"
  );
  const itensCancelados = (pedidoDetalhe?.itens || []).filter(
    (item) => (item.statusItem || "").toUpperCase() === "CANCELADO"
  );

  return (
    <Dialog open={pedidoId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-col space-y-1.5 pb-2 border-b">
          <DialogTitle
            className={`text-lg font-bold flex items-center gap-2 transition-colors cursor-default ${titleHoverColor}`}
          >
            <FileText className={`size-5 ${iconColor}`} />
            Detalhes do Pedido #{pedidoId}
          </DialogTitle>
          {pedidoDetalhe && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {isDelivery ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/12 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1"
                >
                  <Truck className="size-3" /> Delivery
                </Badge>
              ) : isRetirada ? (
                <Badge
                  variant="outline"
                  className="border-purple-500/30 bg-purple-500/12 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center gap-1"
                >
                  <ShoppingBag className="size-3" /> Retirada
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1"
                >
                  <MapPin className="size-3" /> {mesaNome || "Consumo Local"}
                </Badge>
              )}

              <Badge
                variant="outline"
                className="border-border bg-muted/50 text-foreground text-xs font-medium flex items-center gap-1"
              >
                <User
                  className={`size-3 ${
                    isCadastrado
                      ? "text-primary fill-primary/10"
                      : "text-muted-foreground"
                  }`}
                />
                {clienteNome || "Sem cliente"}
              </Badge>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex h-36 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-2" />
            Carregando detalhes do pedido...
          </div>
        ) : pedidoDetalhe ? (
          <div className="space-y-4 py-2 text-xs">
            {isConcluido ? (
              <div className="p-3 border border-emerald-500/30 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" /> Pedido Concluído!
                </p>
                <p>Preparo finalizado pela cozinha.</p>
              </div>
            ) : isCancelado ? (
              <div className="p-3 border border-destructive/30 rounded-lg bg-destructive/10 text-destructive text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <XCircle className="size-4 text-destructive" /> Pedido cancelado!
                </p>
                <p>Não é possível alterar o status deste pedido.</p>
                {pedidoDetalhe.motivoCancelamento && (
                  <p className="font-medium text-[11px] pt-1.5 border-t border-destructive/20 mt-1.5 text-destructive/90">
                    Motivo:{" "}
                    <span className="font-normal">
                      {pedidoDetalhe.motivoCancelamento}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 border rounded-lg bg-muted/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Status Atual:</span>
                  <OrderStatusBadge status={pedidoDetalhe.statusPedido} />
                </div>
                {pedidoDetalhe.statusPedido === "Em preparo" && (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-border font-mono text-[11px]"
                  >
                    <Clock className="size-3 mr-1 inline-block text-muted-foreground" />
                    {tempoPreparoText}
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              {itensAtivos.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-muted-foreground py-6">
                  <ShoppingBag className="size-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-medium text-foreground">
                    Nenhum item ativo neste pedido.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/80 z-10 backdrop-blur-xs">
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Produto</TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Qtd
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensAtivos.map((item) => {
                        const prod = produtosList.find(
                          (p) => p.id === item.produtoId
                        );
                        return (
                          <TableRow
                            key={item.id || item.produtoId}
                            className="text-xs"
                          >
                            <TableCell className="font-medium">
                              <p className="font-semibold text-foreground">
                                {prod?.nome || `Produto #${item.produtoId}`}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {brl(prod?.preco || 0)} un.
                              </p>
                            </TableCell>
                            <TableCell className="text-center font-bold font-mono">
                              {item.quantidade}x
                            </TableCell>
                            <TableCell className="text-right font-bold font-mono text-foreground">
                              {brl(
                                item.total ||
                                  item.quantidade * (prod?.preco || 0)
                              )}
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
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onMostrarItensCanceladosChange(!mostrarItensCancelados)
                    }
                    className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10 justify-between h-8"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="size-3.5 text-destructive" /> Itens
                      Cancelados ({itensCancelados.length})
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
                        {itensCancelados.map((item) => {
                          const prod = produtosList.find(
                            (p) => p.id === item.produtoId
                          );
                          return (
                            <div
                              key={item.id || item.produtoId}
                              className="p-2 border border-destructive/20 bg-destructive/5 rounded-md text-xs space-y-1 shadow-sm"
                            >
                              <div className="flex justify-between items-center font-semibold">
                                <span className="line-through text-muted-foreground">
                                  {prod?.nome || `Produto #${item.produtoId}`} (
                                  {item.quantidade}x)
                                </span>
                                <span className="font-mono text-muted-foreground">
                                  {brl(
                                    item.total ||
                                      item.quantidade * (prod?.preco || 0)
                                  )}
                                </span>
                              </div>
                              {item.motivoCancelamento ? (
                                <p className="text-[10px] text-destructive font-medium">
                                  Motivo:{" "}
                                  <span className="font-normal text-foreground">
                                    {item.motivoCancelamento}
                                  </span>
                                </p>
                              ) : (
                                <p className="text-[10px] text-muted-foreground italic">
                                  Removido enquanto em Aberto (sem justificativa
                                  necessária)
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t flex flex-row items-center justify-between sm:justify-between w-full gap-2">
              {!isConcluido && !isCancelado && pedidoListItem ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenCancelModal(pedidoListItem);
                  }}
                  className="size-10 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 border border-destructive/30"
                  title="Cancelar Pedido"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {pedidoListItem && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onImprimir(pedidoListItem)}
                    className="text-xs font-semibold h-10 px-3 flex items-center gap-1.5"
                    title="Imprimir comprovante de cozinha de 80mm"
                  >
                    <Printer className="size-4" />
                    <span>Imprimir Via</span>
                  </Button>
                )}

                {pedidoDetalhe.statusPedido === "Aberto" && (
                  <Button
                    type="button"
                    onClick={() => onAvancarStatus("Em preparo")}
                    className="bg-amber-500 text-amber-950 hover:bg-amber-600 font-bold flex items-center gap-2 h-10 px-4 text-xs shadow-xs"
                    disabled={savingStatus}
                    title="Mover pedido para Em Preparo"
                  >
                    {savingStatus ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="size-4 shrink-0" />
                        <span>Preparar</span>
                      </>
                    )}
                  </Button>
                )}

                {(pedidoDetalhe.statusPedido === "Em preparo" ||
                  pedidoDetalhe.statusPedido === "Em Preparo") && (
                  <Button
                    type="button"
                    onClick={() => onAvancarStatus("Concluído")}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold flex items-center gap-2 h-10 px-4 text-xs shadow-xs"
                    disabled={savingStatus}
                    title="Concluir preparo do pedido"
                  >
                    {savingStatus ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>Concluir</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
