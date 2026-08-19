import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Loader2,
  RefreshCw,
  Lock,
  Truck,
  ShoppingBag,
  Utensils,
  History,
  Clock,
  User,
  CheckCircle2,
  Receipt,
  DollarSign,
  Info,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiVendas, apiPagamentosComanda, Venda, PagamentoComanda } from "@/lib/api";
import { cn } from "@/lib/utils";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/vendas/encerradas")({
  head: () => ({
    meta: [
      { title: "Vendas encerradas e parciais — Hungo" },
      {
        name: "description",
        content: "Histórico de comandas fechadas e pagamentos parciais registrados.",
      },
    ],
  }),
  component: VendasEncerradasPage,
});

const channelBadge: Record<string, { label: string; style: string; icon: any }> = {
  LOCAL: { label: "Consumo Local", style: "border-primary/30 bg-primary/10 text-primary font-semibold", icon: Utensils },
  SALAO: { label: "Consumo Local", style: "border-primary/30 bg-primary/10 text-primary font-semibold", icon: Utensils },
  RETIRADA: { label: "Retirada", style: "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold", icon: ShoppingBag },
  BALCAO: { label: "Retirada", style: "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold", icon: ShoppingBag },
  DELIVERY: { label: "Delivery", style: "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold", icon: Truck },
};

