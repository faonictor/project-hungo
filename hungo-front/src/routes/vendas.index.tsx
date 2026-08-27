import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  LayoutGrid,
  Receipt,
  Settings2,
  Grid2X2Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  apiVendas,
  apiMesas,
  apiClientes,
  apiPedidos,
  apiItemPedido,
  apiFluxoFinanceiro,
  apiPagamentosComanda,
  Venda,
  Mesa,
  Cliente,
  ItemPedido,
} from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { NovaComandaModal } from "@/components/vendas/NovaComandaModal";
import { FecharComandaModal } from "@/components/vendas/FecharComandaModal";
import { EncerrarComandaModal } from "@/components/vendas/EncerrarComandaModal";
import { VerItensComandaModal } from "@/components/vendas/VerItensComandaModal";
import { GerenciarMesasModal } from "@/components/vendas/GerenciarMesasModal";
import { ExcluirComandaModal } from "@/components/vendas/ExcluirComandaModal";
import { EditarComandaModal } from "@/components/vendas/EditarComandaModal";
import { EstornoPagamentoModal } from "@/components/vendas/EstornoPagamentoModal";
import { PerguntaEstornoPedidoModal } from "@/components/pedidos/PerguntaEstornoPedidoModal";
import { MapaMesasView } from "@/components/vendas/MapaMesasView";
import { ComandasListView } from "@/components/vendas/ComandasListView";
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/vendas/")({
  head: () => ({
    meta: [
      { title: "Comandas — Hungo" },
      {
        name: "description",
        content: "Comandas em aberto no local, retirada e delivery.",
      },
    ],
  }),
  component: VendasPage,
});

const isMesaNumerica = (nome: string) => {
  return /^Mesa\s*\d+$/i.test((nome || "").trim());
};

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

