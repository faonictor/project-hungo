import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, RefreshCw, X, Utensils, Star, CheckCircle2, XCircle } from "lucide-react";
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
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { toast } from "sonner";
import {
  apiProdutos,
  apiCategorias,
  Produto,
  ProdutoDTO,
  Categoria,
} from "@/lib/api";
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Hungo" },
      {
        name: "description",
        content: "Cardápio completo com preço de venda, custo, margem e disponibilidade.",
      },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const [produtosList, setProdutosList] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdutoId, setEditingProdutoId] = useState<number | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [tipo, setTipo] = useState<boolean>(true);
  const [favorito, setFavorito] = useState<boolean>(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prods, cats] = await Promise.all([
        apiProdutos.listar(),
        apiCategorias.listar(),
      ]);
      setProdutosList(prods);
      setCategorias(cats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar produtos");
      toast.error("Erro ao conectar com a API de produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProdutoId(null);
    setNome("");
    setPreco("");
    setCategoriaId("geral");
    setTipo(true);
    setFavorito(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (id: number) => {
    setEditingProdutoId(id);
    setIsModalOpen(true);
    setLoadingDetails(true);

    try {
      const prodDTO = await apiProdutos.buscarPorId(id);
      setNome(prodDTO.nome);
      setPreco(prodDTO.preco.toString());
      setCategoriaId(prodDTO.categoriaId ? prodDTO.categoriaId.toString() : "geral");
      setTipo(prodDTO.tipo ?? true);
      setFavorito(prodDTO.favorito ?? false);
    } catch (err: any) {
      toast.error("Erro ao carregar detalhes do produto.");
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleFavorito = async (p: Produto) => {
    const isFav = !p.favorito;
    if (isFav) {
      const otherFavs = produtosList.filter((prod) => prod.favorito && prod.id !== p.id).length;
      if (otherFavs >= 12) {
        toast.warning("Você já possui o limite máximo de 12 produtos favoritos. Desmarque um para adicionar outro.");
        return;
      }
    }

    try {
      const payload: ProdutoDTO = {
        id: p.id,
        nome: p.nome,
        preco: p.preco,
        tipo: p.tipo,
        categoriaId: p.categoria?.id || null,
        favorito: isFav,
      };
      await apiProdutos.atualizar(p.id, payload);
      toast.success(isFav ? `${p.nome} destacado como Favorito! ⭐` : `${p.nome} removido dos favoritos.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar status de favorito.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.warning("O nome do produto é obrigatório.");
      return;
    }
    const parsedPreco = parseFloat(preco);
    if (isNaN(parsedPreco) || parsedPreco < 0) {
      toast.warning("Informe um preço de venda válido.");
      return;
    }

    let finalFavorito = favorito;
    if (favorito) {
      const otherFavs = produtosList.filter(
        (p) => p.favorito && p.id !== editingProdutoId
      ).length;
      if (otherFavs >= 12) {
        toast.warning("Você já possui 12 produtos favoritos. O produto será salvo sem marcação de favorito.");
        finalFavorito = false;
        setFavorito(false);
      }
    }

    const payload: ProdutoDTO = {
      ...(editingProdutoId ? { id: editingProdutoId } : {}),
      nome,
      preco: parsedPreco,
      categoriaId: categoriaId && categoriaId !== "geral" ? parseInt(categoriaId, 10) : null,
      tipo,
      favorito: finalFavorito,
    };

    try {
      setSubmitting(true);
      if (editingProdutoId) {
        await apiProdutos.atualizar(editingProdutoId, payload);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await apiProdutos.salvar(payload);
        toast.success("Produto cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao salvar produto.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await apiProdutos.deletar(deleteId);
      toast.success("Produto removido com sucesso!");
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao remover produto.");
    } finally {
      setDeleting(false);
    }
  };

  const countTodos = produtosList.length;
  const countAtivos = produtosList.filter((p) => (p.tipo ?? true) === true).length;
  const countInativos = produtosList.filter((p) => (p.tipo ?? true) === false).length;
  const countFavoritos = produtosList.filter((p) => Boolean(p.favorito) === true).length;

  const filteredProdutos = produtosList.filter((p) => {
    const isAtivo = p.tipo ?? true;
    const isFav = Boolean(p.favorito);

    if (statusFilter === "ATIVOS" && !isAtivo) return false;
    if (statusFilter === "INATIVOS" && isAtivo) return false;
    if (statusFilter === "FAVORITOS" && !isFav) return false;

    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.categoria?.nome && p.categoria.nome.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell
      title="Cardápio e Produtos"
      description="Cadastro de produtos do cardápio e gerenciamento de itens favoritos para lançamento rápido."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} title="Recarregar">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleOpenCreateModal} className="bg-brand text-primary-foreground hover:opacity-90">
            <Plus className="size-4 mr-1" /> Novo Produto
          </Button>
        </div>
      }
    >
      <Card className="shadow-card">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b pb-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="TODOS" className="text-xs flex items-center gap-1">
                  <Utensils className="size-3.5 text-muted-foreground" /> Todos ({countTodos})
                </TabsTrigger>
                <TabsTrigger value="ATIVOS" className="text-xs flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Ativos ({countAtivos})
                </TabsTrigger>
                <TabsTrigger value="INATIVOS" className="text-xs flex items-center gap-1">
                  <XCircle className="size-3.5 text-destructive" /> Inativos ({countInativos})
                </TabsTrigger>
                <TabsTrigger value="FAVORITOS" className="text-xs flex items-center gap-1">
                  <Star className="size-3.5 text-warning fill-warning" /> Favoritos ({countFavoritos}/12)
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <Input
                placeholder="Buscar produto ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 sm:w-64 text-xs"
              />
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground shrink-0 border-l pl-3">
                <span>Exibindo: <strong className="text-foreground">{filteredProdutos.length}</strong></span>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingState message="Carregando produtos da API..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchData} />
          ) : filteredProdutos.length === 0 ? (
            <EmptyState
              icon={
                statusFilter === "FAVORITOS"
                  ? Star
                  : statusFilter === "INATIVOS"
                  ? XCircle
                  : statusFilter === "ATIVOS"
                  ? CheckCircle2
                  : Utensils
              }
              title="Nenhum produto encontrado nesta visualização"
              description={
                searchTerm
                  ? `Nenhum resultado corresponde à busca por "${searchTerm}".`
                  : statusFilter === "FAVORITOS"
                  ? "Nenhum produto está marcado como favorito. Marque estrelas nos produtos para acesso rápido."
                  : statusFilter === "INATIVOS"
                  ? "Nenhum produto está inativo no momento."
                  : "Nenhum produto cadastrado no sistema."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Fav</TableHead>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço de Venda</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map((p) => {
                    const isAtivo = p.tipo ?? true;
                    const isFav = p.favorito ?? false;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorito(p)}
                            className="size-7"
                            title={isFav ? "Remover dos Favoritos (Lançamento Rápido)" : "Marcar como Favorito (Lançamento Rápido)"}
                          >
                            <Star
                              className={`size-4 ${
                                isFav ? "fill-warning text-warning" : "text-muted-foreground/40 hover:text-warning"
                              }`}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{p.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.nome}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.categoria?.nome || "Sem Categoria"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {brl(p.preco || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isAtivo
                                ? "border-success/25 bg-success/12 text-success whitespace-nowrap"
                                : "border-destructive/25 bg-destructive/10 text-destructive whitespace-nowrap"
                            }
                          >
                            {isAtivo ? "Ativo" : "Indisponível"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => p.id && handleOpenEditModal(p.id)}
                              className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                              title="Editar Produto"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => p.id && setDeleteId(p.id)}
                              className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Excluir Produto"
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
        <DialogContent className="sm:max-w-lg sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProdutoId ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {editingProdutoId
                ? "Altere as informações do produto."
                : "Preencha os dados do novo produto para o cardápio."}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando detalhes do produto...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Coca-Cola 350ml, X-Salada..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço de Venda (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria (Opcional)</Label>
                  <Select value={categoriaId || "geral"} onValueChange={setCategoriaId}>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Geral (Sem Categoria)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral (Sem Categoria)</SelectItem>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id?.toString() || ""}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t pt-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="tipoStatus"
                    checked={tipo}
                    onChange={(e) => setTipo(e.target.checked)}
                    className="size-4"
                  />
                  <Label htmlFor="tipoStatus" className="text-xs font-medium cursor-pointer">
                    Produto Ativo no Cardápio
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="favoritoStatus"
                    checked={favorito}
                    onChange={(e) => {
                      const willCheck = e.target.checked;
                      if (willCheck) {
                        const otherFavs = produtosList.filter(
                          (p) => p.favorito && p.id !== editingProdutoId
                        ).length;
                        if (otherFavs >= 12) {
                          toast.warning("Limite máximo de 12 produtos favoritos atingido. Desmarque outro produto antes de marcar este.");
                          return;
                        }
                      }
                      setFavorito(willCheck);
                    }}
                    className="size-4"
                  />
                  <Label htmlFor="favoritoStatus" className="text-xs font-semibold text-warning cursor-pointer flex items-center gap-1">
                    <Star className="size-3.5 fill-warning" /> Favorito (Atalho Rápido)
                  </Label>
                </div>
              </div>

              <DialogFooter className="pt-4 flex flex-row items-center justify-between sm:justify-between w-full">
                <div className="flex items-center gap-2">
                  {editingProdutoId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const id = editingProdutoId;
                        setIsModalOpen(false);
                        setDeleteId(id);
                      }}
                      className="size-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 border-destructive/30"
                      title="Excluir Produto"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
                <Button type="submit" className="bg-brand text-primary-foreground font-semibold" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1" /> Salvando...
                    </>
                  ) : editingProdutoId ? (
                    "Atualizar Produto"
                  ) : (
                    "Cadastrar Produto"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir produto do cardápio?"
        description="Esta ação removerá o produto do cardápio. Esta operação não poderá ser desfeita."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AppShell>
  );
}
