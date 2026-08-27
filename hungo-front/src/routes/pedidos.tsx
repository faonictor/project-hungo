import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { RefreshCw, Eye, Trash2, ShoppingBag, Clock } from "lucide-react";
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
import {
  apiPedidos,
  apiProdutos,
  apiVendas,
  apiPagamentosComanda,
  apiFluxoFinanceiro,
  Pedido,
  PedidoDTO,
  Produto,
  Venda,
} from "@/lib/api";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { PedidoDetalhesModal } from "@/components/pedidos/PedidoDetalhesModal";
import { CancelarPedidoModal } from "@/components/pedidos/CancelarPedidoModal";
import { ImprimirPedidoDialog } from "@/components/pedidos/ImprimirPedidoDialog";
import { PerguntaEstornoPedidoModal } from "@/components/pedidos/PerguntaEstornoPedidoModal";
import { EstornoPagamentoModal } from "@/components/vendas/EstornoPagamentoModal";
import { printKitchenTicket } from "@/lib/ticket-printer";
import { brl } from "@/lib/mock-data";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos — Hungo" },
      {
        name: "description",
        content: "Acompanhe todos os pedidos do salão, balcão e delivery com status em tempo real.",
      },
    ],
  }),
  component: PedidosPage,
});

function formatTempoPreparo(p: Pedido, now: Date): string {
  if (p.statusPedido === "Aberto") return "Não iniciado";
  if ((p.statusPedido || "").toLowerCase() === "cancelado") return "-";

  const startDateStr = p.dataInicioPreparo || p.dataHora;
  if (!startDateStr) return "-";

  const start = new Date(startDateStr).getTime();
  if (isNaN(start)) return "-";

  let end: number;
  if (p.statusPedido === "Concluído" || p.statusPedido === "Concluido") {
    end = p.dataFimPreparo ? new Date(p.dataFimPreparo).getTime() : now.getTime();
  } else {
    end = now.getTime();
  }

  if (isNaN(end)) return "-";

  const diffMs = Math.max(0, end - start);
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0) {
    return `${hours}h ${mins < 10 ? "0" : ""}${mins} min`;
  }
  return `${mins} min`;
}

