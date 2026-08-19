import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Loader2, RefreshCw, Trash2, DollarSign, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { apiFluxoFinanceiro, FluxoFinanceiro } from "@/lib/api";
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Hungo" },
      {
        name: "description",
        content: "Gerencie e organize o fluxo financeiro.",
      },
    ],
  }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const [fluxoList, setFluxoList] = useState<FluxoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Novo Lançamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [transacao, setTransacao] = useState("Entrada");
  const [valor, setValor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFluxo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFluxoFinanceiro.listar();
      setFluxoList(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar fluxo financeiro");
      toast.error("Erro ao conectar com a API de fluxo financeiro.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFluxo();
  }, []);

  const handleOpenCreateModal = () => {
    setNome("");
    setDescricao("");
    setTransacao("Entrada");
    setValor("");
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.warning("Por favor, informe o título/nome do lançamento.");
      return;
    }
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.warning("Informe um valor válido maior que zero.");
      return;
    }

    try {
      setSubmitting(true);
      await apiFluxoFinanceiro.salvar({
        nome: nome.trim(),
        descricao: descricao.trim(),
        transacao,
        fluxo: valorNum,
        dataTransacao: new Date().toISOString(),
      });
      toast.success("Lançamento financeiro cadastrado com sucesso!");
      setIsModalOpen(false);
      fetchFluxo();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar lançamento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await apiFluxoFinanceiro.deletar(deleteId);
      toast.success("Lançamento excluído.");
      setDeleteId(null);
      fetchFluxo();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir lançamento.");
    } finally {
      setDeleting(false);
    }
  };

  const totalEntradas = fluxoList
    .filter((f) => f.transacao === "Entrada")
    .reduce((acc, f) => acc + (f.fluxo || 0), 0);

  const totalSaidas = fluxoList
    .filter((f) => f.transacao === "Saída" || f.transacao === "Saida")
    .reduce((acc, f) => acc + (f.fluxo || 0), 0);

  const saldo = totalEntradas - totalSaidas;

  const resumo = [
    {
      label: "Entradas",
      value: brl(totalEntradas),
      tone: "text-emerald-600 dark:text-emerald-400 font-bold font-mono",
      icon: <ArrowUpRight className="size-4 text-emerald-500 shrink-0" />,
      hoverStyle: "hover:border-emerald-500/60 hover:bg-emerald-500/5 dark:hover:border-emerald-500/80",
    },
    {
      label: "Saídas",
      value: brl(totalSaidas),
      tone: "text-destructive font-bold font-mono",
      icon: <ArrowDownLeft className="size-4 text-destructive shrink-0" />,
      hoverStyle: "hover:border-destructive/60 hover:bg-destructive/5 dark:hover:border-destructive/80",
    },
    {
      label: "Saldo Consolidado",
      value: brl(saldo),
      tone: "text-primary font-bold font-mono",
      icon: <DollarSign className="size-4 text-primary shrink-0" />,
      hoverStyle: "hover:border-primary/60 hover:bg-primary/5 dark:hover:border-primary/80",
    },
  ];

  return (
    <AppShell
      title="Financeiro"
      description="Gerencie e organize o fluxo financeiro."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchFluxo} title="Recarregar">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-brand text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4 mr-1" /> Novo lançamento
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {resumo.map((r) => (
          <Card
            key={r.label}
            className={`shadow-card border border-border transition-all duration-300 cursor-default ${r.hoverStyle}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {r.icon}
                <span>{r.label}</span>
              </div>
              <p className={`mt-2 text-2xl font-bold font-mono tracking-tight ${r.tone}`}>{r.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-card">
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando fluxo financeiro...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchFluxo} className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          ) : fluxoList.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <DollarSign className="size-8 text-muted-foreground/60 mb-2" />
              <p>Nenhum lançamento financeiro registrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 font-bold">ID</TableHead>
                    <TableHead className="font-bold">Transação</TableHead>
                    <TableHead className="font-bold">Descrição</TableHead>
                    <TableHead className="font-bold">Data</TableHead>
                    <TableHead className="font-bold">Tipo</TableHead>
                    <TableHead className="text-right font-bold">Valor</TableHead>
                    <TableHead className="text-right font-bold w-16">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fluxoList.map((f) => {
                    const isEntrada = f.transacao === "Entrada";
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{f.id}
                        </TableCell>
                        <TableCell className="text-foreground text-xs">{f.nome}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {f.descricao || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {f.dataTransacao
                            ? new Date(f.dataTransacao).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isEntrada
                                ? "border-emerald-500/25 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 text-xs"
                                : "border-destructive/25 bg-destructive/10 text-destructive text-xs"
                            }
                          >
                            {isEntrada ? (
                              <ArrowUpRight className="size-3.5 mr-1" />
                            ) : (
                              <ArrowDownLeft className="size-3.5 mr-1" />
                            )}
                            {f.transacao}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono text-xs ${
                            isEntrada ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                          }`}
                        >
                          {brl(f.fluxo || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => f.id && setDeleteId(f.id)}
                            className="size-8 text-destructive hover:text-destructive"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="size-4" />
                          </Button>
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

      {/* Modal Criar Lançamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
            <DialogDescription>
              Registre uma entrada de vendas ou saída de caixa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="flxNome">Nome da transação</Label>
              <Input
                id="flxNome"
                placeholder="Ex: Compra de Hortifruti, Venda Balcão, Luz..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flxTipo">Tipo de Transação</Label>
                <Select value={transacao} onValueChange={setTransacao}>
                  <SelectTrigger id="flxTipo">
                    <SelectValue placeholder="Selecione o tipo">
                      <div className="flex items-center gap-2">
                        {transacao === "Entrada" ? (
                          <>
                            <ArrowUpRight className="size-4 text-emerald-500 shrink-0" />
                            <span>Entrada (+)</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="size-4 text-destructive shrink-0" />
                            <span>Saída (-)</span>
                          </>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrada">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="size-4 text-emerald-500 shrink-0" />
                        <span>Entrada (+)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Saída">
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="size-4 text-destructive shrink-0" />
                        <span>Saída (-)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flxValor">Valor (R$)</Label>
                <Input
                  id="flxValor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flxDesc">Descrição / Observação</Label>
              <Input
                id="flxDesc"
                placeholder="Observações adicionais..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full h-10 px-4 text-xs font-bold bg-brand text-primary-foreground hover:opacity-90 shadow-xs flex items-center justify-between gap-1.5"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-1.5 justify-center w-full">
                    <Loader2 className="size-4 animate-spin shrink-0" /> Salvando...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="size-4 shrink-0" />
                      <span>Registrar Lançamento</span>
                    </div>
                    <ChevronRight className="size-4 shrink-0" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Delete */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá o lançamento financeiro da base de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