function VendasPage() {
  const navigate = useNavigate();
  const [vendasAbertas, setVendasAbertas] = useState<Venda[]>([]);
  const [allItensAbertos, setAllItensAbertos] = useState<ItemPedido[]>([]);
  const [mesasList, setMesasList] = useState<Mesa[]>([]);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modoExibicao, setModoExibicao] = useState<"COMANDAS" | "MESAS">("COMANDAS");
  const [comandasActiveTab, setComandasActiveTab] = useState<string>("TODOS");

  // Modais
  const [isNovaVendaModalOpen, setIsNovaVendaModalOpen] = useState(false);
  const [presetNovaComandaMesaId, setPresetNovaComandaMesaId] = useState<string>("");
  const [presetNovaComandaTipoAtendimento, setPresetNovaComandaTipoAtendimento] = useState<string>("LOCAL");
  const [submittingNovaVenda, setSubmittingNovaVenda] = useState(false);

  const [isGerenciarMesasOpen, setIsGerenciarMesasOpen] = useState(false);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [generatingLote, setGeneratingLote] = useState(false);
  const [savingEditMesa, setSavingEditMesa] = useState(false);

  const [verItensComandaModal, setVerItensComandaModal] = useState<Venda | null>(null);
  const [itensLancadosDaComanda, setItensLancadosDaComanda] = useState<ItemPedido[]>([]);
  const [loadingItensComanda, setLoadingItensComanda] = useState(false);
  const [cancelingItemId, setCancelingItemId] = useState<number | null>(null);

  const [vendaParaFechar, setVendaParaFechar] = useState<Venda | null>(null);
  const [closingVenda, setClosingVenda] = useState(false);

  const [vendaParaEncerrar, setVendaParaEncerrar] = useState<Venda | null>(null);
  const [encerrandoVenda, setEncerrandoVenda] = useState(false);

  const [comandaParaExcluir, setComandaParaExcluir] = useState<Venda | null>(null);
  const [deletingVenda, setDeletingVenda] = useState(false);

  const [editingComandaDados, setEditingComandaDados] = useState<Venda | null>(null);
  const [savingComandaDados, setSavingComandaDados] = useState(false);

  const [perguntaEstornoItemData, setPerguntaEstornoItemData] = useState<{
    item: ItemPedido;
    venda: Venda;
    valorItem: number;
  } | null>(null);
  const [estornoModalVenda, setEstornoModalVenda] = useState<Venda | null>(null);
  const [estornoValorSugerido, setEstornoValorSugerido] = useState<number>(0);
  const [estornoMotivoSugerido, setEstornoMotivoSugerido] = useState<string>("");
  const [savingEstorno, setSavingEstorno] = useState<boolean>(false);

  const sortMesas = (list: Mesa[]) => {
    const numericas = list.filter((m) => isMesaNumerica(m.nome || ""));
    const especiais = list.filter((m) => !isMesaNumerica(m.nome || ""));

    numericas.sort((a, b) => {
      const numA = parseInt(a.nome?.replace(/\D/g, "") || "0", 10);
      const numB = parseInt(b.nome?.replace(/\D/g, "") || "0", 10);
      return numA - numB;
    });

    especiais.sort((a, b) => {
      return (a.nome || "").localeCompare(b.nome || "", undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    return [...numericas, ...especiais];
  };

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

  const fetchVendasAbertas = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vendasData, itensData, mesasData, clientesData] = await Promise.all([
        apiVendas.listarEmAberto(),
        apiPedidos.buscarItensEmAberto().catch(() => []),
        apiMesas.listar().catch(() => []),
        apiClientes.listar().catch(() => []),
      ]);
      setVendasAbertas(vendasData);
      setAllItensAbertos(itensData);
      setMesasList(sortMesas(mesasData));
      setClientesList(clientesData);
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
  }, []);

  const reorganizarMesasNumericas = async (currentList: Mesa[]) => {
    const numericas = currentList.filter((m) => isMesaNumerica(m.nome));
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

  const handleCreateMesaIndividual = async (nome: string) => {
    try {
      await apiMesas.salvar({ nome: nome.trim(), status: true });
      toast.success("Mesa cadastrada com sucesso!");
      fetchMesasFisicas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar mesa.");
    }
  };

  const handleGenerateMesasLote = async (prefix: string, qty: number) => {
    try {
      setGeneratingLote(true);
      const cleanPrefix = prefix.trim() || "Mesa";
      const existingNumbers = mesasList
        .map((m) => {
          if (!m.nome) return 0;
          const escapedPrefix = cleanPrefix.replace(/[-\/\\^$*+?.()|[\]]/g, "\\$&");
          const match = m.nome.match(new RegExp(`^${escapedPrefix}\\s*(\\d+)`, "i"));
          return match && match[1] ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));

      const startNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

      for (let i = 0; i < qty; i++) {
        const numFormatted = String(startNum + i).padStart(2, "0");
        const nomeMesa = `${cleanPrefix} ${numFormatted}`;
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

  const handleSaveEditMesa = async (mesa: Mesa, novoNome: string) => {
    if (!mesa.id) return;
    try {
      setSavingEditMesa(true);
      await apiMesas.atualizar(mesa.id, {
        ...mesa,
        nome: novoNome.trim(),
      });
      const updatedList = mesasList.map((m) =>
        m.id === mesa.id ? { ...m, nome: novoNome.trim() } : m
      );
      await reorganizarMesasNumericas(updatedList);
      toast.success("Apelido da mesa atualizado!");
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
      await reorganizarMesasNumericas(remainingList);
      toast.success("Mesa removida e sequência numérica reorganizada!");
      fetchMesasFisicas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover mesa.");
    }
  };

  const handleOpenNovaVenda = (mesaIdPreset?: string, tipoPreset?: string) => {
    setPresetNovaComandaMesaId(mesaIdPreset || "");
    setPresetNovaComandaTipoAtendimento(tipoPreset || (mesaIdPreset ? "LOCAL" : "LOCAL"));
    setIsNovaVendaModalOpen(true);
  };

  const handleCreateNovaVendaSubmit = async (payload: {
    tipoAtendimento: string;
    mesaId?: string;
    clienteId?: string;
    nomeCliente?: string;
    enderecoId?: string;
    taxaEntrega?: number;
  }) => {
    try {
      setSubmittingNovaVenda(true);
      let mesaObj: Mesa | null = null;
      let clienteObj: Cliente | null = null;

      if (payload.tipoAtendimento === "LOCAL" && payload.mesaId) {
        const found = mesasList.find((m) => m.id?.toString() === payload.mesaId);
        if (found && found.id) {
          mesaObj = found;
          await apiMesas.atualizar(found.id, { ...found, status: false });
        }
      }

      if (payload.clienteId) {
        const foundCli = clientesList.find((c) => c.id?.toString() === payload.clienteId);
        if (foundCli) clienteObj = foundCli;
      }

      const body: Partial<Venda> = {
        tipoAtendimento: payload.tipoAtendimento,
        mesa: mesaObj,
        cliente: clienteObj,
        nomeCliente: payload.nomeCliente || null,
        endereco:
          payload.tipoAtendimento === "DELIVERY" && payload.enderecoId
            ? ({ id: parseInt(payload.enderecoId, 10) } as any)
            : null,
        taxaEntrega: payload.taxaEntrega || 0,
        total: payload.taxaEntrega || 0,
      };

      const vendaCriada = await apiVendas.salvar(body);
      toast.success(
        payload.tipoAtendimento === "LOCAL"
          ? `Comanda iniciada para ${mesaObj?.nome}!`
          : `Comanda de ${payload.tipoAtendimento === "RETIRADA" ? "Retirada" : payload.tipoAtendimento} iniciada!`
      );
      setIsNovaVendaModalOpen(false);
      fetchVendasAbertas();

      if (vendaCriada && vendaCriada.id) {
        navigate({ to: "/vendas/$vendaId/lancar", params: { vendaId: vendaCriada.id.toString() } });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao abrir comanda.");
    } finally {
      setSubmittingNovaVenda(false);
    }
  };

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

  const handleRemoverItemDaComanda = async (item: ItemPedido, motivoTexto?: string) => {
    if (!verItensComandaModal || !verItensComandaModal.id) return;
    try {
      setCancelingItemId(item.id);
      await apiItemPedido.cancelar(item.id, motivoTexto);
      toast.success(`Item "${item.produto?.nome || 'Produto'}" removido da comanda!`);
      const [itensAtualizados, vendaAtualizada] = await Promise.all([
        apiPedidos.buscarItensPorVenda(verItensComandaModal.id),
        apiVendas.buscarPorId(verItensComandaModal.id),
      ]);
      setItensLancadosDaComanda(itensAtualizados);
      setVerItensComandaModal(vendaAtualizada);
      fetchVendasAbertas();

      const valorItem = round2(item.total || item.quantidade * (item.produto?.preco || 0));
      if (valorItem > 0 && vendaAtualizada && (vendaAtualizada.valorPago || 0) > 0) {
        setPerguntaEstornoItemData({
          item,
          venda: vendaAtualizada,
          valorItem,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover item da comanda.");
    } finally {
      setCancelingItemId(null);
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
          nome: `Estorno Item Comanda #${estornoModalVenda.id} - ${payload.formaEstorno}`,
          descricao: `Estorno/Devolução ao cliente: ${payload.motivo}`,
          transacao: "Saída",
          fluxo: payload.valorEstorno,
        });
      } catch (e) {
        console.error("Erro ao registrar estorno no fluxo financeiro:", e);
      }

      toast.success(`Estorno de ${brl(payload.valorEstorno)} registrado com sucesso!`);
      const targetId = estornoModalVenda.id;
      setEstornoModalVenda(null);
      setPerguntaEstornoItemData(null);
      await fetchVendasAbertas();

      if (verItensComandaModal && verItensComandaModal.id === targetId) {
        const [updatedVenda, updatedItens] = await Promise.all([
          apiVendas.buscarPorId(targetId),
          apiPedidos.buscarItensPorVenda(targetId),
        ]);
        setVerItensComandaModal(updatedVenda);
        setItensLancadosDaComanda(updatedItens);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar estorno.");
    } finally {
      setSavingEstorno(false);
    }
  };

  const handleSaveEditarComanda = async (payload: {
    tipoAtendimento: string;
    mesaId?: string;
    clienteId?: string;
    nomeCliente?: string;
    enderecoId?: string;
    taxaEntrega?: number;
  }) => {
    if (!editingComandaDados?.id) return;
    try {
      setSavingComandaDados(true);

      const oldMesaId = editingComandaDados.mesa?.id;
      const newMesaId =
        payload.tipoAtendimento === "LOCAL" && payload.mesaId
          ? parseInt(payload.mesaId, 10)
          : null;

      // Se mudou de mesa física, libera a mesa anterior
      if (oldMesaId && oldMesaId !== newMesaId) {
        const oldMesa = mesasList.find((m) => m.id === oldMesaId);
        if (oldMesa && oldMesa.id) {
          try {
            await apiMesas.atualizar(oldMesa.id, { ...oldMesa, status: true });
          } catch (e) {
            console.error("Erro ao liberar mesa anterior:", e);
          }
        }
      }

      // Ocupa a nova mesa selecionada
      if (newMesaId && newMesaId !== oldMesaId) {
        const newMesa = mesasList.find((m) => m.id === newMesaId);
        if (newMesa && newMesa.id) {
          try {
            await apiMesas.atualizar(newMesa.id, { ...newMesa, status: false });
          } catch (e) {
            console.error("Erro ao ocupar nova mesa:", e);
          }
        }
      }

      const oldTaxa = editingComandaDados.taxaEntrega || 0;
      const novaTaxa = payload.tipoAtendimento === "DELIVERY" ? payload.taxaEntrega || 0 : 0;
      const diferencaTaxa = round2(novaTaxa - oldTaxa);
      const novoTotal = round2(Math.max(0, (editingComandaDados.total || 0) + diferencaTaxa));

      const updatePayload: any = {
        ...editingComandaDados,
        tipoAtendimento: payload.tipoAtendimento,
        mesa: newMesaId ? { id: newMesaId } : null,
        cliente: payload.clienteId ? { id: parseInt(payload.clienteId, 10) } : null,
        nomeCliente:
          !payload.clienteId && payload.nomeCliente && payload.nomeCliente.trim() !== ""
            ? payload.nomeCliente.trim()
            : null,
        endereco:
          payload.tipoAtendimento === "DELIVERY" && payload.enderecoId
            ? { id: parseInt(payload.enderecoId, 10) }
            : null,
        taxaEntrega: novaTaxa,
        total: novoTotal,
      };

      const updated = await apiVendas.atualizar(editingComandaDados.id, updatePayload);
      toast.success(`Dados da Comanda #${editingComandaDados.id} atualizados com sucesso!`);
      setEditingComandaDados(null);
      if (verItensComandaModal?.id === editingComandaDados.id) {
        setVerItensComandaModal(updated);
      }
      fetchVendasAbertas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar dados da comanda.");
    } finally {
      setSavingComandaDados(false);
    }
  };

  const handleConfirmarExcluirComanda = async (motivo: string) => {
    if (!comandaParaExcluir || !comandaParaExcluir.id) return;
    try {
      setDeletingVenda(true);
      await apiVendas.deletar(comandaParaExcluir.id, motivo);
      toast.success(`Comanda #${comandaParaExcluir.id} excluída com sucesso!`);
      setComandaParaExcluir(null);
      setVerItensComandaModal(null);
      fetchVendasAbertas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir comanda.");
    } finally {
      setDeletingVenda(false);
    }
  };

  const handleConfirmarFechamentoComanda = async (payload: {
    tipoFechamento: "TOTAL" | "PARCIAL" | "A_PRAZO";
    formaPagamento: string;
    desconto: number;
    valorPagoAgora: number;
    dataVencimento?: string;
    clienteId?: number;
    novoCliente?: { nome: string; telefone: string };
  }) => {
    if (!vendaParaFechar || !vendaParaFechar.id) return;
    try {
      setClosingVenda(true);
      const novoValorPagoTotalDinheiro = round2(
        (vendaParaFechar.valorPago || 0) + payload.valorPagoAgora
      );

      let clienteAssociado: Cliente | undefined = undefined;
      if (payload.clienteId) {
        clienteAssociado = clientesList.find((c) => c.id === payload.clienteId) || (vendaParaFechar.cliente?.id === payload.clienteId ? vendaParaFechar.cliente : undefined);
      } else if (vendaParaFechar.cliente?.id) {
        clienteAssociado = vendaParaFechar.cliente;
      }

      if (!clienteAssociado && payload.novoCliente) {
        try {
          const salvo = await apiClientes.salvar({
            nome: payload.novoCliente.nome,
            telefone: payload.novoCliente.telefone,
            status: true,
          });
          clienteAssociado = salvo;
        } catch (err) {
          console.error("Erro ao cadastrar cliente rápido:", err);
        }
      }

      const saldoPendenteNoAto = round2(
        vendaParaFechar.total !== undefined && vendaParaFechar.total > 0
          ? vendaParaFechar.total
          : Math.max(0, (vendaParaFechar.totalBruto || 0) - (vendaParaFechar.valorPago || 0) - (vendaParaFechar.desconto || 0))
      );
      const valorTotalDaComandaNoAto = round2(
        saldoPendenteNoAto > 0
          ? saldoPendenteNoAto
          : (vendaParaFechar.totalBruto || (payload.valorPagoAgora + (payload.desconto || 0)))
      );

      const podeFechar = payload.podeFecharComanda !== false;

      if (payload.tipoFechamento === "A_PRAZO") {
        await apiVendas.atualizar(vendaParaFechar.id, {
          ...vendaParaFechar,
          cliente: clienteAssociado,
          formaPagamento: "A_PRAZO",
          dataVencimento: payload.dataVencimento || null,
          valorPago: novoValorPagoTotalDinheiro,
          desconto: round2((vendaParaFechar.desconto || 0) + (payload.desconto || 0)),
        });
        if (podeFechar) {
          await apiVendas.fecharVenda(vendaParaFechar.id);
        }

        if (payload.valorPagoAgora > 0) {
          try {
            await apiPagamentosComanda.salvar({
              venda: { id: vendaParaFechar.id } as Venda,
              valorPago: payload.valorPagoAgora,
              formaPagamento: payload.formaPagamento,
              tipo: "ENTRADA_A_PRAZO",
              totalAntes: valorTotalDaComandaNoAto,
              saldoRestante: round2(Math.max(0, valorTotalDaComandaNoAto - payload.valorPagoAgora - (payload.desconto || 0))),
              desconto: payload.desconto,
            });
          } catch (e) {
            console.error("Erro ao registrar pagamento comanda:", e);
          }

          try {
            await apiFluxoFinanceiro.salvar({
              nome: `Entrada A Prazo Comanda #${vendaParaFechar.id} - ${clienteAssociado?.nome || "Cliente"} (${payload.formaPagamento})`,
              descricao: `Entrada de comanda a prazo (${vendaParaFechar.mesa?.nome || vendaParaFechar.tipoAtendimento || "Consumo"})`,
              transacao: "Entrada",
              fluxo: payload.valorPagoAgora,
            });
          } catch (e) {
            console.error("Erro fluxo financeiro:", e);
          }
        }

        toast.success(
          podeFechar
            ? `Comanda #${vendaParaFechar.id} encerrada a prazo para ${clienteAssociado?.nome || "o cliente"}!`
            : `Pagamento registrado na Comanda #${vendaParaFechar.id} (a prazo)!`
        );
      } else if (payload.tipoFechamento === "TOTAL") {
        await apiVendas.atualizar(vendaParaFechar.id, {
          ...vendaParaFechar,
          cliente: clienteAssociado,
          formaPagamento: payload.formaPagamento,
          valorPago: novoValorPagoTotalDinheiro,
          desconto: round2((vendaParaFechar.desconto || 0) + (payload.desconto || 0)),
        });
        if (podeFechar) {
          await apiVendas.fecharVenda(vendaParaFechar.id);
        }

        try {
          await apiPagamentosComanda.salvar({
            venda: { id: vendaParaFechar.id } as Venda,
            valorPago: payload.valorPagoAgora,
            formaPagamento: payload.formaPagamento,
            tipo: podeFechar ? "TOTAL" : "PARCIAL",
            totalAntes: valorTotalDaComandaNoAto,
            saldoRestante: podeFechar ? 0 : round2(Math.max(0, valorTotalDaComandaNoAto - payload.valorPagoAgora - (payload.desconto || 0))),
            desconto: payload.desconto,
          });
        } catch (e) {
          console.error("Erro ao registrar pagamento comanda:", e);
        }

        try {
          await apiFluxoFinanceiro.salvar({
            nome: `Recebimento Comanda #${vendaParaFechar.id} - ${payload.formaPagamento}`,
            descricao: `${podeFechar ? "Encerramento" : "Pagamento"} comanda ${vendaParaFechar.mesa?.nome || vendaParaFechar.tipoAtendimento || "Consumo"}`,
            transacao: "Entrada",
            fluxo: payload.valorPagoAgora,
          });
        } catch (e) {
          console.error("Erro fluxo financeiro:", e);
        }

        toast.success(
          podeFechar
            ? `Comanda #${vendaParaFechar.id} encerrada com sucesso!`
            : `Pagamento de ${brl(payload.valorPagoAgora)} registrado na Comanda #${vendaParaFechar.id}!`
        );
      } else {
        await apiVendas.atualizar(vendaParaFechar.id, {
          ...vendaParaFechar,
          cliente: clienteAssociado,
          formaPagamento: payload.formaPagamento,
          valorPago: novoValorPagoTotalDinheiro,
          desconto: round2((vendaParaFechar.desconto || 0) + (payload.desconto || 0)),
        });

        try {
          await apiPagamentosComanda.salvar({
            venda: { id: vendaParaFechar.id } as Venda,
            valorPago: payload.valorPagoAgora,
            formaPagamento: payload.formaPagamento,
            tipo: "PARCIAL",
            totalAntes: valorTotalDaComandaNoAto,
            saldoRestante: round2(Math.max(0, valorTotalDaComandaNoAto - payload.valorPagoAgora - (payload.desconto || 0))),
            desconto: payload.desconto,
          });
        } catch (e) {
          console.error("Erro pagamento parcial:", e);
        }

        try {
          await apiFluxoFinanceiro.salvar({
            nome: `Pagamento Parcial Comanda #${vendaParaFechar.id} - ${payload.formaPagamento}`,
            descricao: `Pagamento parcial comanda ${vendaParaFechar.mesa?.nome || vendaParaFechar.tipoAtendimento || "Consumo"}`,
            transacao: "Entrada",
            fluxo: payload.valorPagoAgora,
          });
        } catch (e) {
          console.error("Erro fluxo financeiro:", e);
        }

        toast.success(`Pagamento parcial de ${brl(payload.valorPagoAgora)} registrado na Comanda #${vendaParaFechar.id}!`);
      }

      setVendaParaFechar(null);
      setVerItensComandaModal(null);
      fetchVendasAbertas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar pagamento.");
    } finally {
      setClosingVenda(false);
    }
  };

  const handleOpenFecharOuEncerrarComanda = (v: Venda) => {
    const itensDaVenda = allItensAbertos.filter(
      (i) =>
        i.vendaId === v.id ||
        (i as any).vendaId === v.id ||
        i.pedido?.venda?.id === v.id
    );
    const subtotalItens = round2(
      itensDaVenda
        .filter((i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO")
        .reduce((acc, i) => acc + (i.total || 0), 0)
    );
    const taxa = round2(v.taxaEntrega || 0);
    const totalConsumido = round2(
      Math.max(subtotalItens + taxa, v.totalBruto || v.total || 0)
    );
    const valorPago = round2(v.valorPago || 0);
    const desconto = round2(v.desconto || 0);
    const saldoPendente = round2(
      Math.max(0, totalConsumido - valorPago - desconto)
    );

    if (saldoPendente <= 0.001) {
      setVendaParaEncerrar(v);
    } else {
      setVendaParaFechar(v);
    }
  };

  const handleConfirmarEncerramentoDireto = async (vendaId: number) => {
    try {
      setEncerrandoVenda(true);
      await apiVendas.fecharVenda(vendaId);
      toast.success(
        `Comanda #${vendaParaEncerrar?.numeroComanda || vendaId} encerrada com sucesso!`
      );
      setVendaParaEncerrar(null);
      setVerItensComandaModal(null);
      fetchVendasAbertas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao encerrar comanda.");
    } finally {
      setEncerrandoVenda(false);
    }
  };

  const handleConfirmExcluirComanda = async () => {
    if (!comandaParaExcluir) return;

    try {
      setExcluindoComanda(true);
      await apiVendas.deletar(comandaParaExcluir.id!);
      toast.success(
        `Comanda #${comandaParaExcluir.numeroComanda || comandaParaExcluir.id} excluída com sucesso!`
      );
      setComandaParaExcluir(null);
      await fetchVendasAbertas();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Não foi possível excluir a comanda. Verifique se há pedidos ou pagamentos vinculados."
      );
    } finally {
      setExcluindoComanda(false);
    }
  };

  return (
    <AppShell
      title="Comandas & Mesas"
      description="Gerencie comandas abertas, pedidos de consumo local, retirada e delivery."
      actions={
        <div className="flex items-center gap-2">
          <Tabs
            value={modoExibicao}
            onValueChange={(v) => setModoExibicao(v as "COMANDAS" | "MESAS")}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="COMANDAS" className="text-xs flex items-center gap-1.5">
                <Receipt className="size-3.5" />
                <span className="hidden sm:inline">Comandas</span>
              </TabsTrigger>
              <TabsTrigger value="MESAS" className="text-xs flex items-center gap-1.5">
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Mapa de Mesas</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchVendasAbertas}
            title="Recarregar"
            className="size-9 cursor-pointer"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() =>
              handleOpenNovaVenda(
                undefined,
                modoExibicao === "COMANDAS" && comandasActiveTab !== "TODOS"
                  ? comandasActiveTab
                  : "LOCAL"
              )
            }
            className="bg-brand text-primary-foreground hover:opacity-90 text-xs font-semibold h-9 px-4 cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" /> Nova Comanda
          </Button>
        </div>
      }
    >
      {loading ? (
        <LoadingState message="Carregando comandas e mapa de mesas..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchVendasAbertas} />
      ) : modoExibicao === "MESAS" ? (
        <MapaMesasView
          mesasList={mesasList}
          vendasAbertas={vendasAbertas}
          allItensAbertos={allItensAbertos}
          onOpenNovaComanda={(mId, tipo) => handleOpenNovaVenda(mId, tipo)}
          onVerItensComanda={handleOpenVerItensComanda}
          onLancarItens={(v) =>
            navigate({ to: "/vendas/$vendaId/lancar", params: { vendaId: v.id!.toString() } })
          }
          onFecharComanda={handleOpenFecharOuEncerrarComanda}
          onGerenciarMesas={() => setIsGerenciarMesasOpen(true)}
        />
      ) : (
        <ComandasListView
          vendasAbertas={vendasAbertas}
          allItensAbertos={allItensAbertos}
          activeTab={comandasActiveTab}
          onTabChange={setComandasActiveTab}
          onOpenNovaComanda={(tipo) => handleOpenNovaVenda(undefined, tipo)}
          onVerItensComanda={handleOpenVerItensComanda}
          onLancarItens={(v) =>
            navigate({ to: "/vendas/$vendaId/lancar", params: { vendaId: v.id!.toString() } })
          }
          onFecharComanda={handleOpenFecharOuEncerrarComanda}
          onExcluirComanda={setComandaParaExcluir}
        />
      )}

      <NovaComandaModal
        open={isNovaVendaModalOpen}
        onOpenChange={setIsNovaVendaModalOpen}
        initialMesaId={presetNovaComandaMesaId}
        initialTipoAtendimento={presetNovaComandaTipoAtendimento}
        mesasList={mesasList}
        clientesList={clientesList}
        onSubmit={handleCreateNovaVendaSubmit}
        submitting={submittingNovaVenda}
      />

      <GerenciarMesasModal
        open={isGerenciarMesasOpen}
        onOpenChange={setIsGerenciarMesasOpen}
        mesasList={mesasList}
        loadingMesas={loadingMesas}
        onCreateIndividual={handleCreateMesaIndividual}
        onGenerateLote={handleGenerateMesasLote}
        generatingLote={generatingLote}
        onDeleteMesa={handleDeleteMesaFisica}
        onSaveEditMesa={handleSaveEditMesa}
        savingEditMesa={savingEditMesa}
      />

      <VerItensComandaModal
        venda={verItensComandaModal}
        itensList={itensLancadosDaComanda}
        loading={loadingItensComanda}
        open={verItensComandaModal !== null}
        onOpenChange={(o) => !o && setVerItensComandaModal(null)}
        onLancarMaisItens={(v) =>
          navigate({ to: "/vendas/$vendaId/lancar", params: { vendaId: v.id!.toString() } })
        }
        onEditarDados={(v) => {
          setVerItensComandaModal(null);
          setEditingComandaDados(v);
        }}
        onExcluirComanda={(v) => {
          setVerItensComandaModal(null);
          setComandaParaExcluir(v);
        }}
        onFecharComanda={(v) => {
          setVerItensComandaModal(null);
          handleOpenFecharOuEncerrarComanda(v);
        }}
        onRemoverItem={(item) => handleRemoverItemDaComanda(item)}
        cancelingItemId={cancelingItemId}
      />

      <EditarComandaModal
        venda={editingComandaDados}
        open={editingComandaDados !== null}
        onOpenChange={(o) => !o && setEditingComandaDados(null)}
        mesasList={mesasList}
        clientesList={clientesList}
        onSave={handleSaveEditarComanda}
        saving={savingComandaDados}
      />

      <ExcluirComandaModal
        venda={comandaParaExcluir}
        open={comandaParaExcluir !== null}
        onOpenChange={(o) => !o && setComandaParaExcluir(null)}
        onConfirm={handleConfirmarExcluirComanda}
        loading={deletingVenda}
      />

      <FecharComandaModal
        venda={vendaParaFechar}
        itensAbertos={allItensAbertos}
        open={vendaParaFechar !== null}
        onOpenChange={(o) => !o && setVendaParaFechar(null)}
        clientesList={clientesList}
        onConfirm={handleConfirmarFechamentoComanda}
        loading={closingVenda}
      />

      <EncerrarComandaModal
        venda={vendaParaEncerrar}
        itensAbertos={allItensAbertos}
        open={vendaParaEncerrar !== null}
        onOpenChange={(o) => !o && setVendaParaEncerrar(null)}
        onConfirm={handleConfirmarEncerramentoDireto}
        loading={encerrandoVenda}
      />

      <PerguntaEstornoPedidoModal
        open={perguntaEstornoItemData !== null}
        onOpenChange={(open) => !open && setPerguntaEstornoItemData(null)}
        pedido={{
          id: perguntaEstornoItemData?.item.id || 0,
          tipoPedido: "Item Comanda",
          statusPedido: "Cancelado",
          itens: perguntaEstornoItemData ? [perguntaEstornoItemData.item] : [],
        }}
        venda={perguntaEstornoItemData?.venda || null}
        valorPedido={perguntaEstornoItemData?.valorItem || 0}
        motivoCancelamento={perguntaEstornoItemData?.item.motivoCancelamento || "Cancelamento de item da comanda"}
        onDecisaoEstornar={() => {
          if (perguntaEstornoItemData) {
            setEstornoModalVenda(perguntaEstornoItemData.venda);
            setEstornoValorSugerido(perguntaEstornoItemData.valorItem);
            setEstornoMotivoSugerido(
              `Cancelamento item: ${perguntaEstornoItemData.item.produto?.nome || "Item"} (Comanda #${perguntaEstornoItemData.venda.id})`
            );
          }
        }}
        onNaoEstornar={() => setPerguntaEstornoItemData(null)}
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
    </AppShell>
  );
}
