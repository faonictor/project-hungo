import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  Receipt,
  Loader2,
  RefreshCw,
  ShoppingCart,
  CheckCircle2,
  Utensils,
  X,
  Truck,
  User,
  LayoutGrid,
  Pencil,
  Trash2,
  Grid2X2Plus,
  Settings2,
  ArrowLeft,
  Sparkles,
  Hash,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  ShoppingBag,
  AlertTriangle,
  Search,
  Check,
  ChevronRight,
  QrCode,
  CreditCard,
  Banknote,
  PieChart,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  apiVendas,
  apiMesas,
  apiClientes,
  apiEnderecos,
  apiPedidos,
  apiItemPedido,
  apiFluxoFinanceiro,
  apiPagamentosComanda,
  Venda,
  Mesa,
  Cliente,
  Endereco,
  Pedido,
  ItemPedido,
} from "@/lib/api";
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/vendas/")({
  head: () => ({
    meta: [
      { title: "Vendas abertas — Hungo" },
      {
        name: "description",
        content: "Comandas em aberto por mesa, retirada ou delivery.",
      },
    ],
  }),
  component: VendasPage,
});

const channelBadge: Record<string, { label: string; style: string }> = {
  LOCAL: { label: "Consumo Local", style: "border-primary/30 bg-primary/10 text-primary font-semibold" },
  SALAO: { label: "Consumo Local", style: "border-primary/30 bg-primary/10 text-primary font-semibold" },
  RETIRADA: { label: "Retirada", style: "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold" },
  BALCAO: { label: "Retirada", style: "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold" },
  DELIVERY: { label: "Delivery", style: "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold" },
};

// Verifica se o nome segue o padrão numérico "Mesa 01", "Mesa 02", "Mesa 10", etc.
const isMesaNumerica = (nome: string) => {
  return /^Mesa\s*\d+$/i.test(nome.trim());
};

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