function PedidosPage() {
  const [pedidosList, setPedidosList] = useState<Pedido[]>([]);
  const [produtosList, setProdutosList] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [pedidoDetalhe, setPedidoDetalhe] = useState<PedidoDTO | null>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [mostrarItensCancelados, setMostrarItensCancelados] = useState<boolean>(false);

  const [cancelPedidoTarget, setCancelPedidoTarget] = useState<Pedido | null>(null);
  const [motivoOpcao, setMotivoOpcao] = useState<string>("Item indisponível no estoque");
  const [motivoObservacao, setMotivoObservacao] = useState<string>("");
  const [cancelingPedido, setCancelingPedido] = useState(false);

  const [perguntaEstornoData, setPerguntaEstornoData] = useState<{
    pedido: Pedido;
    venda: Venda | null;
    valorPedido: number;
    motivoCancelamento: string;
  } | null>(null);
  const [estornoModalVenda, setEstornoModalVenda] = useState<Venda | null>(null);
  const [estornoValorSugerido, setEstornoValorSugerido] = useState<number>(0);
  const [estornoMotivoSugerido, setEstornoMotivoSugerido] = useState<string>("");
  const [savingEstorno, setSavingEstorno] = useState<boolean>(false);

  const [pedidoParaImprimir, setPedidoParaImprimir] = useState<Pedido | null>(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiPedidos.listar();
      setPedidosList(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar pedidos");
      toast.error("Erro ao conectar com a API de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    apiProdutos.listar().then(setProdutosList).catch(console.error);
  }, []);

  const handleOpenDetalhesModal = async (pedidoId: number) => {
    setSelectedPedidoId(pedidoId);
    setPedidoDetalhe(null);
    try {
      setLoadingDetalhes(true);
      const [dto, prods] = await Promise.all([
        apiPedidos.buscarPorId(pedidoId),
        apiProdutos.listar(),
      ]);
      setPedidoDetalhe(dto);
      setProdutosList(prods);
    } catch (err: any) {
      toast.error("Erro ao carregar detalhes do pedido.");
      setSelectedPedidoId(null);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const handleAvancarStatus = async (nextStatus: string) => {
    if (!pedidoDetalhe || !selectedPedidoId) return;
    if (
      pedidoDetalhe.statusPedido === "Concluído" ||
      pedidoDetalhe.statusPedido === "Concluido" ||
      pedidoDetalhe.statusPedido === "Cancelado"
    ) {
      toast.error("Pedidos concluídos ou cancelados não podem ter seu status alterado.");
      return;
    }
    try {
      setSavingStatus(true);
      const updatedDto: PedidoDTO = {
        ...pedidoDetalhe,
        statusPedido: nextStatus,
      };
      await apiPedidos.atualizar(selectedPedidoId, updatedDto);
      toast.success(`Status do pedido #${selectedPedidoId} atualizado para ${nextStatus}!`);

      const currentPedidoObj = pedidosList.find((p) => p.id === selectedPedidoId);
      setSelectedPedidoId(null);
      fetchPedidos();

      if (nextStatus === "Em preparo" && currentPedidoObj) {
        setPedidoParaImprimir(currentPedidoObj);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar status do pedido.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleOpenCancelModal = (p: Pedido) => {
    if (
      p.statusPedido === "Concluído" ||
      p.statusPedido === "Concluido" ||
      p.statusPedido === "Cancelado"
    ) {
      toast.error("Pedidos concluídos ou cancelados não podem ser removidos.");
      return;
    }
    setCancelPedidoTarget(p);
    setMotivoOpcao("Cliente desistiu");
    setMotivoObservacao("");
  };

  const handleConfirmarCancelamentoPedido = async () => {
    if (!cancelPedidoTarget) return;
    const motivoTexto = `${motivoOpcao}${motivoObservacao.trim() ? `: ${motivoObservacao.trim()}` : ""}`;
    const targetPedido = cancelPedidoTarget;
    const valorTotalPedido = round2(
      targetPedido.itens?.reduce((acc, i) => acc + (i.total || 0), 0) || 0
    );

    try {
      setCancelingPedido(true);
      await apiPedidos.cancelarDaComanda(targetPedido.id, motivoTexto);
      toast.success(`Pedido #${targetPedido.id} cancelado e removido da comanda!`);
      setCancelPedidoTarget(null);
      await fetchPedidos();

      // Busca dados atualizados da venda associada para verificar valor pago
      let vendaAssociada: Venda | null = targetPedido.venda || null;
      if (targetPedido.venda?.id) {
        try {
          vendaAssociada = await apiVendas.buscarPorId(targetPedido.venda.id);
        } catch {
          vendaAssociada = targetPedido.venda || null;
        }
      }

      if (valorTotalPedido > 0 && vendaAssociada && (vendaAssociada.valorPago || 0) > 0) {
        setPerguntaEstornoData({
          pedido: targetPedido,
          venda: vendaAssociada,
          valorPedido: valorTotalPedido,
          motivoCancelamento: motivoTexto,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar pedido.");
    } finally {
      setCancelingPedido(false);
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
        });
      } catch (e) {
        console.error("Erro ao registrar estorno em pagamentos-comanda:", e);
      }

      // 3. Registra saída no fluxo financeiro
      try {
        await apiFluxoFinanceiro.salvar({
          nome: `Estorno Pedido #${perguntaEstornoData?.pedido.id || ""} - Comanda #${estornoModalVenda.id}`,
          descricao: `Estorno/Devolução ao cliente: ${payload.motivo}`,
          transacao: "Saída",
          fluxo: payload.valorEstorno,
        });
      } catch (e) {
        console.error("Erro ao registrar estorno no fluxo financeiro:", e);
      }

      toast.success(`Estorno de ${brl(payload.valorEstorno)} registrado com sucesso!`);
      setEstornoModalVenda(null);
      setPerguntaEstornoData(null);
      fetchPedidos();
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar estorno.");
    } finally {
      setSavingEstorno(false);
    }
  };

  const activePedidos = pedidosList.filter((p) => {
    const status = (p.statusPedido || "").toLowerCase();
    const isConcluido = status === "concluído" || status === "concluido";
    const isCancelado = status === "cancelado" || p.venda?.status === "CANCELADA";
    const isVendaEncerrada = Boolean(p.venda?.dataFimVenda);
    return !isConcluido && !isCancelado && !isVendaEncerrada && (p.statusPedido === "Aberto" || p.statusPedido === "Em preparo");
  });

  const filteredPedidos = (() => {
    let list = activePedidos.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.id.toString().includes(q) ||
        p.venda?.id?.toString().includes(q) ||
        p.venda?.numeroComanda?.toString().includes(q) ||
        (p.cliente?.nome && p.cliente.nome.toLowerCase().includes(q)) ||
        (p.venda?.mesa?.nome && p.venda.mesa.nome.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === "abertos") return p.statusPedido === "Aberto";
      if (statusFilter === "preparo") return p.statusPedido === "Em preparo";
      return true;
    });

    return [...list].sort((a, b) => a.id - b.id);
  })();

  const activeSelectedPedidoObj = pedidosList.find((p) => p.id === selectedPedidoId);

  return (
    <AppShell
      title="Pedidos"
      description="Gerenciamento da fila de pedidos da cozinha e status de preparo em tempo real."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchPedidos} title="Recarregar">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      }
    >
      <Card className="shadow-card">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="todos">Todos ({activePedidos.length})</TabsTrigger>
                <TabsTrigger
                  value="abertos"
                  className="data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400"
                >
                  Aberto ({activePedidos.filter((p) => p.statusPedido === "Aberto").length})
                </TabsTrigger>
                <TabsTrigger
                  value="preparo"
                  className="data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400"
                >
                  Em preparo ({activePedidos.filter((p) => p.statusPedido === "Em preparo").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              placeholder="Buscar por cliente, nº ou mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 sm:max-w-64"
            />
          </div>

          {loading ? (
            <LoadingState message="Carregando pedidos da API..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchPedidos} />
          ) : filteredPedidos.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Nenhum pedido em aberto ou em preparo."
              description="Novos pedidos lançados nas comandas aparecerão nesta fila de atendimento."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Comanda</TableHead>
                    <TableHead>Atendimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tempo de Preparo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPedidos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold font-mono text-xs">
                        #{p.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <p className="font-medium text-foreground whitespace-nowrap">
                          {p.cliente?.nome ||
                            p.venda?.cliente?.nome ||
                            p.venda?.nomeCliente ||
                            (p.venda?.mesa?.nome ? `Consumo Local (${p.venda.mesa.nome})` : "Consumo Local")}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {p.dataHora
                            ? new Date(p.dataHora).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-border bg-muted/50 text-foreground text-xs font-mono font-medium whitespace-nowrap"
                        >
                          Comanda #{p.venda?.numeroComanda || p.venda?.id || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChannelBadge
                          tipo={p.tipoPedido || p.venda?.tipoAtendimento || "LOCAL"}
                          mesaNome={p.venda?.mesa?.nome}
                        />
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={p.statusPedido || "Aberto"} />
                      </TableCell>
                      <TableCell>
                        {p.statusPedido === "Aberto" ? (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-border font-mono text-xs whitespace-nowrap"
                          >
                            <Clock className="size-3 mr-1 inline-block text-muted-foreground shrink-0" />{" "}
                            Não iniciado
                          </Badge>
                        ) : p.statusPedido === "Em preparo" || p.statusPedido === "Concluído" || p.statusPedido === "Concluido" ? (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-border font-mono text-xs whitespace-nowrap"
                          >
                            <Clock className="size-3 mr-1 inline-block text-muted-foreground shrink-0" />{" "}
                            {formatTempoPreparo(p, now)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs font-mono font-medium whitespace-nowrap">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 items-center">
                          {(() => {
                            const hasItensCancelados = (p.itens || []).some(
                              (item) => (item.statusItem || "").toUpperCase() === "CANCELADO"
                            );
                            return (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDetalhesModal(p.id)}
                                className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer relative"
                                title="Ver Detalhes do Pedido"
                              >
                                <Eye className="size-4" />
                                {hasItensCancelados && (
                                  <span
                                    className="absolute top-0.5 right-0.5 size-2.5 rounded-full bg-destructive border-2 border-background animate-pulse"
                                    title="Este pedido possui itens cancelados/removidos"
                                  />
                                )}
                              </Button>
                            );
                          })()}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenCancelModal(p)}
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Cancelar / Excluir Pedido"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PedidoDetalhesModal
        pedidoId={selectedPedidoId}
        pedidoDetalhe={pedidoDetalhe}
        pedidoListItem={activeSelectedPedidoObj}
        produtosList={produtosList}
        loading={loadingDetalhes}
        savingStatus={savingStatus}
        mostrarItensCancelados={mostrarItensCancelados}
        onMostrarItensCanceladosChange={setMostrarItensCancelados}
        onOpenChange={(open) => !open && setSelectedPedidoId(null)}
        onAvancarStatus={handleAvancarStatus}
        onOpenCancelModal={handleOpenCancelModal}
        onImprimir={(target) => printKitchenTicket(target, { produtosList })}
        tempoPreparoText={
          activeSelectedPedidoObj ? formatTempoPreparo(activeSelectedPedidoObj, now) : "-"
        }
      />

      <CancelarPedidoModal
        pedido={cancelPedidoTarget}
        open={cancelPedidoTarget !== null}
        onOpenChange={(open) => !open && setCancelPedidoTarget(null)}
        motivoOpcao={motivoOpcao}
        onMotivoOpcaoChange={setMotivoOpcao}
        motivoObservacao={motivoObservacao}
        onMotivoObservacaoChange={setMotivoObservacao}
        onConfirm={handleConfirmarCancelamentoPedido}
        loading={cancelingPedido}
      />

      <PerguntaEstornoPedidoModal
        open={perguntaEstornoData !== null}
        onOpenChange={(open) => !open && setPerguntaEstornoData(null)}
        pedido={perguntaEstornoData?.pedido || null}
        venda={perguntaEstornoData?.venda || null}
        valorPedido={perguntaEstornoData?.valorPedido || 0}
        motivoCancelamento={perguntaEstornoData?.motivoCancelamento || ""}
        onDecisaoEstornar={() => {
          if (perguntaEstornoData) {
            setEstornoModalVenda(perguntaEstornoData.venda);
            setEstornoValorSugerido(perguntaEstornoData.valorPedido);
            setEstornoMotivoSugerido(
              `Cancelamento Pedido #${perguntaEstornoData.pedido.id}: ${perguntaEstornoData.motivoCancelamento}`
            );
          }
        }}
        onNaoEstornar={() => setPerguntaEstornoData(null)}
      />

      <EstornoPagamentoModal
        venda={estornoModalVenda}
        open={estornoModalVenda !== null}
        onOpenChange={(open) => !open && setEstornoModalVenda(null)}
        valorSugerido={estornoValorSugerido}
        motivoSugerido={estornoMotivoSugerido}
        loading={savingEstorno}
        onConfirm={handleConfirmarEstorno}
      />

      <ImprimirPedidoDialog
        pedido={pedidoParaImprimir}
        produtosList={produtosList}
        open={pedidoParaImprimir !== null}
        onOpenChange={(open) => !open && setPedidoParaImprimir(null)}
        onPrint={() => {
          const target = pedidoParaImprimir;
          setPedidoParaImprimir(null);
          printKitchenTicket(target, { produtosList });
        }}
      />
    </AppShell>
  );
}
