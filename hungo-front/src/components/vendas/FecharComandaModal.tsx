import { useState, useEffect } from "react";
import {
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  PieChart,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
  CalendarClock,
  Calendar,
  Pencil,
  Phone,
  Search,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { toast } from "sonner";
import { Venda, ItemPedido, Cliente } from "@/lib/api";
import { brl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const calcDatePlusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
};

interface FecharComandaModalProps {
  venda: Venda | null;
  itensAbertos: ItemPedido[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientesList?: Cliente[];
  onConfirm: (fechamento: {
    tipo: "TOTAL" | "PARCIAL" | "A_PRAZO";
    formaPagamento: string;
    desconto: number;
    valorPagoAgora: number;
    dataVencimento?: string;
    clienteId?: number;
    novoCliente?: { nome: string; telefone: string };
    podeFecharComanda?: boolean;
  }) => Promise<void>;
  loading: boolean;
}

const paymentMethods = [
  {
    label: "Pix",
    icon: QrCode,
    color: "text-primary",
  },
  {
    label: "Dinheiro",
    icon: Banknote,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Cartão",
    icon: CreditCard,
    color: "text-amber-600 dark:text-amber-400",
  },
];

export function FecharComandaModal({
  venda,
  itensAbertos,
  open,
  onOpenChange,
  clientesList = [],
  onConfirm,
  loading,
}: FecharComandaModalProps) {
  const [tipoFechamento, setTipoFechamento] = useState<"TOTAL" | "PARCIAL" | "A_PRAZO">("TOTAL");
  const [formaPagamento, setFormaPagamento] = useState<string>("Pix");
  const [aplicarDesconto, setAplicarDesconto] = useState<boolean>(false);
  const [descontoValorInput, setDescontoValorInput] = useState<string>("");
  const [valorPagoInput, setValorPagoInput] = useState<string>("");

  // A Prazo states
  const [dataVencimento, setDataVencimento] = useState<string>(calcDatePlusDays(30));
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [typedClienteNome, setTypedClienteNome] = useState<string>("");
  const [typedClienteTelefone, setTypedClienteTelefone] = useState<string>("");

  // Sub-modal para buscar ou editar dados do cliente
  const [isEditClienteModalOpen, setIsEditClienteModalOpen] = useState<boolean>(false);
  const [tempSelectedClienteId, setTempSelectedClienteId] = useState<number | null>(null);
  const [tempClienteNome, setTempClienteNome] = useState<string>("");
  const [tempClienteTelefone, setTempClienteTelefone] = useState<string>("");

  // Sub-modal para selecionar outra data de vencimento
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [tempDataVencimento, setTempDataVencimento] = useState<string>(calcDatePlusDays(30));

  useEffect(() => {
    if (venda && open) {
      setTipoFechamento("TOTAL");
      setFormaPagamento("Pix");
      setAplicarDesconto(false);
      setDescontoValorInput("");
      setValorPagoInput("");

      setDataVencimento(calcDatePlusDays(30));

      if (venda.cliente?.id) {
        setSelectedClienteId(venda.cliente.id);
        setTypedClienteNome(venda.cliente.nome || "");
        setTypedClienteTelefone(venda.cliente.telefone || "");
      } else {
        setSelectedClienteId(null);
        setTypedClienteNome(venda.nomeCliente || "");
        setTypedClienteTelefone("");
      }
      setIsEditClienteModalOpen(false);
    }
  }, [open, venda, itensAbertos]);

  if (!venda) return null;

  const itensValidos = itensAbertos.filter(
    (i) =>
      i.vendaId === venda.id ||
      (i as any).vendaId === venda.id ||
      i.pedido?.venda?.id === venda.id
  );

  const subtotalItens = round2(
    itensValidos
      .filter((i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO")
      .reduce((acc, i) => acc + (i.total || 0), 0)
  );

  const taxaEntrega = round2(venda.taxaEntrega || 0);
  const valorJaPago = round2(venda.valorPago || 0);
  const descontoAcumulado = round2(venda.desconto || 0);
  const subtotalGeral = subtotalItens > 0
    ? subtotalItens
    : Math.max(0, round2((venda.totalBruto || venda.total || 0) - taxaEntrega));

  const totalConsumidoCalculado = round2(
    Math.max(subtotalGeral + taxaEntrega, (venda.totalBruto || venda.total || 0))
  );

  const saldoPendente = round2(
    Math.max(0, totalConsumidoCalculado - valorJaPago - descontoAcumulado)
  );

  const descontoNum = aplicarDesconto
    ? round2(
        Math.min(
          saldoPendente,
          Math.max(0, parseFloat(descontoValorInput) || 0)
        )
      )
    : 0;

  const maximoPagamentoPermitido = round2(
    saldoPendente - descontoNum
  );

  const valorPagoAgora = tipoFechamento === "TOTAL"
    ? maximoPagamentoPermitido
    : round2(
        Math.min(
          maximoPagamentoPermitido,
          Math.max(0, parseFloat(valorPagoInput) || 0)
        )
      );

  // Saldo restante
  const saldoRestanteAposPagamento = round2(
    Math.max(0, saldoPendente - descontoNum - valorPagoAgora)
  );

  const itensAtivos = itensValidos.filter(
    (i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO"
  );

  const itensNaoConcluidos = itensAtivos.filter((i) => {
    const status = (i.pedido?.statusPedido || "").trim().toLowerCase();
    return !(
      status === "concluído" ||
      status === "concluido" ||
      status === "entregue" ||
      status === "cancelado"
    );
  });

  const temPedidosNaoConcluidos = itensNaoConcluidos.length > 0;

  const podeFecharComanda =
    !temPedidosNaoConcluidos &&
    ((tipoFechamento === "TOTAL" && saldoRestanteAposPagamento === 0) ||
     (tipoFechamento === "A_PRAZO" && saldoRestanteAposPagamento >= 0));

  const selectedClienteObj = selectedClienteId
    ? clientesList.find((c) => c.id === selectedClienteId)
    : null;

  const displayNome =
    selectedClienteObj?.nome ||
    venda.cliente?.nome ||
    typedClienteNome ||
    venda.nomeCliente ||
    "Cliente não identificado";

  const displayTelefone =
    selectedClienteObj?.telefone ||
    venda.cliente?.telefone ||
    typedClienteTelefone ||
    "Telefone não informado";

  const handleOpenEditClienteModal = () => {
    const currentId = selectedClienteId || venda.cliente?.id || null;
    setTempSelectedClienteId(currentId);
    if (currentId) {
      const cli = clientesList.find((c) => c.id === currentId);
      setTempClienteNome(cli?.nome || venda.cliente?.nome || "");
      setTempClienteTelefone(cli?.telefone || venda.cliente?.telefone || "");
    } else {
      setTempClienteNome(
        typedClienteNome ||
          (venda.nomeCliente && venda.nomeCliente !== "Consumo Local" ? venda.nomeCliente : "")
      );
      setTempClienteTelefone(typedClienteTelefone || venda.cliente?.telefone || "");
    }
    setIsEditClienteModalOpen(true);
  };

  const handleSaveEditClienteModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSelectedClienteId) {
      const cli = clientesList.find((c) => c.id === tempSelectedClienteId);
      setSelectedClienteId(tempSelectedClienteId);
      setTypedClienteNome(cli?.nome || tempClienteNome.trim());
      setTypedClienteTelefone(cli?.telefone || tempClienteTelefone.trim());
    } else {
      setSelectedClienteId(null);
      setTypedClienteNome(tempClienteNome.trim());
      setTypedClienteTelefone(tempClienteTelefone.trim());
    }
    setIsEditClienteModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saldoPendente <= 0) {
      toast.error("Esta comanda não possui saldo pendente para pagamento.");
      return;
    }

    if (tipoFechamento === "PARCIAL" && valorPagoAgora <= 0) {
      toast.warning("Informe o valor a ser pago nesta etapa parcial.");
      return;
    }

    let payloadClienteId = selectedClienteId || venda.cliente?.id;
    let payloadNovoCliente: { nome: string; telefone: string } | undefined = undefined;

    if (tipoFechamento === "A_PRAZO") {
      if (!payloadClienteId) {
        if (!typedClienteTelefone.trim()) {
          toast.warning("O telefone do cliente é obrigatório para pagamento a prazo.");
          handleOpenEditClienteModal();
          return;
        }
        payloadNovoCliente = {
          nome: typedClienteNome.trim() || venda.nomeCliente || "Cliente",
          telefone: typedClienteTelefone.trim(),
        };
      }

      if (!dataVencimento) {
        toast.warning("Informe a data de vencimento.");
        return;
      }
    }

    try {
      await onConfirm({
        tipo: tipoFechamento,
        formaPagamento: valorPagoAgora > 0 ? formaPagamento : "A_PRAZO",
        desconto: descontoNum,
        valorPagoAgora: valorPagoAgora,
        dataVencimento: tipoFechamento === "A_PRAZO" ? dataVencimento : undefined,
        clienteId: payloadClienteId,
        novoCliente: payloadNovoCliente,
        podeFecharComanda: podeFecharComanda,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const numComanda = venda.numeroComanda || venda.id;
  const tituloModal = (() => {
    if (tipoFechamento === "TOTAL") return `Quitação Total — Comanda #${numComanda}`;
    if (tipoFechamento === "PARCIAL") return `Pagamento Parcial — Comanda #${numComanda}`;
    if (tipoFechamento === "A_PRAZO") return `Fechamento a Prazo — Comanda #${numComanda}`;
    return `Encerramento — Comanda #${numComanda}`;
  })();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="size-5 text-primary" />
              {tituloModal}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <ChannelBadge tipo={venda.tipoAtendimento} mesaNome={venda.mesa?.nome} />
              <Badge variant="outline" className="text-xs border-border bg-muted/40 font-medium">
                <User
                  className={`size-3 mr-1 ${
                    Boolean(venda.cliente)
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-primary"
                  }`}
                />
                {venda.cliente?.nome || venda.nomeCliente || "Consumo Local"}
              </Badge>
              {temPedidosNaoConcluidos && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-normal flex items-center gap-1"
                >
                  <AlertTriangle className="size-3 shrink-0" />
                  <span>Existem pedidos em aberto ou em preparo</span>
                </Badge>
              )}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
            {/* Card Resumo Financeiro */}
            <div className="p-3 bg-muted/40 rounded-xl border space-y-1.5 font-mono">
              <div className="flex justify-between text-muted-foreground font-sans">
                <span>Total Consumido:</span>
                <span className="font-mono font-normal text-foreground">
                  {brl(totalConsumidoCalculado)}
                </span>
              </div>
              {descontoAcumulado > 0 && (
                <div className="flex justify-between text-muted-foreground font-sans">
                  <span>Descontos:</span>
                  <span className="font-mono font-normal">- {brl(descontoAcumulado)}</span>
                </div>
              )}
              {valorJaPago > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-sans">
                  <span>Total Pago:</span>
                  <span className="font-mono font-normal">- {brl(valorJaPago)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t font-sans font-bold text-sm text-foreground">
                <span>Saldo Pendente:</span>
                <span className="font-mono font-bold text-foreground">
                  {brl(saldoPendente)}
                </span>
              </div>
            </div>

            {/* 1. Modalidade de Pagamento */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Modalidade de Fechamento</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipoFechamento("TOTAL");
                    setValorPagoInput("");
                  }}
                  className={`h-9 px-3 border rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer ${
                    tipoFechamento === "TOTAL"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs"
                      : "hover:bg-muted/50 text-muted-foreground border-border"
                  }`}
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Total</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTipoFechamento("PARCIAL");
                    setValorPagoInput("");
                  }}
                  className={`h-9 px-3 border rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer ${
                    tipoFechamento === "PARCIAL"
                      ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-2xs"
                      : "hover:bg-muted/50 text-muted-foreground border-border"
                  }`}
                >
                  <Clock className="size-4 shrink-0" />
                  <span>Parcial</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTipoFechamento("A_PRAZO");
                    setValorPagoInput("");
                  }}
                  className={`h-9 px-3 border rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer ${
                    tipoFechamento === "A_PRAZO"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                      : "hover:bg-muted/50 text-muted-foreground border-border"
                  }`}
                >
                  <CalendarClock className="size-4 shrink-0" />
                  <span>A Prazo</span>
                </button>
              </div>
            </div>

            {/* Seção Exclusiva: Condições da Conta a Prazo */}
            {tipoFechamento === "A_PRAZO" && (
              <div className="p-3 border rounded-2xl bg-muted/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Card com o nome do cliente */}
                  <div className="flex items-center justify-between p-2.5 bg-background border rounded-xl min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "size-8 rounded-full flex items-center justify-center shrink-0",
                          selectedClienteId || venda.cliente?.id
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <User className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {displayNome}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          {displayTelefone ? (
                            <>
                              <Phone className="size-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{displayTelefone}</span>
                            </>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">
                              Sem telefone
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleOpenEditClienteModal}
                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0"
                      title="Identificar / Editar cliente"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>

                  {/* Data de Vencimento com texto e botão de calendário */}
                  <div className="flex items-center justify-between p-2.5 bg-background border rounded-xl">
                    <div className="min-w-0">
                      <span className="text-[11px] text-muted-foreground block">
                        Vencimento da Conta
                      </span>
                      <span className="text-xs text-foreground font-mono font-bold">
                        {dataVencimento.split("-").reverse().join("/")}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setTempDataVencimento(dataVencimento);
                        setIsDateModalOpen(true);
                      }}
                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0"
                      title="Alterar data de vencimento"
                    >
                      <Calendar className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Campo de Pagamento / Entrada & Desconto */}
            <div className="p-3 bg-muted/20 border rounded-xl">
              <div className="grid grid-cols-2 gap-3">
                {tipoFechamento === "TOTAL" ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Valor a Pagar
                    </Label>
                    <div className="h-8 px-3 rounded-md border bg-muted/40 flex items-center font-mono font-bold text-xs text-foreground">
                      {brl(Math.max(0, saldoPendente - descontoNum))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="valPagoAgora" className="text-xs font-semibold text-foreground">
                      {tipoFechamento === "A_PRAZO" ? "Entrada" : "Valor a Pagar Agora"}
                    </Label>
                    <CurrencyInput
                      id="valPagoAgora"
                      value={valorPagoInput}
                      onChange={(val) => setValorPagoInput(val)}
                      placeholder="0,00"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 h-4">
                    <Checkbox
                      id="checkDesc"
                      checked={aplicarDesconto}
                      onCheckedChange={(c) => {
                        const checked = Boolean(c);
                        setAplicarDesconto(checked);
                        if (!checked) setDescontoValorInput("");
                      }}
                    />
                    <Label
                      htmlFor="checkDesc"
                      className="text-xs font-semibold cursor-pointer text-foreground select-none"
                    >
                      Desconto
                    </Label>
                  </div>
                  <CurrencyInput
                    id="descVal"
                    value={descontoValorInput}
                    disabled={!aplicarDesconto}
                    onChange={(val) => setDescontoValorInput(val)}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* 3. Forma de Pagamento (Forma real do dinheiro) */}
            {(tipoFechamento !== "A_PRAZO" || valorPagoAgora > 0) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {tipoFechamento === "A_PRAZO"
                    ? "Forma de Pagamento da Entrada"
                    : "Forma de Pagamento"}
                </Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => {
                      const Icon = pm.icon;
                      return (
                        <SelectItem key={pm.label} value={pm.label}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("size-4 shrink-0", pm.color)} />
                            <span>{pm.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Resumo Final do Pagamento */}
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1 text-xs font-mono">
              {tipoFechamento === "A_PRAZO" ? (
                <>
                  <div className="flex justify-between text-muted-foreground font-sans">
                    <span>Valor a Pagar Agora (Entrada):</span>
                    <span className="font-mono font-normal text-foreground">
                      {brl(valorPagoAgora)}
                    </span>
                  </div>
                  {descontoNum > 0 && (
                    <div className="flex justify-between text-muted-foreground font-sans">
                      <span>Desconto:</span>
                      <span className="font-mono font-normal text-muted-foreground">{brl(descontoNum)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t font-sans font-bold text-sm text-foreground">
                    <span>Saldo a Receber a Prazo:</span>
                    <span className="font-mono font-bold text-foreground">
                      {brl(saldoRestanteAposPagamento)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-muted-foreground font-sans">
                    <span>Valor a Pagar Agora:</span>
                    <span className="font-mono font-normal text-foreground">
                      {brl(valorPagoAgora)}
                    </span>
                  </div>
                  {descontoNum > 0 && (
                    <div className="flex justify-between text-muted-foreground font-sans">
                      <span>Desconto:</span>
                      <span className="font-mono font-normal text-muted-foreground">{brl(descontoNum)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t font-sans font-bold text-sm text-foreground">
                    <span>Saldo Restante na Comanda:</span>
                    <span className="font-mono font-bold text-foreground">
                      {brl(saldoRestanteAposPagamento)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="pt-2 flex flex-row items-center justify-between sm:justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="h-9 px-4 text-xs cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loading || (tipoFechamento === "PARCIAL" && valorPagoAgora <= 0)
                }
                className={`font-bold text-xs h-9 px-4 flex items-center gap-1.5 cursor-pointer ${
                  podeFecharComanda
                    ? "bg-brand hover:bg-brand/90 text-primary-foreground"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1.5" /> Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>
                      {podeFecharComanda
                        ? tipoFechamento === "A_PRAZO"
                          ? "Confirmar Encerramento A Prazo"
                          : "Confirmar Encerramento Total"
                        : "Pagar Comanda"}
                    </span>
                    <ChevronRight className="size-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-Modal de Cadastro / Identificação do Cliente */}
      <Dialog open={isEditClienteModalOpen} onOpenChange={setIsEditClienteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <User className="size-4 text-primary" />
              Identificar / Cadastrar Cliente
            </DialogTitle>
            <DialogDescription className="text-xs">
              Selecione um cliente já cadastrado ou informe nome e telefone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditClienteModal} className="space-y-4 py-2 text-xs">
            <div className="space-y-3">
              {clientesList && clientesList.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Selecionar Cliente Cadastrado (Opcional)
                  </Label>
                  <Select
                    value={tempSelectedClienteId ? tempSelectedClienteId.toString() : "custom"}
                    onValueChange={(val) => {
                      if (val === "custom") {
                        setTempSelectedClienteId(null);
                      } else {
                        const cid = parseInt(val, 10);
                        const c = clientesList.find((cli) => cli.id === cid);
                        setTempSelectedClienteId(cid);
                        if (c) {
                          setTempClienteNome(c.nome);
                          setTempClienteTelefone(c.telefone || "");
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Escolha um cliente da base..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">-- Digitar manualmente --</SelectItem>
                      {clientesList.map((cli) => (
                        <SelectItem key={cli.id} value={cli.id!.toString()}>
                          {cli.nome} {cli.telefone ? `(${cli.telefone})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="tmpNome" className="text-xs font-semibold">
                  Nome do Cliente *
                </Label>
                <Input
                  id="tmpNome"
                  placeholder="Nome do cliente"
                  value={tempClienteNome}
                  onChange={(e) => {
                    setTempClienteNome(e.target.value);
                    if (tempSelectedClienteId) {
                      const c = clientesList.find((cli) => cli.id === tempSelectedClienteId);
                      if (c && c.nome !== e.target.value) {
                        setTempSelectedClienteId(null);
                      }
                    }
                  }}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tmpTel" className="text-xs font-semibold flex items-center gap-1">
                  <Phone className="size-3 text-primary" />
                  Telefone (Obrigatório para A Prazo) *
                </Label>
                <Input
                  id="tmpTel"
                  placeholder="(85) 99999-9999"
                  value={tempClienteTelefone}
                  onChange={(e) => {
                    setTempClienteTelefone(e.target.value);
                    if (tempSelectedClienteId) {
                      const c = clientesList.find((cli) => cli.id === tempSelectedClienteId);
                      if (c && c.telefone !== e.target.value) {
                        setTempSelectedClienteId(null);
                      }
                    }
                  }}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-row items-center justify-between sm:justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditClienteModalOpen(false)}
                className="h-9 px-4 text-xs cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 text-xs bg-brand text-primary-foreground font-bold cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirmar</span>
                <ChevronRight className="size-4" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-Modal de Seleção de Data de Vencimento */}
      <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              Alterar Vencimento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs">
            <Label htmlFor="tmpVenc" className="text-xs font-semibold">
              Novo Vencimento
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="tmpVenc"
                type="date"
                value={tempDataVencimento}
                onChange={(e) => setTempDataVencimento(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="w-auto flex-1 h-9 text-xs font-mono cursor-pointer"
                required
              />
              <Button
                type="button"
                onClick={() => {
                  if (tempDataVencimento) setDataVencimento(tempDataVencimento);
                  setIsDateModalOpen(false);
                }}
                className="h-9 px-4 text-xs bg-brand text-primary-foreground font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Confirmar</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
