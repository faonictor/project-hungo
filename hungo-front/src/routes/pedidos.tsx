import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Eye, EyeOff, Pencil, Trash2, ShoppingBag, X, Clock, CheckCircle2, XCircle, AlertTriangle, MapPin, User, Truck, FileText, Printer, Save, Utensils } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import {
  apiPedidos,
  apiProdutos,
  Pedido,
  PedidoDTO,
  Produto,
  ItemPedidoDTO,
} from "@/lib/api";
import { brl } from "@/lib/mock-data";

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

const statusTone: Record<string, string> = {
  Aberto: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 font-semibold",
  "Em preparo": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 font-semibold",
  Concluído: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  Concluido: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  Entregue: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  Pago: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
  cancelado: "bg-destructive/10 text-destructive border-destructive/25 font-semibold",
  Cancelado: "bg-destructive/10 text-destructive border-destructive/25 font-semibold",
  CANCELADO: "bg-destructive/10 text-destructive border-destructive/25 font-semibold",
};

function formatTempoPreparo(p: Pedido, now: Date): string {
  if (p.statusPedido === "Aberto" || (p.statusPedido || "").toLowerCase() === "cancelado") return "-";

  const startDateStr = p.dataInicioPreparo || p.dataHora;
  if (!startDateStr) return "-";

  const start = new Date(startDateStr).getTime();
  if (isNaN(start)) return "-";

  let end: number;
  if (p.statusPedido === "Concluído" || p.statusPedido === "Concluido") {
    if (p.dataFimPreparo) {
      end = new Date(p.dataFimPreparo).getTime();
    } else {
      end = now.getTime();
    }
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("abertos");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const [produtosList, setProdutosList] = useState<Produto[]>([]);

  // Detalhes / Editar Pedido Modal State
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [pedidoDetalhe, setPedidoDetalhe] = useState<PedidoDTO | null>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [novoStatus, setNovoStatus] = useState<string>("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [mostrarItensCancelados, setMostrarItensCancelados] = useState<boolean>(false);

  // Modal de Motivo do Cancelamento do Pedido
  const [cancelPedidoTarget, setCancelPedidoTarget] = useState<Pedido | null>(null);
  const [motivoOpcao, setMotivoOpcao] = useState<string>("Item indisponível no estoque");
  const [motivoObservacao, setMotivoObservacao] = useState<string>("");
  const [cancelingPedido, setCancelingPedido] = useState(false);

  // Modal e Função de Impressão de Via de Cozinha / Produção
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState<Pedido | null>(null);

  const handleImprimirViaCozinha = async (pedidoInput: Pedido | PedidoDTO | null) => {
    if (!pedidoInput || !pedidoInput.id) return;

    let fullPedido: any = pedidoInput;
    let fullItens: any[] = (pedidoInput as any).itens || [];

    // Garantir produtos carregados
    let prods = produtosList;
    if (prods.length === 0) {
      try {
        prods = await apiProdutos.listar();
        setProdutosList(prods);
      } catch (e) {
        console.error("Erro ao carregar produtos:", e);
      }
    }

    // Se itens estiverem vazios, busca da API por ID
    if (!fullItens || fullItens.length === 0) {
      try {
        const dto = await apiPedidos.buscarPorId(pedidoInput.id);
        if (dto && dto.itens) {
          fullItens = dto.itens;
          fullPedido = { ...pedidoInput, ...dto };
        }
      } catch (e) {
        console.error("Erro ao buscar detalhes do pedido para impressão:", e);
      }
    }

    const itensValidos = (fullItens || []).filter(
      (i: any) => String(i.statusItem || "").toUpperCase() !== "CANCELADO"
    );

    const comandaId = fullPedido.venda?.id || fullPedido.vendaId;
    const mesaNome = fullPedido.venda?.mesa?.nome || (fullPedido as any).mesa?.nome;

    let comandaMesaText = "";
    if (comandaId && mesaNome) {
      comandaMesaText = `Comanda #${comandaId} - ${mesaNome}`;
    } else if (comandaId) {
      comandaMesaText = `Comanda #${comandaId}`;
    } else if (mesaNome) {
      comandaMesaText = mesaNome;
    } else {
      comandaMesaText = "Balcão";
    }

    const clienteNome =
      fullPedido.cliente?.nome ||
      fullPedido.venda?.cliente?.nome ||
      fullPedido.venda?.nomeCliente ||
      fullPedido.nomeCliente ||
      "Cliente Balcão";

    const rawTipo = (fullPedido.tipoPedido || "").toUpperCase();
    const canal = (rawTipo === "DELIVERY" || rawTipo === "ENTREGA")
      ? "Delivery"
      : (rawTipo === "RETIRADA" || rawTipo === "BALCAO")
      ? "Retirada"
      : "Consumo Local";

    const dataHora = fullPedido.dataHora
      ? new Date(fullPedido.dataHora).toLocaleString("pt-BR")
      : new Date().toLocaleString("pt-BR");

    const rowsHtml = itensValidos
      .map((item: any) => {
        const prodId = item.produtoId || item.produto?.id;
        const prod = prods.find((p) => p.id === prodId);
        const nomeProd =
          item.produto?.nome ||
          item.nomeProduto ||
          item.nome ||
          prod?.nome ||
          `Produto #${prodId || item.id || ""}`;
        const obsText = item.observacao || item.obs || "";

        return `
          <tr>
            <td class="qtd" style="font-weight:bold; font-size:13px; width:35px;">${item.quantidade || 1}x</td>
            <td>
              <div class="item-name" style="font-weight:bold; font-size:13px;">${nomeProd}</div>
              ${obsText ? `<div class="obs" style="font-size:11px; font-style:italic; margin-top:2px; padding-left:4px; font-weight:bold;">* Obs: ${obsText}</div>` : ""}
            </td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      toast.error("Permita janelas pop-up para imprimir a via de produção.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Via de Produção - Pedido #${fullPedido.id}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 280px;
              margin: 0 auto;
              padding: 10px;
              font-size: 12px;
              color: #000;
            }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .title { font-size: 16px; font-weight: bold; }
            .subtitle { font-size: 11px; margin-top: 4px; }
            .info { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; font-size: 11px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .items-table th { border-bottom: 1px solid #000; text-align: left; font-size: 11px; padding-bottom: 4px; }
            .items-table td { padding: 4px 0; vertical-align: top; border-bottom: 1px dotted #ccc; }
            .footer { text-align: center; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">HUNGO PDV</div>
            <div class="subtitle">*** VIA DE PRODUÇÃO / COZINHA ***</div>
          </div>
          <div class="info">
            <div class="info-row"><strong>PEDIDO #${fullPedido.id}</strong> <span>${dataHora}</span></div>
            <div class="info-row"><strong>Atendimento:</strong> <span>${canal}</span></div>
            <div class="info-row"><strong>Comanda/Mesa:</strong> <span>${comandaMesaText}</span></div>
            <div class="info-row"><strong>Cliente:</strong> <span>${clienteNome}</span></div>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>QTD</th>
                <th>ITEM / OBSERVAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="2" style="text-align:center; padding:10px;">Sem itens a preparar</td></tr>`}
            </tbody>
          </table>
          <div class="footer">
            <p>HUNGO PDV — Impresso em ${new Date().toLocaleTimeString("pt-BR")}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleOpenCancelModal = (p: Pedido) => {
    if (p.statusPedido === "Concluído" || p.statusPedido === "Concluido" || p.statusPedido === "Cancelado") {
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
    try {
      setCancelingPedido(true);
      await apiPedidos.cancelarDaComanda(cancelPedidoTarget.id, motivoTexto);
      toast.success(`Pedido #${cancelPedidoTarget.id} cancelado e removido da comanda!`);
      setCancelPedidoTarget(null);
      fetchPedidos();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar pedido.");
    } finally {
      setCancelingPedido(false);
    }
  };

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



  // --- DETALHES / ALTERAR STATUS DO PEDIDO ---
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
      setNovoStatus(dto.statusPedido || "Aberto");
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
    if (pedidoDetalhe.statusPedido === "Concluído" || pedidoDetalhe.statusPedido === "Concluido" || pedidoDetalhe.statusPedido === "Cancelado") {
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



  // Filtragem e Ordenação por Índice
  const filteredPedidos = (() => {
    let list = pedidosList.filter((p) => {
      const matchesSearch =
        p.id.toString().includes(searchTerm) ||
        (p.cliente?.nome && p.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.venda?.mesa?.nome && p.venda.mesa.nome.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "abertos") return p.statusPedido === "Aberto";
      if (statusFilter === "preparo") return p.statusPedido === "Em preparo";
      if (statusFilter === "concluidos") return p.statusPedido === "Concluído" || p.statusPedido === "Concluido";
      if (statusFilter === "cancelados") return (p.statusPedido || "").toLowerCase() === "cancelado" || p.venda?.status === "CANCELADA";
      return true;
    });

    // Ordenação padrão por ordem de índice/ID crescente
    return [...list].sort((a, b) => a.id - b.id);
  })();

  return (
    <AppShell
      title="Pedidos"
      description="Todos os pedidos cadastrados e status de preparo em tempo real."
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
                <TabsTrigger value="todos">Todos ({pedidosList.length})</TabsTrigger>
                <TabsTrigger value="abertos">
                  Abertos ({pedidosList.filter((p) => p.statusPedido === "Aberto").length})
                </TabsTrigger>
                <TabsTrigger value="preparo">
                  Em preparo ({pedidosList.filter((p) => p.statusPedido === "Em preparo").length})
                </TabsTrigger>
                <TabsTrigger value="concluidos">
                  Concluídos ({pedidosList.filter((p) => p.statusPedido === "Concluído" || p.statusPedido === "Concluido").length})
                </TabsTrigger>
                <TabsTrigger value="cancelados">
                  Cancelados ({pedidosList.filter((p) => (p.statusPedido || "").toLowerCase() === "cancelado" || p.venda?.status === "CANCELADA").length})
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
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando pedidos da API...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchPedidos} className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag className="size-8 text-muted-foreground/60 mb-2" />
              <p>Nenhum pedido encontrado com estes filtros.</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Novos pedidos são lançados através da tela de Vendas / Comandas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Comanda/Mesa</TableHead>
                    <TableHead>Atendimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tempo de Preparo</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPedidos.map((p) => {
                    const isCancelado = (p.statusPedido || "").toLowerCase() === "cancelado" || p.venda?.status === "CANCELADA";
                    const isPago = !isCancelado && ((p.venda?.dataFimVenda != null && p.venda?.status !== "CANCELADA") || p.statusPedido === "Pago");
                    const isFinalizado = p.statusPedido === "Concluído" || p.statusPedido === "Concluido" || isCancelado;

                    return (
                      <TableRow
                        key={p.id}
                        className={isFinalizado ? "opacity-80 hover:bg-transparent bg-muted/10" : undefined}
                      >
                        <TableCell className="font-semibold font-mono text-xs">
                          #{p.id}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {p.cliente?.nome || p.venda?.cliente?.nome || (p.venda?.mesa?.nome ? `Consumo (${p.venda.mesa.nome})` : "Cliente Balcão")}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {p.dataHora
                              ? new Date(p.dataHora).toLocaleString("pt-BR", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-border bg-muted/50 text-foreground text-xs font-mono font-medium">
                            {p.venda?.mesa?.nome
                              ? `Comanda #${p.venda.id} - ${p.venda.mesa.nome}`
                              : `Comanda #${p.venda?.id || "-"}`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const rawTipo = (p.tipoPedido || p.venda?.tipoAtendimento || "LOCAL").toUpperCase();
                            const isDelivery = rawTipo === "DELIVERY";
                            const isRetirada = rawTipo === "RETIRADA" || rawTipo === "BALCAO";

                            const Icon = isDelivery ? Truck : isRetirada ? ShoppingBag : Utensils;

                            const label = isDelivery
                              ? "Delivery"
                              : isRetirada
                              ? "Retirada"
                              : "Consumo Local";

                            const style = isDelivery
                              ? "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                              : isRetirada
                              ? "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold"
                              : "border-primary/30 bg-primary/10 text-primary font-semibold";

                            return (
                              <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${style}`}>
                                <Icon className="size-3 shrink-0" />
                                {label}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusTone[isCancelado ? "Cancelado" : (p.statusPedido || "Aberto")] || statusTone["Aberto"]}
                          >
                            {isCancelado ? "Cancelado" : (p.statusPedido || "Aberto")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.statusPedido === "Em preparo" || p.statusPedido === "Concluído" || p.statusPedido === "Concluido" ? (
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-mono text-xs">
                              <Clock className="size-3 mr-1 inline-block text-muted-foreground" /> {formatTempoPreparo(p, now)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs font-mono font-medium">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isCancelado ? (
                            <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 font-medium">
                              Cancelado
                            </Badge>
                          ) : isPago ? (
                            <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-medium">
                              Pago
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30 font-medium">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 items-center">
                            {(() => {
                              const isPedidoCancelado = (p.statusPedido || "").toLowerCase() === "cancelado";
                              const hasItensCancelados = !isPedidoCancelado && (p.itens || []).some(
                                (item) => (item.statusItem || "").toUpperCase() === "CANCELADO"
                              );
                              return (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDetalhesModal(p.id)}
                                  className="size-8 text-primary hover:text-primary relative"
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
                            {!isFinalizado && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenCancelModal(p)}
                                className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Cancelar / Excluir Pedido"
                              >
                                <Trash2 className="size-4" />
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



      {/* Modal Ver Detalhes e Alterar Status do Pedido */}
      <Dialog
        open={selectedPedidoId !== null}
        onOpenChange={(open) => !open && setSelectedPedidoId(null)}
      >
        <DialogContent className="sm:max-w-lg sm:max-h-[85vh] overflow-y-auto">
          {(() => {
            const targetPedidoObj = pedidosList.find((p) => p.id === selectedPedidoId);
            const isDelivery = pedidoDetalhe?.tipoPedido?.toUpperCase() === "DELIVERY" || targetPedidoObj?.tipoPedido?.toUpperCase() === "DELIVERY";
            const isRetirada = pedidoDetalhe?.tipoPedido?.toUpperCase() === "RETIRADA" || pedidoDetalhe?.tipoPedido?.toUpperCase() === "BALCAO" || targetPedidoObj?.tipoPedido?.toUpperCase() === "RETIRADA";
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

            const clienteNome = targetPedidoObj?.cliente?.nome || targetPedidoObj?.venda?.cliente?.nome || targetPedidoObj?.venda?.nomeCliente;
            const isCadastrado = Boolean(targetPedidoObj?.cliente?.id || targetPedidoObj?.venda?.cliente?.id);
            const mesaNome = targetPedidoObj?.venda?.mesa?.nome;

            return (
              <DialogHeader className="flex flex-col space-y-1.5 pb-2 border-b">
                <DialogTitle className={`text-lg font-bold flex items-center gap-2 transition-colors cursor-default ${titleHoverColor}`}>
                  <FileText className={`size-5 ${iconColor}`} />
                  Detalhes do Pedido #{selectedPedidoId}
                </DialogTitle>
                {pedidoDetalhe && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {/* BADGE CANAL DE ATENDIMENTO / LOCAL */}
                    {isDelivery ? (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/12 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <Truck className="size-3" /> Delivery
                      </Badge>
                    ) : isRetirada ? (
                      <Badge variant="outline" className="border-purple-500/30 bg-purple-500/12 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center gap-1">
                        <ShoppingBag className="size-3" /> Retirada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                        <MapPin className="size-3" /> {mesaNome || "Consumo Local"}
                      </Badge>
                    )}

                    {/* BADGE CLIENTE */}
                    <Badge variant="outline" className="border-border bg-muted/50 text-foreground text-xs font-medium flex items-center gap-1">
                      <User className={`size-3 ${isCadastrado ? "text-primary fill-primary/10" : "text-muted-foreground"}`} />
                      {clienteNome || "Sem cliente"}
                    </Badge>
                  </div>
                )}
              </DialogHeader>
            );
          })()}

          {loadingDetalhes ? (
            <div className="flex h-36 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando detalhes do pedido...
            </div>
          ) : pedidoDetalhe ? (
            <div className="space-y-4 py-2 text-xs">
              {/* STATUS ATUAL E PROGRESSÃO DA COZINHA */}
              {pedidoDetalhe.statusPedido === "Concluído" || pedidoDetalhe.statusPedido === "Concluido" ? (
                <div className="p-3 border border-emerald-500/30 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" /> Pedido Concluído!
                  </p>
                  <p>Preparo finalizado pela cozinha.</p>
                </div>
              ) : (pedidoDetalhe.statusPedido || "").toLowerCase() === "cancelado" || (pedidoDetalhe as any).venda?.status === "CANCELADA" ? (
                <div className="p-3 border border-destructive/30 rounded-lg bg-destructive/10 text-destructive text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <XCircle className="size-4 text-destructive" /> Pedido cancelado!
                  </p>
                  <p>Não é possível alterar o status deste pedido.</p>
                  {pedidoDetalhe.motivoCancelamento && (
                    <p className="font-medium text-[11px] pt-1.5 border-t border-destructive/20 mt-1.5 text-destructive/90">
                      Motivo: <span className="font-normal">{pedidoDetalhe.motivoCancelamento}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 border rounded-lg bg-muted/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Status Atual:</span>
                    <Badge
                      variant="outline"
                      className={statusTone[pedidoDetalhe.statusPedido || "Aberto"] || statusTone["Aberto"]}
                    >
                      {pedidoDetalhe.statusPedido || "Aberto"}
                    </Badge>
                  </div>
                  {pedidoDetalhe.statusPedido === "Em preparo" && (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-mono text-[11px]">
                      <Clock className="size-3 mr-1 inline-block text-muted-foreground" />
                      {formatTempoPreparo(pedidosList.find((p) => p.id === selectedPedidoId) || (pedidoDetalhe as any), now)}
                    </Badge>
                  )}
                </div>
              )}

              {/* TABELA DE ITENS ATIVOS E SEÇÃO DE ITENS CANCELADOS */}
              {(() => {
                const itensAtivos = (pedidoDetalhe.itens || []).filter(
                  (item) => (item.statusItem || "").toUpperCase() !== "CANCELADO"
                );
                const itensCancelados = (pedidoDetalhe.itens || []).filter(
                  (item) => (item.statusItem || "").toUpperCase() === "CANCELADO"
                );

                return (
                  <div className="space-y-3 pt-2">
                    {itensAtivos.length === 0 ? (
                      <div className="flex h-36 flex-col items-center justify-center text-muted-foreground py-6">
                        <ShoppingBag className="size-8 text-muted-foreground/50 mb-2" />
                        <p className="text-xs font-medium text-foreground">Nenhum item ativo neste pedido.</p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-muted/80 z-10 backdrop-blur-xs">
                            <TableRow>
                              <TableHead className="text-xs font-semibold">Produto</TableHead>
                              <TableHead className="text-xs font-semibold text-center">Qtd</TableHead>
                              <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itensAtivos.map((item) => {
                              const prod = produtosList.find((p) => p.id === item.produtoId);
                              return (
                                <TableRow key={item.id || item.produtoId} className="text-xs">
                                  <TableCell className="font-medium">
                                    <p className="font-semibold text-foreground">{prod?.nome || `Produto #${item.produtoId}`}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                      {brl(prod?.preco || 0)} un.
                                    </p>
                                  </TableCell>
                                  <TableCell className="text-center font-bold font-mono">
                                    {item.quantidade}x
                                  </TableCell>
                                  <TableCell className="text-right font-bold font-mono text-foreground">
                                    {brl(item.total || (item.quantidade * (prod?.preco || 0)))}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* SEÇÃO AUDITORIA DE ITENS CANCELADOS (COM OLHO ABERTO/FECHADO E BOTÃO VER) */}
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
                                <EyeOff className="size-3.5" /> Ver
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
                                const prod = produtosList.find((p) => p.id === item.produtoId);
                                return (
                                  <div
                                    key={item.id || item.produtoId}
                                    className="p-2 border border-destructive/20 bg-destructive/5 rounded-md text-xs space-y-1 shadow-sm"
                                  >
                                    <div className="flex justify-between items-center font-semibold">
                                      <span className="line-through text-muted-foreground">
                                        {prod?.nome || `Produto #${item.produtoId}`} ({item.quantidade}x)
                                      </span>
                                      <span className="font-mono text-muted-foreground">
                                        {brl(item.total || (item.quantidade * (prod?.preco || 0)))}
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
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* RODAPÉ DO MODAL PADRONIZADO IGUAL AO DE COMANDAS */}
              <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t">
                {pedidoDetalhe.statusPedido !== "Concluído" &&
                 pedidoDetalhe.statusPedido !== "Concluido" &&
                 pedidoDetalhe.statusPedido !== "Cancelado" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const found = pedidosList.find((p) => p.id === pedidoDetalhe.id);
                      if (found) {
                        setSelectedPedidoId(null);
                        handleOpenCancelModal(found);
                      }
                    }}
                    className="size-10 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 border border-destructive/30"
                    title="Cancelar Pedido"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}

                {(() => {
                  const currentObj = pedidosList.find((p) => p.id === selectedPedidoId);
                  if (!currentObj) return null;
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleImprimirViaCozinha(currentObj)}
                      className="text-xs font-semibold h-10 px-3 flex items-center gap-1.5"
                      title="Imprimir comprovante de cozinha de 80mm"
                    >
                      <Printer className="size-4" />
                      <span>Imprimir Via</span>
                    </Button>
                  );
                })()}

                {pedidoDetalhe.statusPedido === "Aberto" && (
                  <Button
                    type="button"
                    onClick={() => handleAvancarStatus("Em preparo")}
                    className="bg-amber-500 text-amber-950 hover:bg-amber-600 font-bold flex items-center gap-2 h-10 px-4 text-xs shadow-xs ml-auto"
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

                {(pedidoDetalhe.statusPedido === "Em preparo" || pedidoDetalhe.statusPedido === "Em Preparo") && (
                  <Button
                    type="button"
                    onClick={() => handleAvancarStatus("Concluído")}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold flex items-center gap-2 h-10 px-4 text-xs shadow-xs ml-auto"
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
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal Motivo do Cancelamento do Pedido */}
      <Dialog
        open={cancelPedidoTarget !== null}
        onOpenChange={(open) => !open && setCancelPedidoTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangle className="size-5 text-destructive" /> Motivo do Cancelamento do Pedido #{cancelPedidoTarget?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Informe a justificativa para o cancelamento deste pedido. Todos os itens associados serão marcados como cancelados e o valor total da comanda será atualizado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg border space-y-1">
              <p className="font-semibold text-foreground">
                Pedido #{cancelPedidoTarget?.id} — {cancelPedidoTarget?.tipoPedido || "Mesa"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {cancelPedidoTarget?.venda?.mesa?.nome
                  ? `Comanda da ${cancelPedidoTarget.venda.mesa.nome}`
                  : cancelPedidoTarget?.cliente?.nome
                  ? `Cliente: ${cancelPedidoTarget.cliente.nome}`
                  : `Comanda #${cancelPedidoTarget?.venda?.id || "-"}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Motivo Principal</Label>
              <Select value={motivoOpcao} onValueChange={setMotivoOpcao}>
                <SelectTrigger>
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
              <Label htmlFor="obsCancelPed">Observação (Opcional)</Label>
              <textarea
                id="obsCancelPed"
                placeholder="Descreva detalhes adicionais sobre o cancelamento..."
                value={motivoObservacao}
                onChange={(e) => setMotivoObservacao(e.target.value)}
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelPedidoTarget(null)}
              disabled={cancelingPedido}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarCancelamentoPedido}
              disabled={cancelingPedido}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold flex items-center gap-1"
            >
              {cancelingPedido ? (
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
      {/* Modal Confirmar Impressão de Comprovante de Cozinha ao Mudar para Em Preparo */}
      <AlertDialog
        open={pedidoParaImprimir !== null}
        onOpenChange={(open) => !open && setPedidoParaImprimir(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base font-bold text-primary">
              <Printer className="size-5 text-primary" />
              Deseja imprimir a via de produção?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              O pedido <strong>#{pedidoParaImprimir?.id}</strong> foi alterado para <strong>Em preparo</strong>. Deseja enviar a via da cozinha para a impressora agora?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pedidoParaImprimir && (
            <div className="p-3 border rounded-lg bg-muted/40 space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Pedido #{pedidoParaImprimir.id}</span>
                <span className="font-mono">{pedidoParaImprimir.venda?.mesa?.nome || "Mesa/Balcão"}</span>
              </div>
              <div className="text-muted-foreground text-[11px] font-mono">
                {pedidoParaImprimir.itens?.filter((i) => (i.statusItem || "").toUpperCase() !== "CANCELADO").map((i) => {
                  const prodId = (i as any).produtoId || (i as any).produto?.id;
                  const prod = produtosList.find((p) => p.id === prodId);
                  return `${i.quantidade}x ${(i as any).produto?.nome || prod?.nome || "Item"}`;
                }).join(", ")}
              </div>
            </div>
          )}

          <AlertDialogFooter className="flex flex-row items-center justify-between gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => setPedidoParaImprimir(null)}
              className="text-xs border-input/60"
            >
              Não Imprimir
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pedidoParaImprimir;
                setPedidoParaImprimir(null);
                handleImprimirViaCozinha(target);
              }}
              className="bg-brand text-primary-foreground hover:opacity-90 font-bold h-9 px-4 text-xs shadow-xs flex items-center gap-1.5"
            >
              <Printer className="size-4" /> Imprimir Via de Cozinha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
