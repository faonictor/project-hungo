import { History, User, Receipt, Loader2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Venda, PagamentoComanda } from "@/lib/api";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/mock-data";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

interface HistoricoPagamentosModalProps {
  venda: Venda | null;
  pagamentosList: PagamentoComanda[];
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAbrirEstorno?: (venda: Venda) => void;
}

export function HistoricoPagamentosModal({
  venda,
  pagamentosList,
  loading,
  open,
  onOpenChange,
  onAbrirEstorno,
}: HistoricoPagamentosModalProps) {
  if (!venda) return null;

  const temPagamentos = pagamentosList.length > 0;

  const pagamentosEntrada = pagamentosList.filter((p) => p.tipo !== "ESTORNO");
  const estornos = pagamentosList.filter((p) => p.tipo === "ESTORNO");

  const totalPagoEntrada = temPagamentos
    ? round2(pagamentosEntrada.reduce((acc, p) => acc + (p.valorPago || 0), 0))
    : round2(venda.valorPago || venda.total || 0);

  const totalEstornado = round2(
    estornos.reduce((acc, p) => acc + Math.abs(p.valorPago || 0), 0)
  );

  const totalDescontosCalculado = temPagamentos
    ? round2(pagamentosList.reduce((acc, p) => acc + (p.desconto || 0), 0))
    : 0;

  const isEncerrada = Boolean(venda.dataFimVenda);

  const totalBrutoConsumido = round2(
    venda.totalBruto && venda.totalBruto > 0
      ? venda.totalBruto
      : isEncerrada && venda.formaPagamento !== "A_PRAZO"
      ? totalPagoEntrada + totalDescontosCalculado
      : (venda.total || 0) + totalPagoEntrada + totalDescontosCalculado
  );

  const totalLiquidoCaixa = round2(Math.max(0, totalPagoEntrada - totalEstornado));
  const isAPrazo = venda.formaPagamento === "A_PRAZO";
  const saldoPendenteComanda = isAPrazo
    ? round2(venda.statusPagamento === "PAGO" ? 0 : venda.total || 0)
    : isEncerrada
    ? 0
    : round2(
        Math.max(
          0,
          totalBrutoConsumido - totalDescontosCalculado - totalLiquidoCaixa
        )
      );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <History className="size-5 text-primary" />
              Histórico de Pagamentos — Venda #{venda.id} (Comanda #{venda.numeroComanda || venda.id})
            </DialogTitle>
            {onAbrirEstorno && totalLiquidoCaixa > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAbrirEstorno(venda)}
                className="text-xs h-8 px-2.5 text-destructive border-destructive/30 hover:bg-destructive/10 font-semibold"
              >
                <RotateCcw className="size-3.5 mr-1" /> Estornar Valor
              </Button>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Rastreabilidade completa de todas as movimentações e pagamentos efetuados nesta venda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3.5 border rounded-xl bg-card space-y-2.5 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <User
                  className={`size-4 shrink-0 ${
                    Boolean(venda.cliente)
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-primary"
                  }`}
                />
                {venda.cliente?.nome ||
                  venda.nomeCliente ||
                  (venda.mesa?.nome ? `Consumo Local (${venda.mesa.nome})` : "Consumo Local")}
              </span>
              <Badge
                variant="outline"
                className={
                  isAPrazo && saldoPendenteComanda > 0
                    ? "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold px-2 py-0.5"
                    : isAPrazo
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5"
                    : isEncerrada
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5"
                    : "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5"
                }
              >
                {isAPrazo && saldoPendenteComanda > 0
                  ? "Conta a Prazo (Pendente)"
                  : isAPrazo
                  ? "Conta a Prazo (Quitada)"
                  : isEncerrada
                  ? "Comanda Encerrada"
                  : "Comanda Aberta (Com Parciais)"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs font-mono">
              <div className="p-2 bg-muted/40 rounded-lg border">
                <p className="text-[10px] text-muted-foreground font-sans font-semibold">
                  Total Consumido
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {brl(totalBrutoConsumido)}
                </p>
              </div>

              <div className="p-2 bg-muted/40 rounded-lg border">
                <p className="text-[10px] text-muted-foreground font-sans font-semibold">
                  Descontos
                </p>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {brl(totalDescontosCalculado)}
                </p>
              </div>

              <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans font-semibold">
                  Total Pago
                </p>
                <p className="text-sm font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {brl(totalLiquidoCaixa)}
                </p>
              </div>

              <div className="p-2 bg-muted/40 rounded-lg border">
                <p className="text-[10px] text-foreground font-sans font-bold">
                  Saldo Pendente
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {brl(saldoPendenteComanda)}
                </p>
              </div>
            </div>

            {totalEstornado > 0 && (
              <div className="p-2 bg-destructive/5 border border-destructive/20 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="font-sans font-semibold text-destructive flex items-center gap-1.5">
                  <RotateCcw className="size-3.5" /> Total Já Estornado / Devolvido:
                </span>
                <span className="font-bold text-destructive">- {brl(totalEstornado)}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin mr-2" />
              Carregando pagamentos da comanda...
            </div>
          ) : pagamentosList.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground border rounded-xl bg-card p-4 text-center">
              <Receipt className="size-8 text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground">
                Nenhum pagamento registrado individualmente
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Esta comanda foi quitada integralmente no encerramento.
              </p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-bold whitespace-nowrap">
                      Data / Hora
                    </TableHead>
                    <TableHead className="text-xs font-bold whitespace-nowrap">
                      Tipo
                    </TableHead>
                    <TableHead className="text-xs font-bold whitespace-nowrap">
                      Forma
                    </TableHead>
                    <TableHead className="text-xs font-bold text-right whitespace-nowrap">
                      Total no Ato
                    </TableHead>
                    <TableHead className="text-xs font-bold text-right whitespace-nowrap">
                      Desconto
                    </TableHead>
                    <TableHead className="text-xs font-bold text-right whitespace-nowrap">
                      Valor Pago
                    </TableHead>
                    <TableHead className="text-xs font-bold text-right whitespace-nowrap">
                      Saldo Restante
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosList.map((p) => {
                    const badge = (() => {
                      if (p.tipo === "ESTORNO") {
                        return {
                          label: "Estorno / Devolução",
                          className: "border-destructive/30 bg-destructive/10 text-destructive text-[10px]",
                        };
                      }
                      if (p.tipo === "PARCIAL") {
                        return {
                          label: "Parcial",
                          className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]",
                        };
                      }
                      if (p.tipo === "ENTRADA_A_PRAZO") {
                        return {
                          label: "Entrada a Prazo",
                          className: "border-primary/30 bg-primary/10 text-primary text-[10px]",
                        };
                      }
                      if (p.tipo === "DEBITO_PARCIAL") {
                        return {
                          label: "Débito Parcial",
                          className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px]",
                        };
                      }
                      if (p.tipo === "QUITACAO_A_PRAZO") {
                        return {
                          label: "Quitação a Prazo",
                          className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]",
                        };
                      }
                      if (p.tipo === "TOTAL") {
                        return {
                          label: isAPrazo ? "Quitação a Prazo" : "Encerramento",
                          className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]",
                        };
                      }
                      return {
                        label: "Parcial",
                        className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]",
                      };
                    })();

                    return (
                      <TableRow key={p.id || p.dataPagamento} className="text-xs">
                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                          {p.dataPagamento
                            ? new Date(p.dataPagamento).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={badge.className}>
                            {badge.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-foreground">
                          {p.formaPagamento || "Dinheiro"}
                        </TableCell>

                      <TableCell className="text-right font-mono text-muted-foreground">
                        {brl(p.totalAntes || 0)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {p.desconto && p.desconto > 0 ? brl(p.desconto) : "-"}
                      </TableCell>

                      <TableCell
                        className={`text-right font-mono ${
                          p.tipo === "ESTORNO"
                            ? "text-destructive"
                            : "text-primary"
                        }`}
                      >
                        {p.tipo === "ESTORNO"
                          ? `- ${brl(Math.abs(p.valorPago || 0))}`
                          : brl(p.valorPago || 0)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">
                        {brl(p.saldoRestante || 0)}
                      </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
