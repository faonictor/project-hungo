import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Tags, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { apiCategorias, Categoria } from "@/lib/api";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Hungo" },
      {
        name: "description",
        content: "Organize as categorias do cardápio.",
      },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const [categoriasList, setCategoriasList] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [nome, setNome] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCategorias.listar();
      setCategoriasList(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar categorias");
      toast.error("Erro ao conectar com a API de categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategoria(null);
    setNome("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Categoria) => {
    setEditingCategoria(cat);
    setNome(cat.nome);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.warning("Por favor, preencha o nome da categoria.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategoria && editingCategoria.id) {
        await apiCategorias.atualizar(editingCategoria.id, { nome: nome.trim() });
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await apiCategorias.salvar({ nome: nome.trim() });
        toast.success("Categoria criada com sucesso!");
      }
      setIsModalOpen(false);
      fetchCategorias();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar categoria");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await apiCategorias.deletar(deleteId);
      toast.success("Categoria excluída com sucesso!");
      setDeleteId(null);
      fetchCategorias();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir categoria");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell
      title="Categorias"
      description="Organize as categorias do cardápio."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchCategorias} title="Recarregar">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-brand text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4 mr-1" /> Nova categoria
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin mr-2" />
          Carregando categorias da API...
        </div>
      ) : error ? (
        <div className="flex h-48 flex-col items-center justify-center text-destructive">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCategorias} className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      ) : categoriasList.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
          <p>Nenhuma categoria cadastrada ainda.</p>
          <Button variant="link" onClick={handleOpenCreateModal}>
            Cadastrar primeira categoria
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categoriasList.map((c) => (
            <Card key={c.id} className="shadow-card relative group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent">
                    <Tags className="size-5 text-primary" />
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditModal(c)}
                      className="size-8"
                      title="Editar"
                    >
                      <Pencil className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => c.id && setDeleteId(c.id)}
                      className="size-8 text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-4 text-base font-semibold">{c.nome}</p>
                <p className="mt-1 text-xs text-muted-foreground font-mono">ID: #{c.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal (Criar / Editar) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              Informe o nome da categoria para agrupar produtos no cardápio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="catNome">Nome da Categoria</Label>
              <Input
                id="catNome"
                placeholder="Ex: Bebidas, Porções, Lanches, Sobremesas..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-4 flex justify-end">
              <Button type="submit" className="bg-brand text-primary-foreground font-semibold" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" /> Salvando...
                  </>
                ) : editingCategoria ? (
                  "Atualizar Categoria"
                ) : (
                  "Cadastrar Categoria"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog (Deletar) */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá a categoria. Certifique-se de que não há produtos vinculados a ela.
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