function VendasEncerradasPage() {
  const [vendasFechadas, setVendasFechadas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");

  // Modal Histórico de Pagamentos
  const [historicoModalVenda, setHistoricoModalVenda] = useState<Venda | null>(null);
  const [motivoModalVenda, setMotivoModalVenda] = useState<Venda | null>(null);
  const [pagamentosList, setPagamentosList] = useState<PagamentoComanda[]>([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);

  const [descontosMap, setDescontosMap] = useState<Record<number, number>>({});

  const fetchVendasFechadas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiVendas.listarFechadas();
      setVendasFechadas(data);

      const map: Record<number, number> = {};
      await Promise.all(
        data.map(async (v) => {
          if (v.id) {
            try {
              const pgs = await apiPagamentosComanda.listarPorVenda(v.id);
              const somaDescontos = pgs.reduce((acc, p) => acc + (p.desconto || 0), 0);
              map[v.id] = round2(somaDescontos);
            } catch {
              map[v.id] = 0;
            }
          }
        })
      );
      setDescontosMap(map);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar vendas");
      toast.error("Erro ao conectar com a API de vendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendasFechadas();
  }, []);

  const handleOpenHistoricoModal = async (venda: Venda) => {
    setHistoricoModalVenda(venda);
    setPagamentosList([]);
    try {
      setLoadingPagamentos(true);
      if (venda.id) {
        const list = await apiPagamentosComanda.listarPorVenda(venda.id);
        setPagamentosList(list);
      }
    } catch (err: any) {
      toast.error("Erro ao carregar histórico de pagamentos.");
    } finally {
      setLoadingPagamentos(false);
    }
  };

  const filteredVendas = vendasFechadas.filter((v) => {
    const q = searchTerm.toLowerCase().trim();
    const isCancelada = v.status === "CANCELADA";
    const isEncerrada = Boolean(v.dataFimVenda) && !isCancelada;
    const isParcial = !isEncerrada && !isCancelada && Boolean(v.valorPago && v.valorPago > 0);

    if (statusFilter === "encerradas" && !isEncerrada) return false;
    if (statusFilter === "parciais" && !isParcial) return false;
    if (statusFilter === "canceladas" && !isCancelada) return false;

    if (!q) return true;
    return (
      v.id?.toString().includes(q) ||
      (v.mesa?.nome && v.mesa.nome.toLowerCase().includes(q)) ||
      (v.cliente?.nome && v.cliente.nome.toLowerCase().includes(q)) ||
      (v.tipoAtendimento && v.tipoAtendimento.toLowerCase().includes(q))
    );
  });

  const countCanceladas = vendasFechadas.filter((v) => v.status === "CANCELADA").length;
  const countEncerradas = vendasFechadas.filter((v) => Boolean(v.dataFimVenda) && v.status !== "CANCELADA").length;
  const countParciais = vendasFechadas.filter((v) => !v.dataFimVenda && v.status !== "CANCELADA" && Boolean(v.valorPago && v.valorPago > 0)).length;

  const totalFaturado = filteredVendas.reduce((acc, v) => {
    if (v.status === "CANCELADA") return acc;
    if (v.dataFimVenda) {
      return acc + (v.total || 0) + (v.valorPago || 0);
    }
    return acc + (v.valorPago || 0);
  }, 0);

  return (
    <AppShell
      title="Vendas encerradas e histórico"
      description={`${filteredVendas.length} comandas no histórico · ${brl(totalFaturado)} recebido.`}
      actions={
        <Button variant="outline" size="icon" onClick={fetchVendasFechadas} title="Recarregar">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      }
    >
      <Card className="shadow-card">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="todas">
                  Todas ({vendasFechadas.length})
                </TabsTrigger>
                <TabsTrigger value="encerradas">
                  Encerradas ({countEncerradas})
                </TabsTrigger>
                <TabsTrigger value="parciais">
                  Pagamento Parcial ({countParciais})
                </TabsTrigger>
                <TabsTrigger value="canceladas">
                  Canceladas ({countCanceladas})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Input
              placeholder="Buscar por nº da comanda, cliente ou mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 sm:max-w-72"
            />
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando histórico de vendas...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchVendasFechadas} className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredVendas.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <Lock className="size-8 text-muted-foreground/60 mb-2" />
              <p>Nenhuma comanda encontrada no histórico com este filtro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20 font-bold">Comanda</TableHead>
                    <TableHead className="font-bold">Mesa / Cliente</TableHead>
                    <TableHead className="font-bold">Atendimento</TableHead>
                    <TableHead className="font-bold">Abertura</TableHead>
                    <TableHead className="font-bold">Fechamento</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Total Bruto</TableHead>
                    <TableHead className="text-right font-bold">Total Pago</TableHead>
                    <TableHead className="text-right w-16 font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendas.map((v) => {
                    const defaultBadge = { label: "Consumo Local", style: "border-primary/25 bg-primary/10 text-primary", icon: Utensils };
                    const badge = (v.tipoAtendimento && channelBadge[v.tipoAtendimento]) || defaultBadge;
                    const IconComp = badge.icon;

                    const isEncerrada = Boolean(v.dataFimVenda);
                    const totalPagoVal = round2(v.valorPago || 0);
                    const descontosVal = round2(v.id ? (descontosMap[v.id] || 0) : 0);
                    const saldoPendenteVal = round2(v.total || 0);
                    const totalBrutoVal = round2(totalPagoVal + descontosVal + saldoPendenteVal);

                    return (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs">
                          #{v.id}
                        </TableCell>

                        <TableCell className="text-foreground text-xs">
                          {(() => {
                            const clienteNome = v.cliente?.nome || v.nomeCliente || "";
                            if (v.mesa?.nome) {
                              return clienteNome ? `${v.mesa.nome} - ${clienteNome}` : v.mesa.nome;
                            }
                            if (v.tipoAtendimento === "DELIVERY") {
                              return clienteNome ? `Delivery - ${clienteNome}` : "Delivery";
                            }
                            if (v.tipoAtendimento === "LOCAL" || v.tipoAtendimento === "SALAO") {
                              return clienteNome ? `Mesa - ${clienteNome}` : "Mesa";
                            }
                            return clienteNome ? `Balcão - ${clienteNome}` : "Balcão";
                          })()}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={`${badge.style} text-xs flex items-center gap-1 w-fit border-border/50`}>
                            <IconComp className="size-3" /> {badge.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {v.dataInicioVenda
                            ? new Date(v.dataInicioVenda).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </TableCell>

                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {v.dataFimVenda
                            ? new Date(v.dataFimVenda).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </TableCell>

                        <TableCell>
                          {v.status === "CANCELADA" ? (
                            <Badge
                              variant="outline"
                              className="border-destructive/25 bg-destructive/10 text-destructive text-xs"
                            >
                              Cancelada
                            </Badge>
                          ) : isEncerrada ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/25 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 text-xs"
                            >
                              Encerrada
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/12 text-amber-600 dark:text-amber-400 text-xs"
                            >
                              Parcial
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell
                          className={`text-right font-mono text-xs ${
                            v.status === "CANCELADA" ? "text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {brl(totalBrutoVal)}
                        </TableCell>

                        <TableCell
                          className={`text-right font-mono text-xs ${
                            v.status === "CANCELADA"
                              ? "text-muted-foreground"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {brl(totalPagoVal)}
                        </TableCell>

                        <TableCell className="text-right">
                          {v.status === "CANCELADA" ? (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setMotivoModalVenda(v)}
                              className="size-8 text-amber-600 dark:text-amber-400 hover:text-amber-700 border border-amber-500/30 bg-amber-500/10 ml-auto shrink-0"
                              title="Ver motivo do cancelamento"
                            >
                              <Info className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenHistoricoModal(v)}
                              className="size-8 text-muted-foreground hover:text-foreground border border-input/40 ml-auto shrink-0"
                              title="Ver Histórico de Pagamentos"
                            >
                              <History className="size-4" />
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
        </CardContent>
      </Card>

      {/* MODAL HISTÓRICO DE PAGAMENTOS DA COMANDA */}
      <Dialog open={historicoModalVenda !== null} onOpenChange={(open) => !open && setHistoricoModalVenda(null)}>
        <DialogContent className="sm:max-w-3xl sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <History className="size-5 text-primary" />
              Histórico de Pagamentos — Comanda #{historicoModalVenda?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Rastreabilidade completa de todas as movimentações e pagamentos efetuados nesta comanda.
            </DialogDescription>
          </DialogHeader>

          {historicoModalVenda && (() => {
            const pagamentos = pagamentosList;
            const temPagamentos = pagamentos.length > 0;

            const totalPagoCalculado = temPagamentos
              ? round2(pagamentos.reduce((acc, p) => acc + (p.valorPago || 0), 0))
              : round2(historicoModalVenda.valorPago || historicoModalVenda.total || 0);

            const totalDescontosCalculado = temPagamentos
              ? round2(pagamentos.reduce((acc, p) => acc + (p.desconto || 0), 0))
              : 0;

            const isEncerrada = Boolean(historicoModalVenda.dataFimVenda);

            const totalBrutoConsumido = round2(
              isEncerrada
                ? (totalPagoCalculado + totalDescontosCalculado)
                : ((historicoModalVenda.total || 0) + totalPagoCalculado + totalDescontosCalculado)
            );

            const totalLiquidoCaixa = totalPagoCalculado;
            const saldoPendenteComanda = isEncerrada ? 0 : round2(Math.max(0, totalBrutoConsumido - totalDescontosCalculado - totalPagoCalculado));

            return (
              <div className="space-y-4 pt-2 text-xs">
                {/* RESUMO DE RASTREABILIDADE DA COMANDA */}
                <div className="p-3.5 border rounded-xl bg-card space-y-2.5 shadow-2xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                      <User className="size-4 text-primary shrink-0" />
                      {historicoModalVenda.cliente?.nome || historicoModalVenda.nomeCliente || "Cliente Balcão"}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        isEncerrada
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5"
                          : "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5"
                      }
                    >
                      {isEncerrada ? "Comanda Encerrada" : "Comanda Aberta (Com Parciais)"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs font-mono">
                    <div className="p-2 bg-muted/40 rounded-lg border">
                      <p className="text-[10px] text-muted-foreground font-sans font-semibold">Total Bruto Consumido</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{brl(totalBrutoConsumido)}</p>
                    </div>

                    <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans font-semibold">Total de Descontos</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{brl(totalDescontosCalculado)}</p>
                    </div>

                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans font-semibold">Total Líquido Recebido</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{brl(totalLiquidoCaixa)}</p>
                    </div>

                    <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-sans font-semibold">Saldo Pendente</p>
                      <p className={cn("text-sm font-bold mt-0.5", saldoPendenteComanda > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                        {brl(saldoPendenteComanda)}
                      </p>
                    </div>
                  </div>
                </div>

              {/* LISTA / TABELA DE PAGAMENTOS REGISTRADOS */}
              {loadingPagamentos ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Carregando pagamentos da comanda...
                </div>
              ) : pagamentosList.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground border rounded-xl bg-card p-4 text-center">
                  <Receipt className="size-8 text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground">Nenhum pagamento registrado individualmente</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Esta comanda foi quitada integralmente no encerramento.
                  </p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs font-bold whitespace-nowrap">Data / Hora</TableHead>
                        <TableHead className="text-xs font-bold whitespace-nowrap">Tipo</TableHead>
                        <TableHead className="text-xs font-bold whitespace-nowrap">Forma</TableHead>
                        <TableHead className="text-xs font-bold text-right whitespace-nowrap">Total no Ato</TableHead>
                        <TableHead className="text-xs font-bold text-right whitespace-nowrap">Desconto</TableHead>
                        <TableHead className="text-xs font-bold text-right whitespace-nowrap">Valor Pago</TableHead>
                        <TableHead className="text-xs font-bold text-right whitespace-nowrap">Saldo Restante no Ato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagamentosList.map((p) => (
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
                            <Badge
                              variant="outline"
                              className={
                                p.tipo === "TOTAL"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px]"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 text-[10px]"
                              }
                            >
                              {p.tipo === "TOTAL" ? "Encerramento" : "Parcial"}
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

                          <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                            {brl(p.valorPago || 0)}
                          </TableCell>

                          <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">
                            {brl(p.saldoRestante || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      {/* MODAL MOTIVO DO CANCELAMENTO DA COMANDA */}
      <Dialog open={motivoModalVenda !== null} onOpenChange={(open) => !open && setMotivoModalVenda(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5 shrink-0" />
              Motivo do Cancelamento — Comanda #{motivoModalVenda?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div className="text-xs text-muted-foreground">
              Comanda referente a:{" "}
              <span className="font-semibold text-foreground">
                {motivoModalVenda?.mesa?.nome
                  ? motivoModalVenda.mesa.nome
                  : (motivoModalVenda?.cliente?.nome || motivoModalVenda?.nomeCliente || (motivoModalVenda?.tipoAtendimento === "LOCAL" || motivoModalVenda?.tipoAtendimento === "SALAO" ? "Mesa" : "Balcão"))}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-sm text-foreground space-y-1">
              <p className="font-semibold text-xs text-destructive">Motivo registrado:</p>
              <p className="leading-relaxed text-xs">
                {motivoModalVenda?.motivoCancelamento || "Exclusão de comanda solicitada pelo operador."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setMotivoModalVenda(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
