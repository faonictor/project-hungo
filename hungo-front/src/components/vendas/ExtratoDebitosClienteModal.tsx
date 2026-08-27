import { useState, useEffect } from "react";
import {
  CalendarClock,
  QrCode,
  CreditCard,
  Banknote,
  Loader2,
  CheckCircle2,
  ChevronRight,
  DollarSign,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Cliente, Venda, apiVendas } from "@/lib/api";
import { brl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const paymentMethods = [
  {
    label: "Pix",
    icon: QrCode,
    activeClass:
      "border-primary bg-primary/10 text-primary font-bold shadow-2xs",
    hoverClass: "hover:border-primary/50 hover:bg-primary/5",
  },
  {
    label: "Dinheiro",
    icon: Banknote,
    activeClass:
      "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs",
    hoverClass: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
  },
  {
    label: "Cartão",
    icon: CreditCard,
    activeClass:
      "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-2xs",
    hoverClass: "hover:border-amber-500/50 hover:bg-amber-500/5",
  },
];

interface ExtratoDebitosClienteModalProps {
  cliente: Cliente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExtratoDebitosClienteModal({
  cliente,
  open,
  onOpenChange,
  onSuccess,
}: ExtratoDebitosClienteModalProps) {
  const [debitos, setDebitos] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);

  // Quitação form
  const [vendaSelecionadaParaQuitar, setVendaSelecionadaParaQuitar] = useState<Venda | null>(null);
  const [valorRecebidoInput, setValorRecebidoInput] = useState<string>("");
  const [formaPagamentoReal, setFormaPagamentoReal] = useState<string>("Pix");
  const [aplicarDesconto, setAplicarDesconto] = useState<boolean>(false);
  const [descontoInput, setDescontoInput] = useState<string>("");
  const [submittingQuitar, setSubmittingQuitar] = useState(false);

  const fetchDebitos = async () => {
    if (!cliente?.id) return;
    try {
      setLoading(true);
      const data = await apiVendas.listarAPrazoPorCliente(cliente.id);
      setDebitos(data);
    } catch (err: any) {
      console.error("Erro ao buscar débitos do cliente:", err);
      toast.error("Erro ao carregar débitos a prazo do cliente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cliente && open) {
      fetchDebitos();
      setVendaSelecionadaParaQuitar(null);
    }
  }, [cliente, open]);

  const handleOpenQuitar = (venda: Venda) => {
    setVendaSelecionadaParaQuitar(venda);
    const saldo = venda.total || 0;
    setValorRecebidoInput(saldo > 0 ? saldo.toString() : "");
    setFormaPagamentoReal("Pix");
    setAplicarDesconto(false);
    setDescontoInput("");
  };

  const handleConfirmarRecebimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendaSelecionadaParaQuitar?.id) return;

    const valorRecebido = parseFloat(valorRecebidoInput) || 0;
    const desconto = aplicarDesconto ? parseFloat(descontoInput) || 0 : 0;
    const saldo = vendaSelecionadaParaQuitar.total || 0;

    if (valorRecebido <= 0) {
      toast.warning("Informe o valor recebido.");
      return;
    }

    if (desconto > saldo) {
      toast.error("O desconto não pode ser maior do que o saldo devedor.");
      return;
    }

    if (valorRecebido + desconto > saldo + 0.01) {
      toast.error("A soma do valor recebido e desconto excede o saldo da comanda.");
      return;
    }

    try {
      setSubmittingQuitar(true);
      await apiVendas.receberPagamentoAPrazo(vendaSelecionadaParaQuitar.id, {
        valorRecebido,
        formaPagamentoReal,
        desconto,
      });

      toast.success(`Recebimento de ${brl(valorRecebido)} registrado com sucesso!`);
      setVendaSelecionadaParaQuitar(null);
      await fetchDebitos();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao registrar recebimento.");
    } finally {
      setSubmittingQuitar(false);
    }
  };

  const totalDevedorGeral = round2(
    debitos.reduce((acc, v) => acc + (v.total || 0), 0)
  );

  const hojeStr = new Date().toLocaleDateString("en-CA");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Conta a Prazo — {cliente?.nome}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Extrato de comandas e compras a prazo pendentes de acerto financeiro.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Resumo do Cliente */}
        <div className="grid grid-cols-2 gap-3 py-1">
          <div className="p-3 bg-muted/40 rounded-xl border">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Comandas Pendentes
            </span>
            <span className="font-bold text-base font-mono text-foreground mt-0.5 block">
              {debitos.length} {debitos.length === 1 ? "comanda" : "comandas"}
            </span>
          </div>

          <div className="p-3 bg-muted/40 border rounded-xl">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Total Devedor Acumulado
            </span>
            <span className="font-bold text-base font-mono text-foreground mt-0.5 block">
              {brl(totalDevedorGeral)}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex h-36 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-2" />
            Carregando débitos do cliente...
          </div>
        ) : debitos.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground border rounded-xl p-4 text-center my-2">
            <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
            <p className="font-semibold text-foreground text-sm">Nenhum débito em aberto!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Este cliente está com todas as comandas a prazo devidamente quitadas.
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow className="text-xs font-semibold">
                    <TableHead className="w-28">Venda / Comanda</TableHead>
                    <TableHead>Data Venda</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Saldo Devedor</TableHead>
                    <TableHead className="text-right w-16">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debitos.map((v) => {
                    const isVencido = v.dataVencimento ? v.dataVencimento < hojeStr : false;
                    const saldo = v.total || 0;
                    const totalConsumido = v.totalBruto || ((v.valorPago || 0) + saldo);

                    return (
                      <TableRow key={v.id} className="text-xs">
                        <TableCell className="font-mono">
                          <span className="font-bold text-foreground block">#{v.id}</span>
                          <span className="text-[10px] text-muted-foreground block">
                            Comanda #{v.numeroComanda || v.id}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.dataInicioVenda
                            ? new Date(v.dataInicioVenda).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {v.dataVencimento
                            ? v.dataVencimento.split("-").reverse().join("/")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {isVencido ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0.5 bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/35 font-semibold whitespace-nowrap"
                            >
                              Vencido
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium whitespace-nowrap"
                            >
                              No Prazo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {brl(totalConsumido)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                          {brl(v.valorPago || 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">
                          {brl(saldo)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenQuitar(v)}
                            className="size-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                            title="Receber Pagamento"
                          >
                            <DollarSign className="size-4 text-emerald-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Formulário de Receber Pagamento */}
            {vendaSelecionadaParaQuitar && (
              <form
                id="formQuitarDebito"
                onSubmit={handleConfirmarRecebimento}
                className="p-3.5 border rounded-xl bg-card space-y-3 text-xs mt-3 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-emerald-600" />
                    <span className="font-bold text-foreground">
                      Receber Pagamento — Venda #{vendaSelecionadaParaQuitar.id} (Comanda #{vendaSelecionadaParaQuitar.numeroComanda || vendaSelecionadaParaQuitar.id})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground">
                    Saldo Pendente: {brl(vendaSelecionadaParaQuitar.total || 0)}
                  </span>
                </div>

                {/* 1. Forma de Pagamento */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Forma de Pagamento</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = formaPagamentoReal === pm.label;
                      return (
                        <button
                          key={pm.label}
                          type="button"
                          onClick={() => setFormaPagamentoReal(pm.label)}
                          className={`p-2.5 border rounded-xl flex items-center gap-2 transition-all text-xs cursor-pointer ${
                            isSelected
                              ? pm.activeClass
                              : `text-muted-foreground border-border ${pm.hoverClass}`
                          }`}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="truncate">{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Checkbox Aplicar Desconto */}
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="chkDescQuit"
                    checked={aplicarDesconto}
                    onCheckedChange={(c) => {
                      setAplicarDesconto(Boolean(c));
                      if (!c) setDescontoInput("");
                    }}
                  />
                  <label
                    htmlFor="chkDescQuit"
                    className="text-xs font-medium cursor-pointer"
                  >
                    Aplicar Desconto
                  </label>
                </div>

                {/* 3. Inputs Valor Recebido e Desconto */}
                <div
                  className={cn(
                    "gap-3",
                    aplicarDesconto ? "grid grid-cols-2" : "space-y-1.5"
                  )}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="valRec" className="text-xs font-semibold">
                      Valor Recebido Agora (R$)
                    </Label>
                    <Input
                      id="valRec"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={valorRecebidoInput}
                      onChange={(e) => setValorRecebidoInput(e.target.value)}
                      className="h-8 text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  {aplicarDesconto && (
                    <div className="space-y-1.5">
                      <Label htmlFor="descValQuit" className="text-xs font-semibold">
                        Desconto (R$)
                      </Label>
                      <Input
                        id="descValQuit"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={descontoInput}
                        onChange={(e) => setDescontoInput(e.target.value)}
                        className="h-8 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {vendaSelecionadaParaQuitar && (
          <DialogFooter className="pt-2 flex flex-row items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVendaSelecionadaParaQuitar(null)}
              disabled={submittingQuitar}
              className="h-9 px-4 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="formQuitarDebito"
              disabled={submittingQuitar || !valorRecebidoInput}
              className="h-9 px-4 text-xs bg-brand text-primary-foreground font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {submittingQuitar ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Confirmar Recebimento</span>
                  <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
