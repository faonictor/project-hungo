import { useState } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShoppingBag,
  AlertTriangle,
  Eye,
  EyeOff,
  Receipt,
  User,
  ChevronRight,
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
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { cn } from "@/lib/utils";
import { Venda, ItemPedido } from "@/lib/api";
import { brl } from "@/lib/mock-data";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

interface VerItensComandaModalProps {
  venda: Venda | null;
  itensList: ItemPedido[];
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLancarMaisItens: (venda: Venda) => void;
  onEditarDados: (venda: Venda) => void;
  onExcluirComanda: (venda: Venda) => void;
  onFecharComanda: (venda: Venda) => void;
  onRemoverItem: (item: ItemPedido) => void;
  cancelingItemId: number | null;
}

export function VerItensComandaModal({
  venda,
  itensList,
  loading,
  open,
  onOpenChange,
  onLancarMaisItens,
  onEditarDados,
  onExcluirComanda,
  onFecharComanda,
  onRemoverItem,
  cancelingItemId,
}: VerItensComandaModalProps) {
  const [mostrarItensCancelados, setMostrarItensCancelados] = useState(false);

  if (!venda) return null;

  const safeItensList = Array.isArray(itensList) ? itensList : [];
  const itensAtivos = safeItensList.filter(
    (i) => (i?.statusItem || "").toUpperCase() !== "CANCELADO"
  );
  const itensCancelados = safeItensList.filter(
    (i) => (i?.statusItem || "").toUpperCase() === "CANCELADO"
  );

  const subtotalItens = round2(
    itensAtivos.reduce((acc, i) => acc + (i.total || 0), 0)
  );
  const taxaEntrega = round2(venda.taxaEntrega || 0);
  const totalComanda = round2(subtotalItens + taxaEntrega);
  const valorJaPago = round2(venda.valorPago || 0);
  const descontoAcumulado = round2(venda.desconto || 0);
  const saldoPendente = round2(Math.max(0, totalComanda - valorJaPago - descontoAcumulado));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pb-3 border-b flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Comanda #{venda.numeroComanda || venda.id} — Itens Lançados
            </DialogTitle>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEditarDados(venda)}
              className="size-9 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="Editar dados da comanda"
            >
              <Pencil className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ChannelBadge tipo={venda.tipoAtendimento} mesaNome={venda.mesa?.nome} />
            <Badge variant="outline" className="text-xs border-border bg-muted/40 font-medium">
              <User
                className={`size-3 mr-1 ${
                  venda.cliente
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-primary"
                }`}
              />
              {venda.cliente?.nome || venda.nomeCliente || "Consumo Local"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {loading ? (
            <div className="flex h-36 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando itens da comanda...
            </div>
          ) : itensAtivos.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center text-muted-foreground border rounded-xl p-4 text-center">
              <ShoppingBag className="size-8 text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground">Nenhum item ativo nesta comanda</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Lance novos produtos através do botão abaixo.
              </p>
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
                    <TableHead className="text-xs font-bold text-right w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensAtivos.map((item) => {
                    const statusPedido = item.pedido?.statusPedido || "Aberto";
                    const isConcluido = statusPedido === "Concluído" || statusPedido === "Concluido";
                    const isPreparo = statusPedido === "Em preparo";

                    return (
                      <TableRow key={item.id} className="text-xs">
                        <TableCell>
                          <p className="font-semibold text-foreground">
                            {item.produto?.nome || `Produto #${item.id}`}
                          </p>
                          {item.observacao && (
                            <p className="text-[10px] text-muted-foreground italic font-medium">
                              * {item.observacao}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] text-muted-foreground">
                              #{item.pedido?.id}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                isConcluido
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold"
                                  : isPreparo
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold"
                                  : "bg-sky-500/10 text-sky-600 border-sky-500/30 font-semibold"
                              }`}
                            >
                              {statusPedido}
                            </Badge>
                          </div>
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

                        <TableCell className="text-right">
                          {!isConcluido && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoverItem(item)}
                              disabled={cancelingItemId === item.id}
                              className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Cancelar / Remover Item"
                            >
                              {cancelingItemId === item.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                            </Button>
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
                onClick={() => setMostrarItensCancelados(!mostrarItensCancelados)}
                className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10 justify-between h-8"
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
                        className="p-2 border border-destructive/20 bg-destructive/5 rounded-md text-xs space-y-1 shadow-xs"
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <span className="line-through text-muted-foreground">
                            {item.produto?.nome || `Produto #${item.id}`} ({item.quantidade}x)
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {brl(item.total || 0)}
                          </span>
                        </div>
                        {item.motivoCancelamento ? (
                          <p className="text-[10px] text-destructive font-medium">
                            Motivo: <span className="font-normal text-foreground">{item.motivoCancelamento}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground italic">
                            Removido enquanto em Aberto (sem justificativa necessária)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-muted/40 rounded-xl border space-y-1 text-xs">
            {taxaEntrega > 0 ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal dos Itens:</span>
                  <span className="font-mono font-medium">{brl(subtotalItens)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de Entrega:</span>
                  <span className="font-mono font-medium">{brl(taxaEntrega)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-0.5">
                  <span className="text-foreground">Total Consumido:</span>
                  <span className="font-mono">{brl(totalComanda)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Consumido:</span>
                <span className="font-mono font-medium">{brl(totalComanda)}</span>
              </div>
            )}
            {descontoAcumulado > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Descontos:</span>
                <span className="font-mono font-normal">- {brl(descontoAcumulado)}</span>
              </div>
            )}
            {valorJaPago > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Total Pago:</span>
                <span className="font-mono font-normal">- {brl(valorJaPago)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t font-bold text-sm text-foreground">
              <span>Saldo Pendente:</span>
              <span className="font-mono font-bold text-foreground">
                {brl(saldoPendente)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t flex flex-row items-center justify-between sm:justify-between w-full gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onExcluirComanda(venda)}
            className="size-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 border-destructive/30"
            title="Excluir Comanda"
          >
            <Trash2 className="size-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onLancarMaisItens(venda)}
              className="text-xs font-semibold h-9 px-3"
            >
              <Plus className="size-3.5 mr-1" /> Lançar Itens
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onFecharComanda(venda)}
              className="bg-brand text-primary-foreground font-bold text-xs h-9 px-3 flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-1.5">
                <Receipt className="size-3.5" /> Fechar e Pagar
              </span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
