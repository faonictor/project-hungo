import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, AlertTriangle, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { apiInsumos, Insumo } from "@/lib/api";
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/insumos")({
  head: () => ({
    meta: [
      { title: "Insumos — Hungo" },
      {
        name: "description",
        content: "Controle de estoque de insumos, níveis e custo unitário de cada item.",
      },
    ],
  }),
  component: InsumosPage,
});

function InsumosPage() {
  const [insumosList, setInsumosList] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("kg");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInsumos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiInsumos.listar();
      setInsumosList(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar insumos");
      toast.error("Erro ao conectar com a API de insumos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingInsumo(null);
    setNome("");
    setPreco("");
    setQuantidade("");
    setUnidadeMedida("kg");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setNome(insumo.nome);
    setPreco(insumo.preco.toString());
    setQuantidade(insumo.quantidade.toString());
    setUnidadeMedida(insumo.unidadeMedida || "kg");
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.warning("Por favor, preencha o nome do insumo.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      preco: parseFloat(preco) || 0,
      quantidade: parseFloat(quantidade) || 0,
      unidadeMedida: unidadeMedida.trim() || "un",
    };

    try {
      setSubmitting(true);
      if (editingInsumo && editingInsumo.id) {
        await apiInsumos.atualizar(editingInsumo.id, payload);
        toast.success("Insumo atualizado com sucesso!");
      } else {
        await apiInsumos.salvar(payload);
        toast.success("Insumo criado com sucesso!");
      }
      setIsModalOpen(false);
      fetchInsumos();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar insumo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await apiInsumos.deletar(deleteId);
      toast.success("Insumo excluído com sucesso!");
      setDeleteId(null);
      fetchInsumos();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir insumo");
    } finally {
      setDeleting(false);
    }
  };

  const filteredInsumos = insumosList.filter((i) =>
    i.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticos = insumosList.filter((i) => i.quantidade <= 5);

  return (
    <AppShell
      title="Insumos"
      description="Gerenciamento de ingredientes e insumos da cozinha."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchInsumos} title="Recarregar">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-brand text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4 mr-1" /> Novo insumo
          </Button>
        </div>
      }
    >
      {criticos.length > 0 && (
        <Card className="mb-4 border-warning/40 bg-warning/10 shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="size-5 text-warning shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">{criticos.length} insumos</span> com estoque baixo ou crítico (≤ 5):{" "}
              {criticos.map((i) => i.nome).join(", ")}.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Input
              placeholder="Buscar insumo pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 sm:max-w-72"
            />
            <span className="text-xs text-muted-foreground">
              Total de itens: {filteredInsumos.length}
            </span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando insumos da API...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchInsumos} className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredInsumos.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <p>Nenhum insumo encontrado.</p>
              <Button variant="link" onClick={handleOpenCreateModal}>
                Cadastrar primeiro insumo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Insumo</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Estoque Atual</TableHead>
                    <TableHead className="text-right">Preço / Custo</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsumos.map((i) => {
                    const isBaixo = i.quantidade <= 5;
                    return (
                      <TableRow key={i.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{i.id}
                        </TableCell>
                        <TableCell className="font-medium">{i.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {i.unidadeMedida || "un"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {i.quantidade} {i.unidadeMedida || "un"}
                        </TableCell>
                        <TableCell className="text-right">{brl(i.preco)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isBaixo
                                ? "border-destructive/25 bg-destructive/10 text-destructive whitespace-nowrap"
                                : "border-success/25 bg-success/12 text-success whitespace-nowrap"
                            }
                          >
                            {isBaixo ? "Baixo Estoque" : "Adequado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModal(i)}
                              className="size-8"
                            >
                              <Pencil className="size-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => i.id && setDeleteId(i.id)}
                              className="size-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingInsumo ? "Editar Insumo" : "Novo Insumo"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do insumo para gerenciar no estoque.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Insumo</Label>
              <Input
                id="nome"
                placeholder="Ex: Carne Moída, Farinha de Trigo..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço / Custo (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade em Estoque</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
              <Input
                id="unidadeMedida"
                placeholder="Ex: kg, g, L, ml, un, caixa"
                value={unidadeMedida}
                onChange={(e) => setUnidadeMedida(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4 flex justify-end">
              <Button type="submit" className="bg-brand text-primary-foreground font-semibold" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" /> Salvando...
                  </>
                ) : editingInsumo ? (
                  "Atualizar Insumo"
                ) : (
                  "Cadastrar Insumo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Insumo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. O insumo será removido permanentemente da base de dados.
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
