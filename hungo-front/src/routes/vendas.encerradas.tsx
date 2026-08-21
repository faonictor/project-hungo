import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { RefreshCw, Lock, History, Info, ShoppingBag } from "lucide-react";
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
import { toast } from "sonner";
import { apiVendas, apiPagamentosComanda, apiFluxoFinanceiro, Venda, PagamentoComanda } from "@/lib/api";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { HistoricoPagamentosModal } from "@/components/vendas/HistoricoPagamentosModal";
import { MotivoCancelamentoModal } from "@/components/vendas/MotivoCancelamentoModal";
import { EstornoPagamentoModal } from "@/components/vendas/EstornoPagamentoModal";
import { VerPedidosVendaModal } from "@/components/vendas/VerPedidosVendaModal";
import { brl } from "@/lib/mock-data";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

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

function VendasEncerradasPage() {
  const [vendasFechadas, setVendasFechadas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");

  const [pedidosModalVenda, setPedidosModalVenda] = useState<Venda | null>(null);
  const [historicoModalVenda, setHistoricoModalVenda] = useState<Venda | null>(null);
  const [motivoModalVenda, setMotivoModalVenda] = useState<Venda | null>(null);
  const [estornoModalVenda, setEstornoModalVenda] = useState<Venda | null>(null);
  const [savingEstorno, setSavingEstorno] = useState(false);
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

  const handleConfirmarEstorno = async (payload: {
    valorEstorno: number;
    motivo: string;
    formaEstorno: string;
  }) => {
    if (!estornoModalVenda || !estornoModalVenda.id) return;
    try {
      setSavingEstorno(true);
      const novoValorPago = round2(
        Math.max(0, (estornoModalVenda.valorPago || 0) - payload.valorEstorno)
      );

      // 1. Atualiza o valor pago da comanda
      await apiVendas.atualizar(estornoModalVenda.id, {
        ...estornoModalVenda,
        valorPago: novoValorPago,
      });

      // 2. Registra estorno na tabela de pagamentos da comanda
      try {
        await apiPagamentosComanda.salvar({
          venda: { id: estornoModalVenda.id } as Venda,
          valorPago: -payload.valorEstorno,
          formaPagamento: payload.formaEstorno,
          tipo: "ESTORNO",
          totalAntes: estornoModalVenda.valorPago || 0,
          saldoRestante: novoValorPago,
          desconto: 0,
          dataPagamento: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Erro ao registrar estorno em pagamentos-comanda:", e);
      }

      // 3. Registra saída no fluxo financeiro
      try {
        await apiFluxoFinanceiro.salvar({
          nome: `Estorno Comanda #${estornoModalVenda.id} - ${payload.formaEstorno}`,
          descricao: `Estorno/Devolução ao cliente: ${payload.motivo}`,
          transacao: "Saída",
          fluxo: payload.valorEstorno,
          dataTransacao: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Erro ao registrar estorno no fluxo financeiro:", e);
      }

      toast.success(`Estorno de ${brl(payload.valorEstorno)} registrado com sucesso!`);
      const targetId = estornoModalVenda.id;
      setEstornoModalVenda(null);
      await fetchVendasFechadas();

      if (historicoModalVenda && historicoModalVenda.id === targetId) {
        const list = await apiPagamentosComanda.listarPorVenda(targetId);
        setPagamentosList(list);
        setHistoricoModalVenda({ ...estornoModalVenda, valorPago: novoValorPago });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar estorno.");
    } finally {
      setSavingEstorno(false);
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
  const countParciais = vendasFechadas.filter(
    (v) => !v.dataFimVenda && v.status !== "CANCELADA" && Boolean(v.valorPago && v.valorPago > 0)
  ).length;

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
                <TabsTrigger value="todas">Todas ({vendasFechadas.length})</TabsTrigger>
                <TabsTrigger value="encerradas">Encerradas ({countEncerradas})</TabsTrigger>
                <TabsTrigger value="parciais">Pagamento Parcial ({countParciais})</TabsTrigger>
                <TabsTrigger value="canceladas">Canceladas ({countCanceladas})</TabsTrigger>
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
            <LoadingState message="Carregando histórico de vendas..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchVendasFechadas} />
          ) : filteredVendas.length === 0 ? (
            <EmptyState
              icon={Lock}
              title="Nenhuma comanda encontrada no histórico com este filtro."
            />
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
                    const isEncerrada = Boolean(v.dataFimVenda);
                    const totalPagoVal = round2(v.valorPago || 0);
                    const descontosVal = round2(v.id ? descontosMap[v.id] || 0 : 0);
                    const saldoPendenteVal = round2(v.total || 0);
                    const totalBrutoVal = round2(totalPagoVal + descontosVal + saldoPendenteVal);

                    const clienteNome = v.cliente?.nome || v.nomeCliente || "";
                    const displayMesaCliente = v.mesa?.nome
                      ? clienteNome
                        ? `${v.mesa.nome} - ${clienteNome}`
                        : v.mesa.nome
                      : v.tipoAtendimento === "DELIVERY"
                      ? clienteNome
                        ? `Delivery - ${clienteNome}`
                        : "Delivery"
                      : clienteNome
                      ? `Balcão - ${clienteNome}`
                      : "Balcão";

                    return (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs">#{v.id}</TableCell>
                        <TableCell className="text-foreground text-xs whitespace-nowrap">
                          {displayMesaCliente}
                        </TableCell>
                        <TableCell>
                          <ChannelBadge tipo={v.tipoAtendimento} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono whitespace-nowrap">
                          {v.dataInicioVenda
                            ? new Date(v.dataInicioVenda).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono whitespace-nowrap">
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
                              className="border-destructive/25 bg-destructive/10 text-destructive text-xs whitespace-nowrap"
                            >
                              Cancelada
                            </Badge>
                          ) : isEncerrada ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/25 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 text-xs whitespace-nowrap"
                            >
                              Encerrada
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/12 text-amber-600 dark:text-amber-400 text-xs whitespace-nowrap"
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
                          <div className="flex justify-end gap-1 items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPedidosModalVenda(v)}
                              className="size-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 shrink-0 cursor-pointer"
                              title="Visualizar Pedidos da Venda"
                            >
                              <ShoppingBag className="size-4" />
                            </Button>
                            {v.status === "CANCELADA" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMotivoModalVenda(v)}
                                className="size-8 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-500/10 shrink-0 cursor-pointer"
                                title="Ver motivo do cancelamento"
                              >
                                <Info className="size-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenHistoricoModal(v)}
                                className="size-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 shrink-0 cursor-pointer"
                                title="Ver Histórico de Pagamentos"
                              >
                                <History className="size-4" />
                              </Button>
                            )}
                          </div>
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

      <VerPedidosVendaModal
        venda={pedidosModalVenda}
        open={pedidosModalVenda !== null}
        onOpenChange={(open) => !open && setPedidosModalVenda(null)}
      />

      <HistoricoPagamentosModal
        venda={historicoModalVenda}
        pagamentosList={pagamentosList}
        loading={loadingPagamentos}
        open={historicoModalVenda !== null}
        onOpenChange={(open) => !open && setHistoricoModalVenda(null)}
        onAbrirEstorno={(v) => setEstornoModalVenda(v)}
      />

      <EstornoPagamentoModal
        venda={estornoModalVenda}
        open={estornoModalVenda !== null}
        onOpenChange={(open) => !open && setEstornoModalVenda(null)}
        loading={savingEstorno}
        onConfirm={handleConfirmarEstorno}
      />

      <MotivoCancelamentoModal
        venda={motivoModalVenda}
        open={motivoModalVenda !== null}
        onOpenChange={(open) => !open && setMotivoModalVenda(null)}
      />
    </AppShell>
  );
}