function VendasPage() {
  const navigate = useNavigate();
  const [vendasAbertas, setVendasAbertas] = useState<Venda[]>([]);
  const [allItensAbertos, setAllItensAbertos] = useState<ItemPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("TODOS");

  // Gerenciador de Mesas Físicas Modal State
  const [isGerenciarMesasOpen, setIsGerenciarMesasOpen] = useState(false);
  const [categoriaMesaTab, setCategoriaMesaTab] = useState<string>("todas"); // todas, numericas, especiais
  const [mesasList, setMesasList] = useState<Mesa[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [modoCriacaoMesa, setModoCriacaoMesa] = useState<"individual" | "lote">("lote");
  const [novaMesaFisicaNome, setNovaMesaFisicaNome] = useState("");
  const [quantidadeLote, setQuantidadeLote] = useState<string>("5");
  const [prefixoLote, setPrefixoLote] = useState<string>("Mesa");
  const [generatingLote, setGeneratingLote] = useState(false);

  // Modal Ver Comandas da Mesa Selecionada
  const [verComandasMesaModal, setVerComandasMesaModal] = useState<Mesa | null>(null);

  // Modo de Exibição (COMANDAS x MESAS)
  const [modoExibicao, setModoExibicao] = useState<"COMANDAS" | "MESAS">("COMANDAS");

  // Modal Ver Itens Lançados da Comanda
  const [verItensComandaModal, setVerItensComandaModal] = useState<Venda | null>(null);
  const [itensLancadosDaComanda, setItensLancadosDaComanda] = useState<ItemPedido[]>([]);
  const [loadingItensComanda, setLoadingItensComanda] = useState(false);
  const [cancelingItemId, setCancelingItemId] = useState<number | null>(null);

  // Motivo de Cancelamento Modal State (para itens em preparo)
  const [cancelItemTarget, setCancelItemTarget] = useState<ItemPedido | null>(null);
  const [motivoOpcao, setMotivoOpcao] = useState<string>("Cliente desistiu");
  const [motivoObservacao, setMotivoObservacao] = useState<string>("");
  const [mostrarItensCancelados, setMostrarItensCancelados] = useState<boolean>(false);

  // Modal Editar Apelido/Nome da Mesa
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [editMesaNome, setEditMesaNome] = useState("");
  const [savingEditMesa, setSavingEditMesa] = useState(false);

  // Modal Abrir Comanda
  const [isNovaVendaModalOpen, setIsNovaVendaModalOpen] = useState(false);
  const [tipoAtendimento, setTipoAtendimento] = useState<string>("LOCAL"); // LOCAL, RETIRADA, DELIVERY
  const [selectedMesaId, setSelectedMesaId] = useState<string>("");

  // Campos para Cliente e Delivery
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [nomeClienteRetirada, setNomeClienteRetirada] = useState<string>("");
  const [nomeClienteConsumoLocal, setNomeClienteConsumoLocal] = useState<string>("");
  const [clienteSearchTerm, setClienteSearchTerm] = useState<string>("");
  const [isClienteDropdownOpen, setIsClienteDropdownOpen] = useState<boolean>(false);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [selectedEnderecoId, setSelectedEnderecoId] = useState<string>("");
  const [taxaEntrega, setTaxaEntrega] = useState<string>("0.00");
  const [submittingVenda, setSubmittingVenda] = useState(false);

  // Modal Fechar Venda (Lançamento Financeiro, Desconto e Pagamento Parcial)
  const [vendaParaFechar, setVendaParaFechar] = useState<Venda | null>(null);
  const [pedidosDaVendaParaFechar, setPedidosDaVendaParaFechar] = useState<Pedido[]>([]);
  const [tipoFechamento, setTipoFechamento] = useState<"TOTAL" | "PARCIAL">("TOTAL");
  const [formaPagamento, setFormaPagamento] = useState<string>("Pix");
  const [aplicarDesconto, setAplicarDesconto] = useState<boolean>(false);
  const [descontoValorInput, setDescontoValorInput] = useState<string>("");
  const [valorPagoParcialInput, setValorPagoParcialInput] = useState<string>("");
  const [closingVenda, setClosingVenda] = useState(false);
  const [checkingFecharVendaId, setCheckingFecharVendaId] = useState<number | null>(null);

  const getVendaCalculos = (venda: Venda) => {
    const itens = allItensAbertos.filter((i) => i.vendaId === venda.id || (i as any).vendaId === venda.id || i.pedido?.venda?.id === venda.id);

    const subtotalGeral = round2(itens
      .filter((i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO")
      .reduce((acc, i) => acc + (i.total || 0), 0));

    const subtotalConcluido = round2(itens
      .filter((i) => {
        const isItemAtivo = !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO";
        const statusPed = i.pedido?.statusPedido ? i.pedido.statusPedido.toLowerCase() : "";
        const isPedConcluido = statusPed === "concluído" || statusPed === "concluido";
        return isItemAtivo && isPedConcluido;
      })
      .reduce((acc, i) => acc + (i.total || 0), 0));

    const taxa = round2(venda.taxaEntrega || 0);
    const valorPago = round2(venda.valorPago || 0);

    const totalConsumidoCalculado = subtotalGeral > 0 ? round2(subtotalGeral + taxa) : round2((venda.total || 0) + valorPago);
    const disponivelParaPagar = round2(Math.max(0, subtotalConcluido + taxa - valorPago));
    const podeFechar = disponivelParaPagar > 0;

    return {
      totalConsumido: totalConsumidoCalculado,
      subtotalConcluido,
      disponivelParaPagar,
      podeFechar,
      itens,
    };
  };

  const handleTentativaFecharComanda = async (venda: Venda, defaultTipo: "TOTAL" | "PARCIAL" = "TOTAL"): Promise<boolean> => {
    if (!venda || !venda.id) return false;

    try {
      setCheckingFecharVendaId(venda.id);
      const { totalConsumido, disponivelParaPagar } = getVendaCalculos(venda);
      const valorPagoVal = venda.valorPago || 0;
      const saldoPendentes = Math.max(0, totalConsumido - valorPagoVal);
      const temPedidosEmAberto = disponivelParaPagar < saldoPendentes - 0.01;

      const tipoInicial = temPedidosEmAberto ? "PARCIAL" : defaultTipo;

      setTipoFechamento(tipoInicial);
      setFormaPagamento("Pix");
      setAplicarDesconto(false);
      setDescontoValorInput("");
      setValorPagoParcialInput(disponivelParaPagar > 0 ? disponivelParaPagar.toString() : "");
      setVendaParaFechar(venda);
      return true;
    } catch (err: any) {
      setTipoFechamento("PARCIAL");
      setFormaPagamento("Pix");
      setAplicarDesconto(false);
      setDescontoValorInput("");
      setValorPagoParcialInput("");
      setVendaParaFechar(venda);
      return true;
    } finally {
      setCheckingFecharVendaId(null);
    }
  };

  // Modal Excluir Venda/Comanda (Sem Lançamento Financeiro - Trava de Segurança & Auditoria)
  const [comandaParaExcluir, setComandaParaExcluir] = useState<Venda | null>(null);
  const [confirmacaoNumero, setConfirmacaoNumero] = useState<string>("");
  const [motivoExclusaoOpcao, setMotivoExclusaoOpcao] = useState<string>("Cliente desistiu");
  const [motivoExclusaoObs, setMotivoExclusaoObs] = useState<string>("");

  // Modal Editar Dados da Comanda (Tipo de Atendimento, Mesa e Cliente)
  const [editingComandaDados, setEditingComandaDados] = useState<Venda | null>(null);
  const [editTipoAtendimento, setEditTipoAtendimento] = useState<string>("LOCAL");
  const [editMesaId, setEditMesaId] = useState<string>("");
  const [editSelectedClienteId, setEditSelectedClienteId] = useState<string>("");
  const [editClienteSearchTerm, setEditClienteSearchTerm] = useState<string>("");
  const [isEditClienteDropdownOpen, setIsEditClienteDropdownOpen] = useState<boolean>(false);
  const [savingComandaDados, setSavingComandaDados] = useState<boolean>(false);

  const handleOpenEditarDadosComandaModal = (venda: Venda | null) => {
    if (!venda) return;
    setEditingComandaDados(venda);
    setEditTipoAtendimento(venda.tipoAtendimento || "LOCAL");
    setEditMesaId(venda.mesa?.id?.toString() || "");

    if (venda.cliente?.id && (venda.cliente.telefone || clientesList.some((c) => c.id === venda.cliente?.id))) {
      setEditSelectedClienteId(venda.cliente.id.toString());
      setEditClienteSearchTerm("");
    } else {
      setEditSelectedClienteId("");
      setEditClienteSearchTerm(venda.cliente?.nome || venda.nomeCliente || "");
    }
    setIsEditClienteDropdownOpen(false);

    if (mesasList.length === 0) fetchMesasFisicas();
    if (clientesList.length === 0) apiClientes.listar().then(setClientesList).catch(() => {});
  };

  const handleSaveEditarComandaDados = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComandaDados?.id) return;

    try {
      setSavingComandaDados(true);
      const updatePayload: any = {
        tipoAtendimento: editTipoAtendimento,
        valorPago: editingComandaDados.valorPago || 0,
      };

      if (editTipoAtendimento === "LOCAL") {
        if (!editMesaId) {
          toast.error("Por favor, selecione uma mesa para o atendimento no local.");
          setSavingComandaDados(false);
          return;
        }
        updatePayload.mesa = { id: parseInt(editMesaId, 10) };
      } else {
        updatePayload.mesa = null;
      }

      if (editSelectedClienteId) {
        const found = clientesList.find((c) => c.id?.toString() === editSelectedClienteId);
        if (found) {
          updatePayload.cliente = { id: found.id, nome: found.nome };
          updatePayload.nomeCliente = null;
        } else {
          updatePayload.cliente = { id: parseInt(editSelectedClienteId, 10) };
          updatePayload.nomeCliente = null;
        }
      } else if (editClienteSearchTerm.trim()) {
        updatePayload.cliente = null;
        updatePayload.nomeCliente = editClienteSearchTerm.trim();
      } else {
        updatePayload.cliente = null;
        updatePayload.nomeCliente = null;
      }

      const updated = await apiVendas.atualizar(editingComandaDados.id, updatePayload);
      toast.success(`Dados da Comanda #${editingComandaDados.id} atualizados!`);
      setEditingComandaDados(null);
      setVerItensComandaModal(updated);
      fetchVendasAbertas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar dados da comanda.");
    } finally {
      setSavingComandaDados(false);
    }
  };
  const [deletingVenda, setDeletingVenda] = useState(false);

  const handleOpenExcluirComandaModal = (venda: Venda) => {
    setComandaParaExcluir(venda);
    setConfirmacaoNumero("");
    setMotivoExclusaoOpcao("Cliente desistiu");
    setMotivoExclusaoObs("");
  };

  const fetchVendasAbertas = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vendasData, itensData] = await Promise.all([
        apiVendas.listarEmAberto(),
        apiPedidos.buscarItensEmAberto().catch(() => []),
        fetchMesasFisicas(),
      ]);
      setVendasAbertas(vendasData);
      setAllItensAbertos(itensData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar comandas");
      toast.error("Erro ao conectar com a API de vendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendasAbertas();
    fetchMesasFisicas();
  }, []);

  // Visualizar Itens Lançados na Comanda em Modal sem fechar ou alterar nada
  const handleOpenVerItensComanda = async (venda: Venda) => {
    if (!venda || !venda.id) return;
    setVerItensComandaModal(venda);
    setItensLancadosDaComanda([]);
    try {
      setLoadingItensComanda(true);
      const itens = await apiPedidos.buscarItensPorVenda(venda.id);
      setItensLancadosDaComanda(itens);
    } catch (err: any) {
      toast.error("Erro ao buscar itens da comanda.");
    } finally {
      setLoadingItensComanda(false);
    }
  };

  const handleCliqueRemoverItem = (item: ItemPedido) => {
    const statusPedido = item.pedido?.statusPedido || "Aberto";
    if (statusPedido === "Em preparo") {
      setCancelItemTarget(item);
      setMotivoOpcao("Cliente desistiu");
      setMotivoObservacao("");
    } else {
      handleExecutarCancelamentoItem(item);
    }
  };

  const handleExecutarCancelamentoItem = async (item: ItemPedido, motivoTexto?: string) => {
    if (!verItensComandaModal || !verItensComandaModal.id) return;
    try {
      setCancelingItemId(item.id);
      await apiItemPedido.cancelar(item.id, motivoTexto);
      toast.success(`Item "${item.produto?.nome || 'Produto'}" removido da comanda!`);
      setCancelItemTarget(null);
      const [itensAtualizados, vendaAtualizada] = await Promise.all([
        apiPedidos.buscarItensPorVenda(verItensComandaModal.id),
        apiVendas.buscarPorId(verItensComandaModal.id),
      ]);
      setItensLancadosDaComanda(itensAtualizados);
      setVerItensComandaModal(vendaAtualizada);
      fetchVendasAbertas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover item da comanda.");
    } finally {
      setCancelingItemId(null);
    }
  };

  const handleConfirmarCancelamento = async () => {
    if (!cancelItemTarget) return;
    const motivoTexto = `${motivoOpcao}${motivoObservacao.trim() ? `: ${motivoObservacao.trim()}` : ""}`;
    await handleExecutarCancelamentoItem(cancelItemTarget, motivoTexto);
  };

  // Função auxiliar para ordenação das mesas (primeiro normais/numéricas em sequência, depois especiais)
  const sortMesas = (list: Mesa[]) => {
    const numericas = list.filter((m) => isMesaNumerica(m.nome || ""));
    const especiais = list.filter((m) => !isMesaNumerica(m.nome || ""));

    numericas.sort((a, b) => {
      const numA = parseInt(a.nome?.replace(/\D/g, "") || "0", 10);
      const numB = parseInt(b.nome?.replace(/\D/g, "") || "0", 10);
      return numA - numB;
    });

    especiais.sort((a, b) => {
      return (a.nome || "").localeCompare(b.nome || "", undefined, { numeric: true, sensitivity: "base" });
    });

    return [...numericas, ...especiais];
  };

  // --- GERENCIADOR DE MAPA DE MESAS FÍSICAS ---
  const fetchMesasFisicas = async () => {
    try {
      setLoadingMesas(true);
      const ms = await apiMesas.listar();
      setMesasList(sortMesas(ms));
    } catch (err: any) {
      toast.error("Erro ao carregar mapa de mesas.");
    } finally {
      setLoadingMesas(false);
    }
  };

  const handleOpenGerenciarMesas = () => {
    setNovaMesaFisicaNome("");
    setQuantidadeLote("5");
    setPrefixoLote("Mesa");
    setCategoriaMesaTab("todas");
    fetchMesasFisicas();
    setIsGerenciarMesasOpen(true);
  };

  // Reorganiza a numeração sequencial das mesas numéricas restantes
  const reorganizarMesasNumericas = async (currentList: Mesa[]) => {
    const numericas = currentList.filter((m) => isMesaNumerica(m.nome));

    // Ordena numericamente pelo número extraído do nome
    numericas.sort((a, b) => {
      const numA = parseInt(a.nome.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.nome.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    const updatePromises = [];
    for (let i = 0; i < numericas.length; i++) {
      const mesa = numericas[i];
      if (mesa && mesa.id) {
        const novoNome = `Mesa ${String(i + 1).padStart(2, "0")}`;
        if (mesa.nome !== novoNome) {
          updatePromises.push(
            apiMesas.atualizar(mesa.id, {
              ...mesa,
              nome: novoNome,
            })
          );
        }
      }
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
  };

  // Criação Individual de Mesa Especial
  const handleCreateMesaIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMesaFisicaNome.trim()) {
      toast.warning("Informe o nome/apelido da mesa.");
      return;
    }
    try {
      await apiMesas.salvar({ nome: novaMesaFisicaNome.trim(), status: true });
      toast.success("Mesa cadastrada com sucesso!");
      setNovaMesaFisicaNome("");
      fetchMesasFisicas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar mesa.");
    }
  };

  // Geração em Lote Numérico de Mesas Sequencial (Ex: 10 mesas "Mesa 01", "Mesa 02", ...)
  const handleGenerateMesasLote = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantidadeLote, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.warning("Informe uma quantidade válida de mesas (maior que zero).");
      return;
    }

    try {
      setGeneratingLote(true);
      const prefix = prefixoLote.trim() || "Mesa";

      // Calcula o maior número existente com esse prefixo para dar continuidade sequencial
      const existingNumbers = mesasList
        .map((m) => {
          if (!m.nome) return 0;
          const escapedPrefix = prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          const match = m.nome.match(new RegExp(`^${escapedPrefix}\\s*(\\d+)`, "i"));
          return match && match[1] ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));

      const startNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

      // Cria o lote de mesas em ordem sequencial estrita
      for (let i = 0; i < qty; i++) {
        const numFormatted = String(startNum + i).padStart(2, "0");
        const nomeMesa = `${prefix} ${numFormatted}`;
        await apiMesas.salvar({ nome: nomeMesa, status: true });
      }

      toast.success(`${qty} mesas numéricas criadas no mapa em ordem!`);
      fetchMesasFisicas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar mesas em lote.");
    } finally {
      setGeneratingLote(false);
    }
  };

  // Editar Nome / Apelido da Mesa
  const handleOpenEditMesa = (mesa: Mesa) => {
    setEditingMesa(mesa);
    setEditMesaNome(mesa.nome);
  };

  const handleSaveEditMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMesa || !editingMesa.id || !editMesaNome.trim()) return;
    try {
      setSavingEditMesa(true);
      await apiMesas.atualizar(editingMesa.id, {
        ...editingMesa,
        nome: editMesaNome.trim(),
      });

      // Atualiza a lista e reorganiza o sequencial se necessário
      const updatedList = mesasList.map((m) =>
        m.id === editingMesa.id ? { ...m, nome: editMesaNome.trim() } : m
      );
      await reorganizarMesasNumericas(updatedList);

      toast.success("Apelido da mesa atualizado!");
      setEditingMesa(null);
      fetchMesasFisicas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar nome da mesa.");
    } finally {
      setSavingEditMesa(false);
    }
  };

  const handleDeleteMesaFisica = async (mesaId: number) => {
    try {
      await apiMesas.deletar(mesaId);
      const remainingList = mesasList.filter((m) => m.id !== mesaId);
      // Reorganiza a sequência numérica automaticamente (ex: 01, 03 vira 01, 02)
      await reorganizarMesasNumericas(remainingList);

      toast.success("Mesa removida e sequência numérica reorganizada!");
      fetchMesasFisicas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover mesa.");
    }
  };

  // --- ABRIR COMANDA / VENDA ---
  const handleOpenNovaVendaModal = async (presetMesaId?: string, presetTipoAtendimento?: string) => {
    const targetTipo = presetTipoAtendimento || (activeTab !== "TODOS" ? activeTab : "LOCAL");
    setTipoAtendimento(targetTipo);
    setSelectedMesaId(presetMesaId || "");
    setSelectedClienteId("");
    setNomeClienteRetirada("");
    setNomeClienteConsumoLocal("");
    setClienteSearchTerm("");
    setIsClienteDropdownOpen(false);
    setSelectedEnderecoId("");
    setEnderecosCliente([]);
    setTaxaEntrega("0.00");
    try {
      const [mesas, cls] = await Promise.all([
        apiMesas.listar(),
        apiClientes.listar(),
      ]);
      setMesasList(mesas);
      setClientesList(cls);
      if (!presetMesaId && mesas.length > 0 && mesas[0]?.id) {
        setSelectedMesaId(mesas[0].id.toString());
      }
      // selectedClienteId permanece vazio ("") para exibir o placeholder "Selecionar Cliente"
      setIsNovaVendaModalOpen(true);
    } catch (err: any) {
      toast.error("Erro ao preparar abertura de comanda.");
    }
  };

  // Carrega endereços ao mudar cliente no Delivery
  useEffect(() => {
    if (selectedClienteId) {
      const cid = parseInt(selectedClienteId, 10);
      if (!isNaN(cid)) {
        apiEnderecos
          .listarPorCliente(cid)
          .then((ends) => {
            setEnderecosCliente(ends || []);
            if (ends && ends.length > 0 && ends[0]?.id) {
              setSelectedEnderecoId(ends[0].id.toString());
            } else {
              setSelectedEnderecoId("");
            }
          })
          .catch(() => {
            setEnderecosCliente([]);
            setSelectedEnderecoId("");
          });
      }
    } else {
      setEnderecosCliente([]);
      setSelectedEnderecoId("");
    }
  }, [selectedClienteId, tipoAtendimento]);

  const handleCreateVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    let mesaObj: Mesa | null = null;
    let clienteObj: Cliente | null = null;
    let enderecoObj: Endereco | null = null;

    try {
      setSubmittingVenda(true);

      // Tratamento Salão (Mesa Física cadastrada no salão)
      if (tipoAtendimento === "LOCAL") {
        if (!selectedMesaId) {
          toast.warning("Selecione uma mesa física.");
          setSubmittingVenda(false);
          return;
        }
        const found = mesasList.find((m) => m.id?.toString() === selectedMesaId);
        if (found && found.id) {
          mesaObj = found;
          // Marca a mesa como ocupada ao adicionar comanda
          await apiMesas.atualizar(found.id, { ...found, status: false });
        }
      }

      // Tratamento Cliente e Delivery (Nome temporário descartável sem salvar no banco de clientes)
      let nomeClienteTemp: string | null = null;

      if (selectedClienteId) {
        const foundCli = clientesList.find((c) => c.id?.toString() === selectedClienteId);
        if (foundCli) clienteObj = foundCli;
      } else if (clienteSearchTerm.trim() || nomeClienteConsumoLocal.trim() || nomeClienteRetirada.trim()) {
        nomeClienteTemp = (clienteSearchTerm || nomeClienteConsumoLocal || nomeClienteRetirada).trim();
      }

      if (tipoAtendimento === "DELIVERY" && selectedEnderecoId) {
        const foundEnd = enderecosCliente.find((e) => e.id?.toString() === selectedEnderecoId);
        if (foundEnd) enderecoObj = foundEnd;
      }

      const payload: Partial<Venda> = {
        tipoAtendimento,
        mesa: mesaObj,
        cliente: clienteObj,
        nomeCliente: nomeClienteTemp,
        endereco: enderecoObj,
        taxaEntrega: tipoAtendimento === "DELIVERY" ? parseFloat(taxaEntrega) || 0 : 0,
        total: tipoAtendimento === "DELIVERY" ? parseFloat(taxaEntrega) || 0 : 0,
      };

      const vendaCriada = await apiVendas.salvar(payload);
      toast.success(
        (tipoAtendimento === "LOCAL")
          ? `Comanda iniciada para ${mesaObj?.nome}!`
          : `Comanda de ${tipoAtendimento === "RETIRADA" ? "Retirada" : tipoAtendimento} iniciada!`
      );
      setIsNovaVendaModalOpen(false);
      setVerComandasMesaModal(null);
      fetchVendasAbertas();

      // Redireciona diretamente para a página de lançamento da nova comanda
      if (vendaCriada && vendaCriada.id) {
        navigate({ to: "/vendas/$vendaId/lancar", params: { vendaId: vendaCriada.id.toString() } });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao abrir comanda.");
    } finally {
      setSubmittingVenda(false);
    }
  };

  const handleConfirmarExcluirComanda = async () => {
    if (!comandaParaExcluir || !comandaParaExcluir.id) return;

    if (confirmacaoNumero.trim() !== comandaParaExcluir.id.toString()) {
      toast.error(`Digite o número #${comandaParaExcluir.id} para confirmar.`);
      return;
    }

    const motivoFinal = `${motivoExclusaoOpcao}${motivoExclusaoObs.trim() ? `: ${motivoExclusaoObs.trim()}` : ""}`;

    try {
      setDeletingVenda(true);
      await apiVendas.deletar(comandaParaExcluir.id, motivoFinal);
      toast.success(`Comanda #${comandaParaExcluir.id} excluída com sucesso! Registro de auditoria gravado.`);
      setComandaParaExcluir(null);
      setVerItensComandaModal(null);
      setVerComandasMesaModal(null);
      fetchVendasAbertas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir comanda.");
    } finally {
      setDeletingVenda(false);
    }
  };
  // --- NAVEGAÇÃO PARA PÁGINA DEDICADA DE LANÇAR ITENS ---
  const handleOpenLancarPedidoPage = (venda: Venda) => {
    if (venda.id) {
      navigate({ to: "/vendas/$vendaId/lancar", params: { vendaId: venda.id.toString() } });
    }
  };

  // --- FECHAR VENDA (SUPORTE A DESCONTO E PAGAMENTO PARCIAL) ---
  const handleFecharVenda = async () => {
    if (!vendaParaFechar || !vendaParaFechar.id) return;

    const { totalConsumido, disponivelParaPagar: maximoPermitidoParcial } = getVendaCalculos(vendaParaFechar);
    const subtotal = totalConsumido;

    const descontoNum = aplicarDesconto ? Math.min(maximoPermitidoParcial, Math.max(0, parseFloat(descontoValorInput) || 0)) : 0;
    const maximoPagamentoPermitido = Math.max(0, maximoPermitidoParcial - descontoNum);

    try {
      setClosingVenda(true);

      if (maximoPermitidoParcial <= 0) {
        toast.error("Não há pedidos concluídos disponíveis para pagamento nesta comanda.");
        setClosingVenda(false);
        return;
      }

      if (descontoNum > maximoPermitidoParcial) {
        toast.error(`O desconto (${brl(descontoNum)}) não pode ser maior do que o valor disponível para pagamento (${brl(maximoPermitidoParcial)}).`);
        setClosingVenda(false);
        return;
      }

      // Trava para encerramento total com pedidos pendentes
      if (tipoFechamento === "TOTAL") {
        const pedidosPendentes = pedidosDaVendaParaFechar.filter((p) => {
          const status = p.statusPedido ? p.statusPedido.toLowerCase() : "";
          return status === "aberto" || status === "em preparo";
        });
        if (pedidosPendentes.length > 0) {
          toast.error(
            `Não é possível encerrar totalmente a Comanda #${vendaParaFechar.id} com pedidos em preparo. Conclua os pedidos na cozinha ou altere para Pagamento Parcial.`
          );
          setClosingVenda(false);
          return;
        }

        const valorPagoTotal = maximoPagamentoPermitido;
        const novoValorPagoTotalDinheiro = round2((vendaParaFechar.valorPago || 0) + valorPagoTotal);

        // 1. Atualiza valor pago acumulado e fecha a comanda integralmente
        await apiVendas.atualizar(vendaParaFechar.id, {
          ...vendaParaFechar,
          valorPago: novoValorPagoTotalDinheiro,
        });

        await apiVendas.fecharVenda(vendaParaFechar.id);

        // 2. Registra auditoria no histórico
        try {
          await apiPagamentosComanda.salvar({
            venda: { id: vendaParaFechar.id } as Venda,
            valorPago: valorPagoTotal,
            formaPagamento: formaPagamento,
            tipo: "TOTAL",
            totalAntes: maximoPermitidoParcial,
            saldoRestante: 0,
            desconto: descontoNum,
            dataPagamento: new Date().toISOString(),
          });
        } catch (e) {
          console.error("Erro ao registrar histórico de encerramento:", e);
        }

        // 3. Registra lançamento de receita no Módulo de Fluxo Financeiro (apenas no encerramento com valor líquido total)
        try {
          const nomeCliente = vendaParaFechar.cliente?.nome || vendaParaFechar.nomeCliente || (vendaParaFechar.mesa?.nome ? `Mesa ${vendaParaFechar.mesa.nome}` : "Balcão");
          await apiFluxoFinanceiro.salvar({
            nome: `Encerramento Comanda #${vendaParaFechar.id}`,
            descricao: `Recebimento líquido total da Comanda #${vendaParaFechar.id} (${nomeCliente})`,
            transacao: "Entrada",
            fluxo: novoValorPagoTotalDinheiro,
            dataTransacao: new Date().toISOString(),
            venda: { id: vendaParaFechar.id } as Venda,
          });
        } catch (e) {
          console.error("Erro ao registrar no Fluxo Financeiro:", e);
        }

        toast.success(`Comanda #${vendaParaFechar.id} encerrada com sucesso!`);
        setVendaParaFechar(null);
        fetchVendasAbertas();
        return;
      }

      if (tipoFechamento === "PARCIAL") {
        const valorPago = Math.max(0, parseFloat(valorPagoParcialInput) || 0);

        if (valorPago <= 0) {
          toast.error("Informe o valor a ser pago agora.");
          setClosingVenda(false);
          return;
        }

        if (valorPago + descontoNum > maximoPermitidoParcial + 0.01) {
          toast.error(
            `A soma do valor pago (${brl(valorPago)}) e do desconto (${brl(descontoNum)}) não pode exceder o valor disponível (${brl(maximoPermitidoParcial)}).`
          );
          setClosingVenda(false);
          return;
        }

        const abatimentoTotalNoAto = round2(valorPago + descontoNum);
        const saldoRestanteNoAto = round2(Math.max(0, maximoPermitidoParcial - abatimentoTotalNoAto));

        const novoValorPagoApenasDinheiro = round2((vendaParaFechar.valorPago || 0) + valorPago);
        const novoTotalComanda = round2(Math.max(0, (vendaParaFechar.total || 0) - abatimentoTotalNoAto));

        // Se a comanda for quitada por completo sem saldo e sem pedidos abertos
        if (novoTotalComanda <= 0) {
          await apiVendas.atualizar(vendaParaFechar.id, {
            ...vendaParaFechar,
            valorPago: novoValorPagoApenasDinheiro,
          });

          await apiVendas.fecharVenda(vendaParaFechar.id);

          try {
            await apiPagamentosComanda.salvar({
              venda: { id: vendaParaFechar.id } as Venda,
              valorPago: valorPago,
              formaPagamento: formaPagamento,
              tipo: "PARCIAL",
              totalAntes: maximoPermitidoParcial,
              saldoRestante: 0,
              desconto: descontoNum,
              dataPagamento: new Date().toISOString(),
            });
          } catch (e) {
            console.error("Erro ao registrar histórico do pagamento final:", e);
          }

          // Registra lançamento de receita no Módulo de Fluxo Financeiro (apenas no encerramento com valor líquido total)
          try {
            const nomeCliente = vendaParaFechar.cliente?.nome || vendaParaFechar.nomeCliente || (vendaParaFechar.mesa?.nome ? `Mesa ${vendaParaFechar.mesa.nome}` : "Balcão");
            await apiFluxoFinanceiro.salvar({
              nome: `Encerramento Comanda #${vendaParaFechar.id}`,
              descricao: `Recebimento líquido total da Comanda #${vendaParaFechar.id} (${nomeCliente})`,
              transacao: "Entrada",
              fluxo: novoValorPagoApenasDinheiro,
              dataTransacao: new Date().toISOString(),
              venda: { id: vendaParaFechar.id } as Venda,
            });
          } catch (e) {
            console.error("Erro ao registrar no Fluxo Financeiro:", e);
          }

          toast.success(`Comanda #${vendaParaFechar.id} quitada e encerrada com sucesso!`);
          setVendaParaFechar(null);
          fetchVendasAbertas();
          return;
        }

        // 1. Atualiza comanda no backend (pagamento parcial mantendo aberta)
        await apiVendas.atualizar(vendaParaFechar.id, {
          ...vendaParaFechar,
          total: novoTotalComanda,
          valorPago: novoValorPagoApenasDinheiro,
        });

        // 2. Lança auditoria de pagamento parcial no histórico
        try {
          await apiPagamentosComanda.salvar({
            venda: { id: vendaParaFechar.id } as Venda,
            valorPago: valorPago,
            formaPagamento: formaPagamento,
            tipo: "PARCIAL",
            totalAntes: maximoPermitidoParcial,
            saldoRestante: saldoRestanteNoAto,
            desconto: descontoNum,
            dataPagamento: new Date().toISOString(),
          });
        } catch (e) {
          console.error("Erro ao registrar histórico do pagamento parcial:", e);
        }

        toast.success(
          `Pagamento parcial de ${brl(valorPago)} (desconto: ${brl(descontoNum)}) registrado na Comanda #${vendaParaFechar.id}!`
        );
        setVendaParaFechar(null);
        fetchVendasAbertas();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar fechamento da venda.");
    } finally {
      setClosingVenda(false);
    }
  };

  // Filtragem de comandas por abas (TODOS, LOCAL, RETIRADA, DELIVERY)
  const filteredVendas = vendasAbertas.filter((v) => {
    if (activeTab === "TODOS") return true;
    if (activeTab === "RETIRADA") return v.tipoAtendimento === "RETIRADA" || v.tipoAtendimento === "BALCAO";
    if (activeTab === "LOCAL") return !v.tipoAtendimento || v.tipoAtendimento === "LOCAL";
    return v.tipoAtendimento === activeTab;
  });

  const valorTotalAberto = vendasAbertas.reduce((acc, v) => acc + (v.total || 0), 0);

  // Divisão das Mesas Físicas em Numéricas e Especiais (Sempre Ordenadas Numericamente)
  const sortedMesasList = sortMesas(mesasList);
  const mesasNumericas = sortedMesasList.filter((m) => isMesaNumerica(m.nome));
  const mesasEspeciais = sortedMesasList.filter((m) => !isMesaNumerica(m.nome));

  const filteredMesasMapa = sortedMesasList.filter((m) => {
    if (categoriaMesaTab === "numericas") return isMesaNumerica(m.nome);
    if (categoriaMesaTab === "especiais") return !isMesaNumerica(m.nome);
    return true;
  });

  // Comandas ativas da mesa selecionada no modal "Ver Comandas"
  const comandasDaMesaSelecionada = verComandasMesaModal
    ? vendasAbertas.filter((v) => v.mesa?.id === verComandasMesaModal.id)
    : [];

  return (
    <AppShell
      title="Vendas Abertas"
      description="Gerenciamento de comandas e mesas."
      actions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto flex-1">
          {/* TOTAL EM ABERTO RESUMO NO CABEÇALHO */}
          <div className="h-10 px-4 rounded-lg border border-brand/30 bg-brand/10 flex items-center justify-between gap-3 shadow-xs flex-1 w-full sm:w-auto min-w-[180px]">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Total em Aberto:</span>
            <span className="font-extrabold text-foreground text-sm font-mono tracking-tight shrink-0">
              {brl(valorTotalAberto)}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={handleOpenGerenciarMesas}
            className="h-10 px-4 text-xs font-medium w-full sm:w-auto justify-center shrink-0"
            title="Ajuste e criação de mesas do restaurante"
          >
            <Settings2 className="size-4 mr-1.5" /> Gerenciar Mesas
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchVendasAbertas()}
            className="size-10 shrink-0"
            title="Recarregar"
          >
            <RefreshCw className={`size-4 transition-transform ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={() => handleOpenNovaVendaModal()}
            size="lg"
            className="bg-brand text-primary-foreground hover:opacity-90 font-bold h-10 px-4 shadow-sm w-full sm:w-auto justify-center shrink-0"
          >
            <Plus className="size-4 mr-1" /> Abrir Nova Comanda
          </Button>
        </div>
      }
    >
      {/* CARD PRINCIPAL CONTENDO OS FILTROS E CONTEÚDO */}
      <Card className="p-4 sm:p-6 shadow-sm border bg-card">
        {/* BARRA DE FERRAMENTAS DE FILTROS (ESQUERDA) E SELETOR DE EXIBIÇÃO (DIREITA) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          {/* ESQUERDA: ABAS DE FILTRO DA VISÃO ATIVA */}
          {modoExibicao === "COMANDAS" ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto overflow-x-auto justify-start">
                <TabsTrigger
                  value="TODOS"
                  className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-primary"
                >
                  <Receipt className="size-4 text-muted-foreground transition-colors shrink-0" /> Todas ({vendasAbertas.length})
                </TabsTrigger>
                <TabsTrigger
                  value="LOCAL"
                  className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-primary"
                >
                  <Utensils className="size-4 text-primary/70 transition-colors shrink-0" /> Consumo Local ({vendasAbertas.filter((v) => !v.tipoAtendimento || v.tipoAtendimento === "LOCAL").length})
                </TabsTrigger>
                <TabsTrigger
                  value="RETIRADA"
                  className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-purple-500"
                >
                  <ShoppingBag className="size-4 text-purple-500/70 transition-colors shrink-0" /> Retirada ({vendasAbertas.filter((v) => v.tipoAtendimento === "RETIRADA" || v.tipoAtendimento === "BALCAO").length})
                </TabsTrigger>
                <TabsTrigger
                  value="DELIVERY"
                  className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-amber-500"
                >
                  <Truck className="size-4 text-amber-500/70 transition-colors shrink-0" /> Delivery ({vendasAbertas.filter((v) => v.tipoAtendimento === "DELIVERY").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <Tabs value={categoriaMesaTab} onValueChange={setCategoriaMesaTab} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto overflow-x-auto justify-start">
                <TabsTrigger
                  value="todas"
                  className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-primary"
                >
                  <Receipt className="size-4 text-muted-foreground transition-colors shrink-0" /> Todas ({mesasList.length})
                </TabsTrigger>
                <TabsTrigger
                  value="numericas"
                  className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-primary"
                >
                  <Hash className="size-4 text-muted-foreground transition-colors shrink-0" /> Numéricas ({mesasNumericas.length})
                </TabsTrigger>
                <TabsTrigger
                  value="especiais"
                  className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-amber-500"
                >
                  <Sparkles className="size-4 text-amber-500/70 transition-colors shrink-0" /> Especiais ({mesasEspeciais.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* DIREITA: SELETOR DE MODO DE EXIBIÇÃO (COMANDAS vs MESAS) */}
          <Tabs
            value={modoExibicao}
            onValueChange={(val: any) => {
              setModoExibicao(val);
              if (val === "MESAS" && mesasList.length === 0) fetchMesasFisicas();
            }}
            className="shrink-0"
          >
            <TabsList>
              <TabsTrigger
                value="COMANDAS"
                className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-primary"
              >
                <Receipt className="size-4 text-muted-foreground transition-colors shrink-0" /> Comandas
              </TabsTrigger>
              <TabsTrigger
                value="MESAS"
                className="flex items-center gap-1.5 text-sm font-semibold data-[state=active]:[&_svg]:text-primary"
              >
                <LayoutGrid className="size-4 text-muted-foreground transition-colors shrink-0" /> Mesas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* MODO COMANDAS: GRADE PRINCIPAL DE COMANDAS ABERTAS */}
        {modoExibicao === "COMANDAS" ? (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full flex h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="size-6 animate-spin mr-2" />
                Carregando comandas...
              </div>
            ) : error ? (
              <div className="col-span-full flex h-48 flex-col items-center justify-center text-destructive">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={() => fetchVendasAbertas()} className="mt-2">
                  Tentar Novamente
                </Button>
              </div>
            ) : filteredVendas.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                {(() => {
                  if (activeTab === "LOCAL") {
                    return <Utensils className="size-10 text-primary/60 mb-3" />;
                  }
                  if (activeTab === "RETIRADA") {
                    return <ShoppingBag className="size-10 text-purple-500/60 mb-3" />;
                  }
                  if (activeTab === "DELIVERY") {
                    return <Truck className="size-10 text-amber-500/60 mb-3" />;
                  }
                  return <Receipt className="size-10 text-muted-foreground/50 mb-3" />;
                })()}
                <p className="text-base font-semibold text-foreground">
                  Nenhuma comanda aberta nesta categoria
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {activeTab === "LOCAL"
                    ? "Não há comandas ativas nas mesas do salão neste momento."
                    : activeTab === "RETIRADA"
                    ? "Não há comandas ativas para retirada no balcão neste momento."
                    : activeTab === "DELIVERY"
                    ? "Não há comandas ativas de entrega neste momento."
                    : "Não há nenhuma comanda em aberto no sistema neste momento."}
                </p>
              </div>
            ) : (
              filteredVendas.map((v) => {
                const defaultBadge = { label: "Consumo Local", style: "border-primary/30 bg-primary/10 text-primary font-semibold" };
                const badge = (v.tipoAtendimento && channelBadge[v.tipoAtendimento]) || defaultBadge;

                const isDelivery = v.tipoAtendimento === "DELIVERY";
                const isRetirada = v.tipoAtendimento === "RETIRADA" || v.tipoAtendimento === "BALCAO";

                const cardHoverBorder = isDelivery
                  ? "hover:border-amber-500/50"
                  : isRetirada
                  ? "hover:border-purple-500/50"
                  : "hover:border-primary/50";

                const titleHoverColor = isDelivery
                  ? "group-hover:text-amber-500"
                  : isRetirada
                  ? "group-hover:text-purple-500"
                  : "group-hover:text-primary";

                return (
                  <Card
                    key={v.id}
                    className={`shadow-card relative flex flex-col justify-between transition-all cursor-pointer group border ${cardHoverBorder}`}
                    onClick={() => handleOpenVerItensComanda(v)}
                  >
                    <CardHeader className="space-y-1.5 pb-2">
                      {/* LINHA 1: NOME DA COMANDA E BADGE NA MESMA LINHA */}
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className={`text-base font-bold flex items-center gap-2 transition-colors ${titleHoverColor}`}>
                          {isDelivery ? (
                            <Truck className="size-4 text-amber-500 shrink-0" />
                          ) : isRetirada ? (
                            <ShoppingBag className="size-4 text-purple-500 shrink-0" />
                          ) : (
                            <Utensils className="size-4 text-primary shrink-0" />
                          )}
                          <span>Comanda #{v.id}</span>
                        </CardTitle>

                        {v.mesa?.nome ? (
                          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold shrink-0">
                            <MapPin className="size-3 mr-1" /> {v.mesa.nome}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={`${badge.style} shrink-0`}>
                            {badge.label}
                          </Badge>
                        )}
                      </div>

                      {/* LINHA 2: NOME DO CLIENTE EM LINHA NOVA */}
                      {(() => {
                        const nomeExibicao = v.cliente?.nome || v.nomeCliente || "Cliente não identificado";
                        const isCadastrado = Boolean(
                          v.cliente?.id && (v.cliente.telefone || clientesList.some((c) => c.id === v.cliente?.id))
                        );
                        return (
                          <p className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1.5 pt-0.5" title={nomeExibicao}>
                            <User className={`size-3.5 shrink-0 ${isCadastrado ? "text-primary fill-primary/10" : "text-muted-foreground"}`} />
                            <span className="truncate">{nomeExibicao}</span>
                          </p>
                        );
                      })()}
                    </CardHeader>

                    <CardContent className="space-y-2.5 pt-2">
                      {/* 1. HORÁRIO DE ABERTURA COM ÍCONE DE RELÓGIO */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground shrink-0" />
                          <span>Abertura</span>
                        </span>
                        <span className="font-medium text-foreground font-mono">
                          {v.dataInicioVenda
                            ? new Date(v.dataInicioVenda).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>

                      {/* 2. ENDEREÇO (SE TIVER) COM ÍCONE DE PIN */}
                      {v.endereco && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                            <span>Endereço</span>
                          </span>
                          <span className="font-medium text-foreground truncate max-w-40" title={`${v.endereco.rua}, Nº ${v.endereco.numero}`}>
                            {v.endereco.rua}, {v.endereco.numero}
                          </span>
                        </div>
                      )}
                      <Separator />
                      {(() => {
                        const { totalConsumido, disponivelParaPagar, podeFechar } = getVendaCalculos(v);
                        const valorPago = v.valorPago || 0;

                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground font-medium">Total consumido</span>
                              <span className="text-base font-bold text-foreground font-mono">{brl(totalConsumido)}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed">
                              <span className="text-muted-foreground font-medium">Disponível p/ Pagar</span>
                              <span className={cn("font-bold font-mono", disponivelParaPagar > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/70")}>
                                {brl(disponivelParaPagar)}
                              </span>
                            </div>

                            {valorPago > 0 && (
                              <div className="flex justify-between text-[11px] font-mono pt-1 border-t border-dashed">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  Pago: {brl(valorPago)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* BOTÕES DE AÇÃO NA COMANDA: OLHO | LANÇAR ITENS | FECHAR */}
                      <div
                        className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenVerItensComanda(v)}
                          className="size-9 text-muted-foreground hover:text-foreground shrink-0 border border-input/40"
                          title="Ver Consumo Lançado"
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleOpenLancarPedidoPage(v)}
                          className="flex-1 min-w-[120px] font-medium h-9 text-xs"
                        >
                          <Plus className="size-4 mr-0.5" /> Lançar Itens
                        </Button>

                        <Button
                          onClick={() => handleTentativaFecharComanda(v, "PARCIAL")}
                          disabled={checkingFecharVendaId === v.id || !getVendaCalculos(v).podeFechar}
                          className="bg-brand text-primary-foreground hover:opacity-90 font-semibold flex items-center justify-between gap-2 flex-1 min-w-[100px] w-full min-[390px]:w-auto h-9 text-xs px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!getVendaCalculos(v).podeFechar ? "Nenhum pedido concluído disponível para pagamento no momento" : "Encerrar / Pagamento"}
                        >
                          {checkingFecharVendaId === v.id ? (
                            <Loader2 className="size-4 animate-spin mx-auto" />
                          ) : (
                            <>
                              <span className="flex items-center gap-1.5">
                                <Receipt className="size-4" /> Fechar
                              </span>
                              <ChevronRight className="size-4 shrink-0" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* MODO MESAS: VISUALIZAÇÃO INTERATIVA DAS MESAS E COMANDAS */
        <div className="space-y-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {loadingMesas ? (
              <div className="col-span-full flex h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="size-6 animate-spin mr-2" />
                Carregando mapa do salão...
              </div>
            ) : filteredMesasMapa.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
                <Utensils className="size-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold text-foreground">Nenhuma mesa encontrada nesta categoria</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Gerencie ou crie mesas no Mapa do Salão para visualizar os atendimentos por mesa.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenGerenciarMesas}
                  className="mt-3 text-xs font-medium h-10 px-4"
                >
                  <Settings2 className="size-4 mr-1.5" /> Gerenciar Mesas
                </Button>
              </div>
            ) : (
              filteredMesasMapa.map((m) => {
                const isLivre = m.status !== false;
                const isNum = isMesaNumerica(m.nome);
                const comandasDaMesa = vendasAbertas.filter((v) => v.mesa?.id === m.id);
                const countComandas = comandasDaMesa.length;
                const totalValorMesa = comandasDaMesa.reduce((acc, curr) => acc + (curr.total || 0), 0);

                return (
                  <Card
                    key={m.id}
                    onClick={() => setVerComandasMesaModal(m)}
                    className={`shadow-card relative flex flex-col justify-between transition-all cursor-pointer group border ${
                      isLivre
                        ? "bg-card border-border hover:border-primary/50 hover:shadow-md"
                        : "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60 hover:shadow-md"
                    }`}
                  >
                    <CardHeader className="space-y-1.5 pb-2">
                      {/* LINHA 1: NOME DA MESA E BADGE NA MESMA LINHA */}
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                          {isNum ? (
                            <Hash className="size-4 text-muted-foreground shrink-0" />
                          ) : (
                            <Sparkles className="size-4 text-amber-500 shrink-0" />
                          )}
                          <span>{m.nome}</span>
                        </CardTitle>

                        <Badge
                          variant="outline"
                          className={
                            isLivre
                              ? "border-success/25 bg-success/12 text-success text-xs font-semibold shrink-0"
                              : "border-amber-500/30 bg-amber-500/12 text-amber-600 dark:text-amber-400 text-xs font-semibold shrink-0"
                          }
                        >
                          {isLivre ? "Livre" : "Ocupada"}
                        </Badge>
                      </div>

                      {/* LINHA 2: QUANTIDADE DE COMANDAS EM NOVA LINHA */}
                      <p className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1.5 pt-0.5">
                        <Receipt className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                          {countComandas === 0
                            ? "Nenhuma comanda em aberto"
                            : `${countComandas} comanda${countComandas > 1 ? "s" : ""} em aberto`}
                        </span>
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-2">
                      <Separator />

                      {/* TOTAL ACUMULADO DA MESA COM MESMO TAMANHO DO CARD DE COMANDA */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Total acumulado mesa
                        </span>
                        <span className="text-lg font-bold text-foreground font-mono">
                          {brl(totalValorMesa)}
                        </span>
                      </div>

                      <div className="pt-2 border-t flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant={countComandas > 0 ? "default" : "outline"}
                          onClick={() => setVerComandasMesaModal(m)}
                          className={`flex-1 h-9 text-xs ${
                            countComandas > 0 ? "bg-brand text-primary-foreground hover:opacity-90 font-bold" : ""
                          }`}
                        >
                          <Eye className="size-3.5 mr-1" /> Ver ({countComandas})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenNovaVendaModal(m.id?.toString(), "LOCAL")}
                          className="h-9 px-2.5 text-xs shrink-0"
                          title="Abrir Nova Comanda nesta Mesa"
                        >
                          <Plus className="size-3.5 mr-0.5" /> Comanda
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
      </Card>

      {/* BOTÃO FLUTUANTE FAB (+) DE ABRIR NOVA COMANDA */}
      <Button
        onClick={() => handleOpenNovaVendaModal()}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-brand text-primary-foreground hover:opacity-95 shadow-xl hover:scale-105 active:scale-95 transition-all p-0 flex items-center justify-center border border-brand/20 cursor-pointer"
        title="Abrir Nova Comanda"
        aria-label="Abrir Nova Comanda"
      >
        <Plus className="size-7 stroke-[2.5]" />
      </Button>

      {/* MODAL VER ITENS LANÇADOS NA COMANDA */}
      <Dialog
        open={verItensComandaModal !== null}
        onOpenChange={(open) => !open && setVerItensComandaModal(null)}
      >
        <DialogContent className="sm:max-w-lg sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              {(() => {
                const isDelivery = verItensComandaModal?.tipoAtendimento === "DELIVERY";
                const isRetirada = verItensComandaModal?.tipoAtendimento === "RETIRADA" || verItensComandaModal?.tipoAtendimento === "BALCAO";
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

                return (
                  <DialogTitle className={`text-lg font-bold flex items-center gap-2 transition-colors cursor-default ${titleHoverColor}`}>
                    <FileText className={`size-5 ${iconColor}`} />
                    Itens da Comanda #{verItensComandaModal?.id}
                  </DialogTitle>
                );
              })()}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {/* BADGE DE LOCAL / TIPO DE ATENDIMENTO */}
                {(() => {
                  const isDelivery = verItensComandaModal?.tipoAtendimento === "DELIVERY";
                  const isRetirada = verItensComandaModal?.tipoAtendimento === "RETIRADA" || verItensComandaModal?.tipoAtendimento === "BALCAO";
                  const mesaNome = verItensComandaModal?.mesa?.nome;

                  if (isDelivery) {
                    return (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/12 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <Truck className="size-3" /> Delivery
                      </Badge>
                    );
                  }

                  if (isRetirada) {
                    return (
                      <Badge variant="outline" className="border-purple-500/30 bg-purple-500/12 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center gap-1">
                        <ShoppingBag className="size-3" /> Retirada
                      </Badge>
                    );
                  }

                  return (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                      <MapPin className="size-3" /> {mesaNome || "Consumo Local"}
                    </Badge>
                  );
                })()}

                {/* BADGE DO CLIENTE */}
                {(() => {
                  const nomeExibicao = verItensComandaModal?.cliente?.nome || verItensComandaModal?.nomeCliente || "Sem cliente";
                  const isCadastrado = Boolean(
                    verItensComandaModal?.cliente?.id &&
                      (verItensComandaModal.cliente.telefone || clientesList.some((c) => c.id === verItensComandaModal.cliente?.id))
                  );
                  return (
                    <Badge variant="outline" className="border-border bg-muted/50 text-foreground text-xs font-medium flex items-center gap-1">
                      <User className={`size-3 ${isCadastrado ? "text-primary fill-primary/10" : "text-muted-foreground"}`} />
                      {nomeExibicao}
                    </Badge>
                  );
                })()}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleOpenEditarDadosComandaModal(verItensComandaModal)}
              className="size-10 text-muted-foreground hover:text-foreground shrink-0 border border-input/40"
              title="Editar Tipo de Atendimento, Mesa ou Cliente"
            >
              <Pencil className="size-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-4 py-2 border-t pt-3">
            {loadingItensComanda ? (
              <div className="flex h-36 items-center justify-center text-muted-foreground">
                <Loader2 className="size-6 animate-spin mr-2" />
                Carregando consumo lançado...
              </div>
            ) : (() => {
              const isItemCancelado = (item: ItemPedido) => {
                const sItem = (item.statusItem || "").toUpperCase();
                const sPed = (item.pedido?.statusPedido || "").toUpperCase();
                return sItem === "CANCELADO" || sPed === "CANCELADO";
              };
              const itensAtivos = itensLancadosDaComanda.filter((item) => !isItemCancelado(item));
              const itensCancelados = itensLancadosDaComanda.filter((item) => isItemCancelado(item));

              return (
                <div className="space-y-3">
                  {itensAtivos.length === 0 ? (
                    <div className="flex h-36 flex-col items-center justify-center text-muted-foreground py-6">
                      <ShoppingCart className="size-8 text-muted-foreground/50 mb-2" />
                      <p className="text-xs font-medium text-foreground">Nenhum item ativo nesta comanda.</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Os itens lançados foram cancelados ou removidos.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 z-10 backdrop-blur-xs">
                          <TableRow>
                            <TableHead className="text-xs font-semibold">Produto</TableHead>
                            <TableHead className="text-xs font-semibold text-center">Qtd</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                            <TableHead className="text-xs font-semibold text-center w-16">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {itensAtivos.map((item) => (
                            <TableRow key={item.id} className="text-xs">
                              <TableCell className="font-medium">
                                <p className="font-semibold text-foreground">{item.produto?.nome || "Produto"}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {brl(item.produto?.preco || 0)} un. {item.pedido?.id ? `(Ped. #${item.pedido.id})` : ""}
                                </p>
                              </TableCell>
                              <TableCell className="text-center font-bold font-mono">
                                {item.quantidade}x
                              </TableCell>
                              <TableCell className="text-right font-bold font-mono text-foreground">
                                {brl(item.total || 0)}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.pedido?.id ? (
                                  item.pedido.statusPedido === "Concluído" || item.pedido.statusPedido === "Concluido" ? (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-emerald-500/15 text-emerald-600 border-emerald-500/30 px-1.5 py-0.5"
                                      title="Pedido concluído na cozinha"
                                    >
                                      Concluído
                                    </Badge>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCliqueRemoverItem(item)}
                                      disabled={cancelingItemId === item.id}
                                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      title="Remover este item da comanda"
                                    >
                                      {cancelingItemId === item.id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="size-3.5" />
                                      )}
                                    </Button>
                                  )
                                ) : null}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* SEÇÃO AUDITORIA DE ITENS CANCELADOS */}
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
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {itensCancelados.map((item) => (
                              <div key={item.id} className="p-2 bg-card border rounded-md flex flex-col gap-1 text-[11px] shadow-sm">
                                <div className="flex justify-between items-start font-semibold">
                                  <span className="line-through text-muted-foreground">
                                    {item.produto?.nome || "Produto"} ({item.quantidade}x)
                                  </span>
                                  <span className="font-mono text-muted-foreground">{brl(item.total || 0)}</span>
                                </div>
                                {item.motivoCancelamento ? (
                                  <p className="text-[10px] text-destructive font-medium">
                                    Motivo: <span className="font-normal text-foreground">{item.motivoCancelamento}</span>
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-muted-foreground italic">
                                    Removido enquanto em Aberto (sem necessidade de justificativa)
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {verItensComandaModal && (() => {
              const { totalConsumido, disponivelParaPagar } = getVendaCalculos(verItensComandaModal);
              const valorPago = verItensComandaModal.valorPago || 0;

              return (
                <div className="space-y-2 text-xs p-3 rounded-lg bg-muted/40 border">
                  {verItensComandaModal.taxaEntrega ? (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxa de Entrega</span>
                      <span className="font-mono font-medium">{brl(verItensComandaModal.taxaEntrega)}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Total Consumido</span>
                    <span className="font-mono text-base font-bold text-foreground">{brl(totalConsumido)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-dashed">
                    <span className="text-muted-foreground font-semibold">Disponível p/ Pagar</span>
                    <span className={cn("font-mono text-base font-bold", disponivelParaPagar > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/70")}>
                      {brl(disponivelParaPagar)}
                    </span>
                  </div>

                  {valorPago > 0 && (
                    <div className="flex justify-between text-[11px] font-mono text-emerald-600 pt-1 border-t border-dashed">
                      <span>Pago até o momento</span>
                      <span className="font-bold">{brl(valorPago)}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t">
              {verItensComandaModal && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenExcluirComandaModal(verItensComandaModal)}
                  className="size-10 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 border border-destructive/30"
                  title="Excluir Comanda (Sem lançamento financeiro)"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
                {verItensComandaModal && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const v = verItensComandaModal;
                      setVerItensComandaModal(null);
                      handleOpenLancarPedidoPage(v);
                    }}
                    className="w-full sm:w-auto h-10 px-4 text-xs font-medium"
                  >
                    <Plus className="size-4 mr-1" /> Lançar Itens
                  </Button>
                )}
                {verItensComandaModal && (
                  <Button
                    onClick={async () => {
                      if (verItensComandaModal) {
                        const v = verItensComandaModal;
                        const ok = await handleTentativaFecharComanda(v, "PARCIAL");
                        if (ok) setVerItensComandaModal(null);
                      }
                    }}
                    disabled={checkingFecharVendaId === verItensComandaModal?.id || !getVendaCalculos(verItensComandaModal).podeFechar}
                    className="bg-brand text-primary-foreground hover:opacity-90 flex items-center justify-between font-bold w-full sm:w-auto h-10 px-4 text-xs gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!getVendaCalculos(verItensComandaModal).podeFechar ? "Nenhum pedido concluído disponível para pagamento no momento" : "Encerrar e Pagar"}
                  >
                    {checkingFecharVendaId === verItensComandaModal?.id ? (
                      <Loader2 className="size-4 animate-spin mx-auto" />
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5">
                          <Receipt className="size-4" /> Encerrar e Pagar
                        </span>
                        <ChevronRight className="size-4 shrink-0" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Dados da Comanda (Tipo de Atendimento, Mesa e Cliente) */}
      <Dialog
        open={editingComandaDados !== null}
        onOpenChange={(open) => !open && setEditingComandaDados(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold">
              <Pencil className="size-5 text-primary" />
              Editar Dados da Comanda #{editingComandaDados?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Altere o tipo de atendimento, transfira a comanda para outra mesa ou edite o nome do cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditarComandaDados} className="space-y-4 py-2">
            {/* TIPO DE ATENDIMENTO */}
            <div className="space-y-2">
              <Label>Tipo de Atendimento</Label>
              <Tabs value={editTipoAtendimento} onValueChange={setEditTipoAtendimento}>
                <TabsList className="grid grid-cols-3 w-full h-auto p-1">
                  <TabsTrigger
                    value="LOCAL"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-primary"
                  >
                    <Utensils className="size-4 text-primary/70 transition-colors shrink-0" />
                    <span className="truncate">Consumo Local</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="RETIRADA"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-purple-500"
                  >
                    <ShoppingBag className="size-4 text-purple-500/70 transition-colors shrink-0" />
                    <span className="truncate">Retirada</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="DELIVERY"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-amber-500"
                  >
                    <Truck className="size-4 text-amber-500/70 transition-colors shrink-0" />
                    <span className="truncate">Delivery</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* SELECIONAR / MOVER PARA OUTRA MESA (se LOCAL - OBRIGATÓRIO) */}
            {editTipoAtendimento === "LOCAL" && (
              <div className="space-y-2">
                <Label htmlFor="editMesa" className="flex items-center gap-1">
                  Mesa Vinculada <span className="text-destructive font-bold">*</span>
                </Label>
                <Select value={editMesaId} onValueChange={setEditMesaId}>
                  <SelectTrigger id="editMesa">
                    <SelectValue placeholder="Selecione uma mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesasList.map((m) => (
                      <SelectItem key={m.id} value={m.id?.toString() || ""}>
                        {m.nome} {m.status === false && m.id !== editingComandaDados?.mesa?.id ? "(Ocupada)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* CLIENTE (BUSCA CADASTRADOS OU NOME TEMPORÁRIO) */}
            <div className="space-y-2">
              <Label htmlFor="editClienteSearch">Cliente</Label>
              {editSelectedClienteId ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-accent/40 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="size-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {clientesList.find((c) => c.id?.toString() === editSelectedClienteId)?.nome ||
                          editingComandaDados?.cliente?.nome}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Cliente cadastrado</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditSelectedClienteId("");
                      setEditClienteSearchTerm("");
                      setIsEditClienteDropdownOpen(false);
                    }}
                    className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    title="Remover Seleção do Cliente Cadastrado"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 relative">
                  <div className="relative">
                    <Input
                      id="editClienteSearch"
                      type="text"
                      placeholder="Digite o nome do cliente ou pesquise cadastrado..."
                      value={editClienteSearchTerm}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditClienteSearchTerm(val);
                        setIsEditClienteDropdownOpen(val.trim().length > 0);
                      }}
                      className="pr-8 text-xs h-9"
                    />
                    {editClienteSearchTerm ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditClienteSearchTerm("");
                          setIsEditClienteDropdownOpen(false);
                        }}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : (
                      <Search className="size-3.5 absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none" />
                    )}
                  </div>

                  {/* Dropdown de Clientes Cadastrados */}
                  {isEditClienteDropdownOpen && editClienteSearchTerm.trim().length > 0 && (
                    <div className="border rounded-md bg-popover text-popover-foreground shadow-lg max-h-44 overflow-y-auto divide-y text-xs z-50">
                      {(() => {
                        const list = clientesList.filter((c) => {
                          const term = editClienteSearchTerm.toLowerCase();
                          return (
                            c.nome?.toLowerCase().includes(term) ||
                            c.telefone?.toLowerCase().includes(term)
                          );
                        });

                        if (list.length === 0) {
                          return (
                            <div className="p-2.5 text-xs text-muted-foreground italic">
                              Nenhum cliente cadastrado com "{editClienteSearchTerm}". O nome digitado será atribuído como identificador temporário da comanda.
                            </div>
                          );
                        }

                        return list.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setEditSelectedClienteId(c.id?.toString() || "");
                              setEditClienteSearchTerm("");
                              setIsEditClienteDropdownOpen(false);
                            }}
                            className="w-full text-left p-2.5 hover:bg-accent transition-colors flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{c.nome}</p>
                              {c.telefone && <p className="text-[10px] text-muted-foreground font-mono">{c.telefone}</p>}
                            </div>
                            <User className="size-3.5 text-muted-foreground shrink-0" />
                          </button>
                        ));
                      })()}
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground">
                    {editClienteSearchTerm.trim().length > 0
                      ? "Nome temporário (será usado para identificar esta comanda)."
                      : "Selecione um cliente da busca ou informe um nome temporário."}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingComandaDados(null)}
                disabled={savingComandaDados}
                className="h-10 px-4 text-xs font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand text-primary-foreground hover:opacity-90 font-bold h-10 px-4 text-xs shadow-xs"
                disabled={savingComandaDados || ((editTipoAtendimento === "LOCAL") && !editMesaId)}
              >
                {savingComandaDados ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" /> Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Gerenciamento de Mesas Físicas (Criação, Edição e Exclusão) */}
      <Dialog open={isGerenciarMesasOpen} onOpenChange={setIsGerenciarMesasOpen}>
        <DialogContent className="sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Settings2 className="size-5 text-primary" />
              Gerenciamento de Mesas
            </DialogTitle>
            <DialogDescription>
              Crie, edite, remova ou renomeie as mesas do seu espaço.
            </DialogDescription>
          </DialogHeader>

          {/* PAINEL ADMINISTRATIVO (CADASTRO/GERENCIAMENTO) */}
          <div className="space-y-4 py-2 pt-3">
            <div>
              <Tabs
                value={modoCriacaoMesa}
                onValueChange={(v: any) => setModoCriacaoMesa(v)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full h-auto p-1">
                  <TabsTrigger
                    value="lote"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-blue-500"
                  >
                    <Grid2X2Plus className="size-4 text-blue-500/70 transition-colors shrink-0" />
                    <span>Gerar Lote Numérico</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="individual"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-purple-500"
                  >
                    <Sparkles className="size-4 text-purple-500/70 transition-colors shrink-0" />
                    <span>Mesa Especial</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {modoCriacaoMesa === "lote" ? (
              <form onSubmit={handleGenerateMesasLote} className="space-y-3 bg-muted/20 p-3 rounded-lg border text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="loteQty" className="text-xs">Qtd. de Mesas</Label>
                    <Input
                      id="loteQty"
                      type="number"
                      min="1"
                      max="50"
                      placeholder="Ex: 10"
                      value={quantidadeLote}
                      onChange={(e) => setQuantidadeLote(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="lotePrefix" className="text-xs">Prefixo das Mesas</Label>
                    <Input
                      id="lotePrefix"
                      placeholder="Ex: Mesa, Varanda, Salão..."
                      value={prefixoLote}
                      onChange={(e) => setPrefixoLote(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand text-primary-foreground h-10 px-4 text-xs font-bold flex items-center justify-between shadow-xs"
                  disabled={generatingLote}
                >
                  {generatingLote ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Gerando mesas...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Grid2X2Plus className="size-4 shrink-0" />
                        <span>Gerar {quantidadeLote || 0} Mesas em Lote</span>
                      </div>
                      <ChevronRight className="size-4 shrink-0" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateMesaIndividual} className="flex gap-2 bg-muted/20 p-3 rounded-lg border text-xs">
                <Input
                  placeholder="Ex: Mesa VIP, Sacada 02, Balcão 01, Mesa da Família..."
                  value={novaMesaFisicaNome}
                  onChange={(e) => setNovaMesaFisicaNome(e.target.value)}
                  className="h-10 text-xs"
                  required
                />
                <Button type="submit" className="bg-brand text-primary-foreground h-10 px-4 text-xs font-bold flex items-center gap-2 shrink-0 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Plus className="size-4 shrink-0" />
                    <span>Criar Mesa Especial</span>
                  </div>
                  <ChevronRight className="size-4 shrink-0" />
                </Button>
              </form>
            )}

            <Separator />

            {/* LISTA DE MESAS EM TABELA COM EDIÇÃO / EXCLUSÃO */}
            {loadingMesas ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin mr-2" />
                Carregando mesas...
              </div>
            ) : mesasList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Nenhuma mesa cadastrada.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Mesa</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                        <TableHead className="text-xs font-semibold">Tipo</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mesasList.map((m) => {
                        const isLivre = m.status !== false;
                        const isBasica = /^(mesa\s*\d+|\d+)$/i.test((m.nome || "").trim());

                        return (
                          <TableRow key={m.id} className="text-xs">
                            <TableCell className="font-bold text-foreground py-2">
                              {m.nome}
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge
                                variant="outline"
                                className={
                                  isLivre
                                    ? "border-success/25 bg-success/12 text-success text-[10px] px-2 py-0.5"
                                    : "border-amber-500/30 bg-amber-500/12 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5"
                                }
                              >
                                {isLivre ? "Livre" : "Ocupada"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge
                                variant="outline"
                                className={
                                  isBasica
                                    ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5"
                                    : "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] px-2 py-0.5"
                                }
                              >
                                {isBasica ? "Básica" : "Especial"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-2">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditMesa(m)}
                                  className="size-7 text-muted-foreground hover:text-foreground"
                                  title="Dar Apelido / Editar Nome"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                {m.id && isLivre && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteMesaFisica(m.id!)}
                                    className="size-7 text-destructive hover:text-destructive"
                                    title="Excluir Mesa (Reorganiza sequência)"
                                  >
                                    <Trash2 className="size-3.5" />
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Comandas da Mesa Selecionada */}
      <Dialog
        open={verComandasMesaModal !== null}
        onOpenChange={(open) => !open && setVerComandasMesaModal(null)}
      >
        <DialogContent className="sm:max-w-3xl sm:max-h-[85vh] overflow-y-auto pt-7">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Utensils className="size-4 text-primary" />
              Comandas — {verComandasMesaModal?.nome}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-3">
            {comandasDaMesaSelecionada.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground border rounded-xl bg-card p-6 my-2 text-center">
                <FileText className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold text-foreground">Nenhuma comanda aberta nesta mesa</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mesa Livre
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto p-1">
                {comandasDaMesaSelecionada.map((comanda) => (
                  <div
                    key={comanda.id}
                    className="p-3 border rounded-xl bg-card flex flex-col justify-between gap-2 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="font-mono text-xs font-bold shrink-0">
                        Comanda #{comanda.id}
                      </Badge>
                      {(comanda.cliente || comanda.nomeCliente) && (() => {
                        const nomeExibicao = comanda.cliente?.nome || comanda.nomeCliente || "";
                        const isCadastrado = Boolean(
                          comanda.cliente?.id && (comanda.cliente.telefone || clientesList.some((c) => c.id === comanda.cliente?.id))
                        );
                        return (
                          <span className="font-medium text-xs text-muted-foreground truncate flex items-center gap-1.5" title={nomeExibicao}>
                            <User className={`size-3.5 shrink-0 ${isCadastrado ? "text-primary fill-primary/10" : "text-muted-foreground"}`} />
                            <span className="truncate">{nomeExibicao}</span>
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground shrink-0" />
                        <span>Abertura</span>
                      </span>
                      <span className="font-medium text-foreground font-mono">
                        {comanda.dataInicioVenda
                          ? new Date(comanda.dataInicioVenda).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </span>
                    </div>

                    <Separator />
                    {(() => {
                      const { totalConsumido, disponivelParaPagar } = getVendaCalculos(comanda);
                      const valorPago = comanda.valorPago || 0;

                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">Total consumido</span>
                            <span className="text-base font-bold text-foreground font-mono">{brl(totalConsumido)}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed">
                            <span className="text-muted-foreground font-medium">Disponível p/ Pagar</span>
                            <span className={cn("font-bold font-mono", disponivelParaPagar > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/70")}>
                              {brl(disponivelParaPagar)}
                            </span>
                          </div>

                          {valorPago > 0 && (
                            <div className="flex justify-between text-[11px] font-mono pt-1 border-t border-dashed">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                Pago: {brl(valorPago)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* BOTÕES DE AÇÃO NA COMANDA (2 LINHAS PADRONIZADAS) */}
                    <div
                      className="flex flex-col gap-2 pt-2 mt-2 border-t"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* LINHA 01: EDITAR & REMOVER (ÍCONES DO MESMO TAMANHO) & LANÇAR ITENS */}
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setVerComandasMesaModal(null);
                            handleOpenEditarDadosComandaModal(comanda);
                          }}
                          className="size-9 text-muted-foreground hover:text-foreground border border-input/40 shrink-0"
                          title="Editar Dados da Comanda (Atendimento, Mesa ou Cliente)"
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setVerComandasMesaModal(null);
                            handleOpenExcluirComandaModal(comanda);
                          }}
                          className="size-9 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 shrink-0"
                          title="Excluir Comanda (Sem lançamento financeiro)"
                        >
                          <Trash2 className="size-4" />
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setVerComandasMesaModal(null);
                            handleOpenLancarPedidoPage(comanda);
                          }}
                          className="h-9 px-3 text-xs font-medium flex-1 justify-center"
                        >
                          <Plus className="size-4 mr-1" /> Lançar Itens
                        </Button>
                      </div>

                      {/* LINHA 02: VISUALIZAR (ÍCONE) & FECHAR */}
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setVerComandasMesaModal(null);
                            handleOpenVerItensComanda(comanda);
                          }}
                          className="size-9 text-muted-foreground hover:text-foreground shrink-0 border border-input/40"
                          title="Ver Consumo Lançado"
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          onClick={async () => {
                            const ok = await handleTentativaFecharComanda(comanda, "PARCIAL");
                            if (ok) setVerComandasMesaModal(null);
                          }}
                          disabled={checkingFecharVendaId === comanda.id || !getVendaCalculos(comanda).podeFechar}
                          className="bg-brand text-primary-foreground hover:opacity-90 font-bold h-9 px-3 text-xs flex-1 flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!getVendaCalculos(comanda).podeFechar ? "Nenhum pedido concluído disponível para pagamento no momento" : "Encerrar / Pagamento"}
                        >
                          {checkingFecharVendaId === comanda.id ? (
                            <Loader2 className="size-4 animate-spin mx-auto" />
                          ) : (
                            <>
                              <span className="flex items-center gap-1.5">
                                <Receipt className="size-4" /> Fechar
                              </span>
                              <ChevronRight className="size-4 shrink-0" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTÃO BLOCK ABRIR NOVA COMANDA NO RODAPÉ DO MODAL */}
          {verComandasMesaModal?.id && (
            <div className="pt-3 border-t mt-2">
              <Button
                onClick={() => {
                  const mId = verComandasMesaModal.id!.toString();
                  setVerComandasMesaModal(null);
                  handleOpenNovaVendaModal(mId);
                }}
                className="w-full bg-brand text-primary-foreground hover:opacity-90 font-bold h-10 px-4 text-xs shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Plus className="size-4 shrink-0" />
                  <span>Abrir Nova Comanda</span>
                </div>
                <ChevronRight className="size-4 shrink-0" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar Apelido/Nome da Mesa */}
      <Dialog open={editingMesa !== null} onOpenChange={(open) => !open && setEditingMesa(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Apelido da Mesa</DialogTitle>
            <DialogDescription>
              Altere a identificação ou dê um apelido para a mesa física.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditMesa} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editMesaName">Nome / Apelido</Label>
              <Input
                id="editMesaName"
                placeholder="Ex: Mesa 01 - Janela, VIP Sacada, Balcão 01..."
                value={editMesaNome}
                onChange={(e) => setEditMesaNome(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2 flex justify-end">
              <Button type="submit" className="bg-brand text-primary-foreground hover:opacity-90 font-bold h-10 px-4 text-xs shadow-xs" disabled={savingEditMesa}>
                {savingEditMesa ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" /> Salvando...
                  </>
                ) : (
                  "Salvar Apelido"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Abrir Nova Comanda */}
      <Dialog open={isNovaVendaModalOpen} onOpenChange={setIsNovaVendaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir Nova Comanda</DialogTitle>
            <DialogDescription>
              Selecione o atendimento e as informações.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateVenda} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Atendimento</Label>
              <Tabs value={tipoAtendimento} onValueChange={setTipoAtendimento}>
                <TabsList className="grid grid-cols-3 w-full h-auto p-1">
                  <TabsTrigger
                    value="LOCAL"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-primary"
                  >
                    <Utensils className="size-4 text-primary/70 transition-colors shrink-0" />
                    <span className="truncate">Consumo Local</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="RETIRADA"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-purple-500"
                  >
                    <ShoppingBag className="size-4 text-purple-500/70 transition-colors shrink-0" />
                    <span className="truncate">Retirada</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="DELIVERY"
                    className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-amber-500"
                  >
                    <Truck className="size-4 text-amber-500/70 transition-colors shrink-0" />
                    <span className="truncate">Delivery</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* SEÇÃO CONSUMO LOCAL (MESA FÍSICA) */}
            {tipoAtendimento === "LOCAL" && (
              <div className="space-y-3 border-t pt-3">
                {mesasList.length > 0 ? (
                  <div className="space-y-2">
                    <Label htmlFor="selectMesa">Mesa do Consumo Local <span className="text-destructive">*</span></Label>
                    <Select value={selectedMesaId} onValueChange={setSelectedMesaId}>
                      <SelectTrigger id="selectMesa">
                        <SelectValue placeholder="Selecione a mesa do consumo local" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedMesasList.map((m) => {
                          const countComandas = vendasAbertas.filter((v) => v.mesa?.id === m.id).length;
                          return (
                            <SelectItem key={m.id} value={m.id?.toString() || ""}>
                              {m.nome} {countComandas > 0 ? `(Ocupada - ${countComandas} comanda${countComandas > 1 ? "s" : ""})` : "(LIVRE)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="p-3 border rounded-lg bg-muted/20 text-xs space-y-2">
                    <p className="font-semibold text-destructive">Nenhuma mesa cadastrada para Consumo Local.</p>
                    <p className="text-muted-foreground">
                      Cadastre mesas no Mapa do Salão para abrir atendimentos de Consumo Local.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsNovaVendaModalOpen(false);
                        handleOpenGerenciarMesas();
                      }}
                      className="w-full text-xs"
                    >
                      <LayoutGrid className="size-3.5 mr-1" /> Ir para Mapa de Mesas
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* CAMPO UNIFICADO DE CLIENTE (PARA LOCAL, RETIRADA E DELIVERY) */}
            <div className="space-y-2 border-t pt-3">
              <Label htmlFor="cliSearchUnified">
                {tipoAtendimento === "DELIVERY" ? "Cliente" : "Nome do Cliente / Identificação (Opcional)"}
              </Label>

              {selectedClienteId ? (
                <div className="p-3 border rounded-lg bg-card shadow-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <User className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-xs">
                        {clientesList.find((c) => c.id?.toString() === selectedClienteId)?.nome}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">Cliente cadastrado</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedClienteId("");
                      setClienteSearchTerm("");
                      setIsClienteDropdownOpen(false);
                    }}
                    className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    title="Remover Seleção do Cliente"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 relative">
                  <div className="relative">
                    <Input
                      id="cliSearchUnified"
                      type="text"
                      placeholder="Digite o nome do cliente ou pesquise cadastrado..."
                      value={clienteSearchTerm || (tipoAtendimento === "LOCAL" ? nomeClienteConsumoLocal : nomeClienteRetirada)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (tipoAtendimento === "LOCAL") setNomeClienteConsumoLocal(val);
                        if (tipoAtendimento === "RETIRADA" || tipoAtendimento === "BALCAO") setNomeClienteRetirada(val);
                        setClienteSearchTerm(val);
                        setIsClienteDropdownOpen(val.trim().length > 0);

                        const matched = clientesList.find((c) => c.nome.toLowerCase() === val.trim().toLowerCase());
                        if (matched && matched.id) {
                          setSelectedClienteId(matched.id.toString());
                        }
                      }}
                      className="pr-8 text-xs h-9"
                    />
                    {(clienteSearchTerm || nomeClienteConsumoLocal || nomeClienteRetirada) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNomeClienteConsumoLocal("");
                          setNomeClienteRetirada("");
                          setClienteSearchTerm("");
                          setIsClienteDropdownOpen(false);
                        }}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : (
                      <Search className="size-3.5 absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none" />
                    )}
                  </div>

                  {/* Dropdown de Clientes Cadastrados */}
                  {isClienteDropdownOpen && clienteSearchTerm.trim().length > 0 && (
                    <div className="border rounded-md bg-popover text-popover-foreground shadow-lg max-h-44 overflow-y-auto divide-y text-xs z-50">
                      {(() => {
                        const list = clientesList.filter((c) => {
                          const term = clienteSearchTerm.toLowerCase();
                          return (
                            c.nome?.toLowerCase().includes(term) ||
                            c.telefone?.toLowerCase().includes(term)
                          );
                        });

                        if (list.length === 0) {
                          return (
                            <div className="p-2.5 text-xs text-muted-foreground italic">
                              Nenhum cliente cadastrado com "{clienteSearchTerm}". O nome digitado será atribuído como identificador da comanda.
                            </div>
                          );
                        }

                        return list.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              const cid = c.id?.toString() || "";
                              setSelectedClienteId(cid);
                              setClienteSearchTerm(c.nome);
                              setNomeClienteConsumoLocal("");
                              setNomeClienteRetirada("");
                              setIsClienteDropdownOpen(false);
                              if (c.id) {
                                apiEnderecos.listarPorCliente(c.id).then((ends) => {
                                  setEnderecosCliente(ends || []);
                                  if (ends && ends.length > 0 && ends[0]?.id) {
                                    setSelectedEnderecoId(ends[0].id.toString());
                                  } else {
                                    setSelectedEnderecoId("");
                                  }
                                });
                              }
                            }}
                            className="w-full text-left p-2.5 hover:bg-accent transition-colors flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{c.nome}</p>
                              {c.telefone && <p className="text-[10px] text-muted-foreground font-mono">{c.telefone}</p>}
                            </div>
                            <User className="size-3.5 text-muted-foreground shrink-0" />
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Selecione um cliente da busca ou apenas informe um nome para identificação.
                  </p>
                </div>
              )}
            </div>

            {/* SEÇÃO DELIVERY (ENDEREÇO E TAXA DE ENTREGA) */}
            {tipoAtendimento === "DELIVERY" && (
              <div className="space-y-3 border-t pt-3 text-xs">
                <div className="space-y-2 pb-1">
                  <Label htmlFor="endSelect">Endereço de Entrega</Label>
                  {!selectedClienteId ? (
                    <p className="text-xs text-muted-foreground italic">
                      Selecione um cliente cadastrado com endereço(s) salvo(s).
                    </p>
                  ) : enderecosCliente.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhum endereço cadastrado para este cliente. Adicione na tela de Clientes.
                    </p>
                  ) : (
                    <Select value={selectedEnderecoId} onValueChange={setSelectedEnderecoId}>
                      <SelectTrigger id="endSelect">
                        <SelectValue placeholder="Selecione o endereço" />
                      </SelectTrigger>
                      <SelectContent>
                        {enderecosCliente.map((e) => (
                          <SelectItem key={e.id} value={e.id?.toString() || ""}>
                            {e.rua}, Nº {e.numero} - {e.bairro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 pt-1">
                  <Label htmlFor="taxa">Taxa de Entrega (R$)</Label>
                  <Input
                    id="taxa"
                    type="number"
                    step="0.50"
                    min="0"
                    placeholder="0.00"
                    value={taxaEntrega}
                    onChange={(e) => setTaxaEntrega(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full bg-brand text-primary-foreground hover:opacity-90 font-bold flex items-center justify-between h-10 px-4 text-xs shadow-xs"
                disabled={submittingVenda}
              >
                {submittingVenda ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Iniciando...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Receipt className="size-4 shrink-0" />
                      <span>Iniciar Comanda</span>
                    </div>
                    <ChevronRight className="size-4 shrink-0" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Fechar Comanda com Suporte a Desconto e Pagamento Parcial */}
      <Dialog
        open={vendaParaFechar !== null}
        onOpenChange={(open) => !open && setVendaParaFechar(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            {(() => {
              const isDelivery = vendaParaFechar?.tipoAtendimento === "DELIVERY";
              const isRetirada = vendaParaFechar?.tipoAtendimento === "RETIRADA" || vendaParaFechar?.tipoAtendimento === "BALCAO";
              const titleHoverColor = isDelivery
                ? "hover:text-amber-500"
                : isRetirada
                ? "hover:text-purple-500"
                : "hover:text-primary";

              return (
                <DialogTitle className={`text-lg font-bold flex items-center gap-2 transition-colors cursor-default ${titleHoverColor}`}>
                  <Receipt className="size-5 text-primary" />
                  Fechar Comanda #{vendaParaFechar?.id}?
                </DialogTitle>
              );
            })()}
            <DialogDescription className="text-xs">
              Modalidade de Pagamento
            </DialogDescription>
          </DialogHeader>

          {vendaParaFechar && (() => {
            const { totalConsumido: totalConsumidoCalc, disponivelParaPagar: maximoPermitidoParcial } = getVendaCalculos(vendaParaFechar);
            const valorPagoJaEfetuado = round2(vendaParaFechar.valorPago || 0);
            const saldoConsumoPendente = round2(Math.max(0, totalConsumidoCalc - valorPagoJaEfetuado));
            const temPedidosEmAberto = maximoPermitidoParcial < saldoConsumoPendente - 0.01;

            const descontoInputVal = round2(Math.max(0, parseFloat(descontoValorInput) || 0));
            const descontoNum = aplicarDesconto ? round2(Math.min(maximoPermitidoParcial, descontoInputVal)) : 0;

            const maximoPagamentoPermitido = round2(Math.max(0, maximoPermitidoParcial - descontoNum));

            const valorPagoNum = tipoFechamento === "PARCIAL"
              ? round2(Math.min(maximoPagamentoPermitido, Math.max(0, parseFloat(valorPagoParcialInput) || 0)))
              : maximoPagamentoPermitido;

            const abatimentoTotalNoAto = round2(valorPagoNum + descontoNum);
            const saldoRestanteGeralComanda = round2(Math.max(0, totalConsumidoCalc - (valorPagoJaEfetuado + abatimentoTotalNoAto)));

            const isComandaTotalmenteQuitada = saldoRestanteGeralComanda === 0 && !temPedidosEmAberto;
            const isEncerramento = tipoFechamento === "TOTAL" || isComandaTotalmenteQuitada;
            const isParcialBloqueado = tipoFechamento === "PARCIAL" && maximoPermitidoParcial <= 0;

            return (
              <div className="space-y-4 py-2 text-xs">
                {/* AVISO SE HOUVER PEDIDOS EM PREPARO NA COZINHA */}
                {temPedidosEmAberto && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    <span>
                      Há <strong>{brl(saldoConsumoPendente - maximoPermitidoParcial)}</strong> em pedidos abertos/preparo na cozinha. Conclua os pedidos abertos para poder encerrar a comanda.
                    </span>
                  </div>
                )}

                {/* TIPO DE PAGAMENTO: TOTAL OU PARCIAL */}
                <div>
                  <Tabs value={tipoFechamento} onValueChange={(v) => setTipoFechamento(v as "TOTAL" | "PARCIAL")}>
                    <TabsList className="grid grid-cols-2 w-full h-auto p-1">
                      <TabsTrigger
                        value="TOTAL"
                        disabled={temPedidosEmAberto}
                        title={temPedidosEmAberto ? "Conclua todos os pedidos na cozinha para liberar o encerramento total" : ""}
                        className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="size-4 text-emerald-500/70 transition-colors shrink-0" />
                        <span>Total</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="PARCIAL"
                        className="flex items-center gap-1.5 justify-center py-2 text-xs font-semibold data-[state=active]:[&_svg]:text-amber-500"
                      >
                        <PieChart className="size-4 text-amber-500/70 transition-colors shrink-0" />
                        <span>Parcial</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* FORMA DE PAGAMENTO */}
                <div className="space-y-1.5">
                  <Label htmlFor="formaPgto" className="font-semibold">Forma de Pagamento</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger id="formaPgto" className="h-9 text-xs">
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pix">
                        <div className="flex items-center gap-2">
                          <QrCode className="size-4 text-emerald-500 shrink-0" />
                          <span>Pix</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cartão de Crédito">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4 text-blue-500 shrink-0" />
                          <span>Cartão de Crédito</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cartão de Débito">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4 text-indigo-500 shrink-0" />
                          <span>Cartão de Débito</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Dinheiro">
                        <div className="flex items-center gap-2">
                          <Banknote className="size-4 text-green-600 shrink-0" />
                          <span>Dinheiro</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* VALOR PAGO PARCIAL (SE SELECIONADO PARCIAL) */}
                {tipoFechamento === "PARCIAL" && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="valorParcialInp" className="font-semibold">Valor à Pagar (R$)</Label>
                      <span className="text-[11px] text-muted-foreground font-mono font-bold text-amber-600">
                        Máx Pagamento: {brl(maximoPagamentoPermitido)}
                      </span>
                    </div>
                    <Input
                      id="valorParcialInp"
                      type="number"
                      step="1.00"
                      min="0"
                      max={maximoPagamentoPermitido}
                      disabled={isParcialBloqueado}
                      placeholder="0.00"
                      value={valorPagoParcialInput}
                      onChange={(e) => {
                        const val = round2(Math.max(0, parseFloat(e.target.value) || 0));
                        if (val > maximoPagamentoPermitido) {
                          setValorPagoParcialInput(maximoPagamentoPermitido.toFixed(2));
                        } else {
                          setValorPagoParcialInput(e.target.value);
                        }
                      }}
                      className="h-9 text-xs font-mono text-foreground"
                    />
                  </div>
                )}

                {/* CHECKBOX E INPUT DE DESCONTO */}
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="chkDesconto"
                      checked={aplicarDesconto}
                      disabled={isParcialBloqueado}
                      onCheckedChange={(chk) => {
                        const checked = Boolean(chk);
                        setAplicarDesconto(checked);
                        if (!checked) {
                          setDescontoValorInput("");
                          if (tipoFechamento === "PARCIAL") setValorPagoParcialInput(maximoPermitidoParcial.toString());
                        }
                      }}
                    />
                    <Label htmlFor="chkDesconto" className="text-xs font-semibold cursor-pointer select-none">
                      Aplicar Desconto (R$)
                    </Label>

                    {aplicarDesconto && (
                      <Input
                        id="descontoInp"
                        type="number"
                        step="0.50"
                        min="0"
                        max={maximoPermitidoParcial}
                        placeholder="0.00"
                        disabled={isParcialBloqueado}
                        value={descontoValorInput}
                        onChange={(e) => {
                          const dVal = round2(Math.max(0, parseFloat(e.target.value) || 0));
                          const cappedDesc = round2(Math.min(maximoPermitidoParcial, dVal));
                          setDescontoValorInput(e.target.value);

                          const pVal = round2(Math.max(0, parseFloat(valorPagoParcialInput) || 0));
                          if (pVal + cappedDesc > maximoPermitidoParcial) {
                            const newP = round2(Math.max(0, maximoPermitidoParcial - cappedDesc));
                            setValorPagoParcialInput(newP > 0 ? newP.toFixed(2) : "");
                          }
                        }}
                        className="h-8 w-28 text-xs font-mono ml-auto"
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <Separator />

                {/* RESUMO FINANCEIRO DO FECHAMENTO */}
                <div className="p-3 border rounded-lg bg-muted/40 space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total Consumido</span>
                    <span className="font-mono font-bold">{brl(totalConsumidoCalc)}</span>
                  </div>

                  <div className="flex justify-between font-semibold pt-1 border-t border-dashed">
                    <span className="text-muted-foreground">Disponível p/ Pagar</span>
                    <span className={cn("font-mono font-bold", maximoPermitidoParcial > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/70")}>
                      {brl(maximoPermitidoParcial)}
                    </span>
                  </div>

                  {descontoNum > 0 && (
                    <div className="flex justify-between text-emerald-600 font-normal pt-1 border-t border-dashed">
                      <span>Desconto Aplicado</span>
                      <span className="font-mono font-normal">- {brl(descontoNum)}</span>
                    </div>
                  )}

                  {tipoFechamento === "PARCIAL" && (
                    <>
                      <div className="flex justify-between text-amber-500 font-normal pt-1 border-t border-dashed">
                        <span>Valor Recebido Agora</span>
                        <span className="font-mono font-normal text-amber-500">{brl(valorPagoNum)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-foreground text-sm pt-2 border-t mt-1.5 items-center">
                        <span>Saldo Restante na Comanda</span>
                        <span className="font-mono text-base text-foreground font-bold">
                          {brl(saldoRestanteGeralComanda)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* BOTÕES DE AÇÃO NO RODAPÉ */}
                <DialogFooter className="pt-3 flex flex-row items-center justify-between gap-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVendaParaFechar(null)}
                    disabled={closingVenda}
                    className="h-10 px-4 text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFecharVenda}
                    disabled={closingVenda || (tipoFechamento === "PARCIAL" && (valorPagoNum <= 0 || maximoPermitidoParcial <= 0))}
                    className="h-10 px-4 text-xs font-bold bg-brand text-primary-foreground hover:opacity-90 shadow-xs flex items-center gap-1.5 ml-auto"
                  >
                    {closingVenda ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>
                          {isEncerramento
                            ? (valorPagoNum > 0 ? `Pagar e Encerrar ${brl(valorPagoNum)}` : "Pagar e Encerrar")
                            : (valorPagoNum > 0 ? `Pagar ${brl(valorPagoNum)}` : "Pagar")}
                        </span>
                        <ChevronRight className="size-4 shrink-0" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Modal Excluir Comanda (Com trava de segurança e motivo) */}
      <Dialog
        open={comandaParaExcluir !== null}
        onOpenChange={(open) => !open && setComandaParaExcluir(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 font-bold">
              <AlertTriangle className="size-5 text-destructive" /> Excluir Comanda #{comandaParaExcluir?.id}?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Esta ação excluirá a comanda da{" "}
              <strong>{comandaParaExcluir?.mesa?.nome || comandaParaExcluir?.cliente?.nome || "Retirada"}</strong>{" "}
              e não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg space-y-1 text-destructive font-medium">
              <p className="font-bold">Trava de Segurança</p>
              <p className="text-[11px] font-normal text-muted-foreground">
                Para confirmar a exclusão sem gerar caixa, digite exatamente o número <strong>{comandaParaExcluir?.id}</strong> e selecione o motivo.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="numConfirm">Confirme o Número da Comanda</Label>
              <Input
                id="numConfirm"
                type="text"
                placeholder={`Digite ${comandaParaExcluir?.id} para confirmar...`}
                value={confirmacaoNumero}
                onChange={(e) => setConfirmacaoNumero(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Motivo da Exclusão</Label>
              <Select value={motivoExclusaoOpcao} onValueChange={setMotivoExclusaoOpcao}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cliente desistiu">Cliente desistiu</SelectItem>
                  <SelectItem value="Erro no lançamento">Erro no lançamento / Duplicado</SelectItem>
                  <SelectItem value="Mesa trocada / comanda transferida">Mesa trocada / comanda transferida</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="obsExclusao">Observação Adicional (Opcional)</Label>
              <textarea
                id="obsExclusao"
                placeholder="Detalhes adicionais sobre a exclusão da comanda..."
                value={motivoExclusaoObs}
                onChange={(e) => setMotivoExclusaoObs(e.target.value)}
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          {(() => {
            const isNumeroValido = confirmacaoNumero.trim() === comandaParaExcluir?.id?.toString();
            const isFormValido = isNumeroValido;

            return (
              <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setComandaParaExcluir(null)}
                  disabled={deletingVenda}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium h-10 px-4 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmarExcluirComanda}
                  disabled={!isFormValido || deletingVenda}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium h-10 px-4 text-xs shadow-xs flex items-center gap-1"
                >
                  {deletingVenda ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1" /> Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4 mr-1" /> Confirmar Exclusão
                    </>
                  )}
                </Button>
              </DialogFooter>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Modal Motivo do Cancelamento do Item (Apenas para pedidos Em Preparo) */}
      <Dialog open={cancelItemTarget !== null} onOpenChange={(open) => !open && setCancelItemTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangle className="size-5" /> Motivo do Cancelamento do Item
            </DialogTitle>
            <DialogDescription className="text-xs">
              Este item pertence a um pedido <strong>Em preparo</strong> na cozinha. Informe o motivo do cancelamento para notificar a produção.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-2.5 bg-muted/40 rounded-lg border flex justify-between items-center">
              <span className="font-bold text-foreground">{cancelItemTarget?.produto?.nome} ({cancelItemTarget?.quantidade}x)</span>
              <span className="font-mono text-muted-foreground">{brl(cancelItemTarget?.total || 0)}</span>
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
              <Label htmlFor="obsCancel">Observação (Opcional)</Label>
              <textarea
                id="obsCancel"
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
              onClick={() => setCancelItemTarget(null)}
              disabled={cancelingItemId !== null}
              className="h-10 px-4 text-xs font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarCancelamento}
              disabled={cancelingItemId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium h-10 px-4 text-xs shadow-xs flex items-center gap-1"
            >
              {cancelingItemId !== null ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" /> Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="size-4 mr-1" /> Remover Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
