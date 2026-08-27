import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Star,
  CheckCircle2,
  Utensils,
  X,
  Truck,
  ShoppingBag,
  ShoppingCart,
  ChevronRight,
  User,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { toast } from "sonner";
import {
  apiVendas,
  apiProdutos,
  apiPedidos,
  Venda,
  Produto,
  PedidoDTO,
  ItemPedidoDTO,
} from "@/lib/api";
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/vendas/$vendaId/lancar")({
  head: () => ({
    meta: [
      { title: "Lançar Itens na Comanda — Hungo" },
      {
        name: "description",
        content: "Pesquisa rápida de produtos e lançamento de itens na comanda.",
      },
    ],
  }),
  component: LancarItensPage,
});

function LancarItensPage() {
  const { vendaId } = Route.useParams();
  const navigate = useNavigate();

  const [venda, setVenda] = useState<Venda | null>(null);
  const [produtosList, setProdutosList] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [carrinho, setCarrinho] = useState<ItemPedidoDTO[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchVendaEProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      const vId = parseInt(vendaId, 10);
      if (isNaN(vId)) {
        throw new Error("Identificador de comanda inválido.");
      }
      const [vData, prods] = await Promise.all([
        apiVendas.buscarPorId(vId),
        apiProdutos.listar(),
      ]);
      if (!vData || !vData.id) {
        throw new Error("Comanda não encontrada ou já encerrada.");
      }
      setVenda(vData);
      setProdutosList(Array.isArray(prods) ? prods : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar dados da comanda ou produtos.");
      toast.error("Erro ao carregar dados da comanda ou produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendaEProdutos();
  }, [vendaId]);

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const handleAddToCart = (produto: Produto) => {
    setCarrinho((prev) => {
      const existingIndex = prev.findIndex((item) => item.produtoId === produto.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const item = updated[existingIndex];
        if (item) {
          const nextQty = item.quantidade + 1;
          updated[existingIndex] = {
            ...item,
            quantidade: nextQty,
            total: nextQty * produto.preco,
          };
        }
        return updated;
      }
      return [
        ...prev,
        {
          produtoId: produto.id,
          quantidade: 1,
          total: produto.preco,
        },
      ];
    });
    toast.success(`+1 ${produto.nome} adicionado ao carrinho!`, { duration: 1500 });
  };

  const handleRemoveFromCart = (produtoId: number) => {
    setCarrinho((prev) => prev.filter((item) => item.produtoId !== produtoId));
  };

  const handleUpdateCartQty = (produtoId: number, delta: number) => {
    setCarrinho((prev) => {
      const existing = prev.find((item) => item.produtoId === produtoId);
      if (!existing) return prev;
      const newQty = existing.quantidade + delta;
      if (newQty <= 0) {
        return prev.filter((item) => item.produtoId !== produtoId);
      }
      const produto = produtosList.find((p) => p.id === produtoId);
      const preco = produto?.preco || 0;
      return prev.map((item) =>
        item.produtoId === produtoId
          ? { ...item, quantidade: newQty, total: newQty * preco }
          : item
      );
    });
  };

  const handleSubmitPedido = async () => {
    if (!venda || !venda.id) return;
    if (carrinho.length === 0) {
      toast.warning("Adicione produtos ao carrinho antes de enviar.");
      return;
    }

    const payload: PedidoDTO = {
      vendaId: venda.id,
      clienteId: venda.cliente?.id || null,
      tipoPedido: venda.tipoAtendimento || "Mesa",
      statusPedido: "Aberto",
      itens: carrinho,
    };

    try {
      setSubmitting(true);
      await apiPedidos.salvarNovo(venda.id, payload);
      toast.success(`Pedido enviado com sucesso para a Comanda #${venda.id}!`);
      navigate({ to: "/vendas" });
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  const safeProdutosList = Array.isArray(produtosList) ? produtosList : [];
  const safeCarrinho = Array.isArray(carrinho) ? carrinho : [];

    const produtosFavoritos = safeProdutosList.filter(
      (p) => Boolean(p.favorito) === true && (p.tipo ?? true)
    );

    const filteredProdutos = safeProdutosList.filter((p) => {
      if (!(p.tipo ?? true)) return false;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        p.nome.toLowerCase().includes(q) ||
        (p.categoria?.nome && p.categoria.nome.toLowerCase().includes(q))
      );
    });

    const totalCarrinho = safeCarrinho.reduce((acc, item) => acc + (item.total || 0), 0);

    if (loading) {
      return (
        <AppShell title="Lançar Itens" description="Carregando produtos...">
          <LoadingState message={`Carregando comanda #${vendaId}...`} />
        </AppShell>
      );
    }

    if (error || !venda) {
      return (
        <AppShell
          title="Lançar Itens na Comanda"
          actions={
            <Button variant="outline" onClick={() => navigate({ to: "/vendas" })}>
              <ArrowLeft className="size-4 mr-1" /> Voltar para Comandas
            </Button>
          }
        >
          <ErrorState
            title="Não foi possível carregar a comanda"
            message={error || "A comanda selecionada não foi encontrada ou não está disponível."}
            onRetry={fetchVendaEProdutos}
          />
        </AppShell>
      );
    }

    return (
      <AppShell
        title={`Lançar Itens — Comanda #${venda.numeroComanda || venda.id}`}
        description="Pesquise produtos e lance o pedido diretamente na comanda."
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/vendas" })}>
            <ArrowLeft className="size-4 mr-1" /> Voltar para Comandas
          </Button>
        }
      >
      <div className="mb-6 p-4 border rounded-xl bg-card shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm shrink-0">
            #{venda?.numeroComanda || venda?.id}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                Comanda #{venda?.numeroComanda || venda?.id}
              </h2>
              <ChannelBadge
                tipo={venda?.tipoAtendimento}
                mesaNome={venda?.mesa?.nome}
              />
              <Badge variant="outline" className="text-xs border-border bg-muted/40 font-medium">
                <User
                  className={`size-3 mr-1 ${
                    Boolean(venda?.cliente?.id)
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-primary"
                  }`}
                />
                {venda?.cliente?.nome || (venda as any)?.nomeCliente || "Consumo Local"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">
              Total Parcial Acumulado
              {venda?.taxaEntrega && venda.taxaEntrega > 0 ? ` (com frete ${brl(venda.taxaEntrega)})` : ""}
            </span>
            <span className="text-xl font-bold text-foreground">{brl(venda?.total || 0)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-card overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Digite o nome do produto ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-10 h-12 text-sm rounded-xl shadow-sm border focus-visible:border-primary"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {searchTerm.trim() === "" ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Star className="size-3.5 fill-warning text-warning" /> Produtos Favoritos
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {produtosFavoritos.length}/12 cadastrados
                    </span>
                  </div>

                  {produtosFavoritos.length === 0 ? (
                    <div className="p-6 border rounded-xl bg-card text-center text-muted-foreground space-y-2">
                      <Star className="size-8 mx-auto text-warning/60 mb-1" />
                      <p className="text-sm font-medium text-foreground">Nenhum produto favoritado no cardápio.</p>
                      <p className="text-xs text-muted-foreground">
                        Na tela de <strong>Produtos</strong>, clique na estrela para selecionar até 12 produtos para lançamento instantâneo!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {produtosFavoritos.map((fav) => (
                        <div
                          key={fav.id}
                          onClick={() => handleAddToCart(fav)}
                          className="p-3.5 border border-border rounded-xl bg-card hover:border-primary/50 text-left transition-all shadow-sm flex flex-col justify-between group cursor-pointer h-28"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {fav.nome}
                            </span>
                            <Star className="size-4 fill-warning text-warning shrink-0 ml-1" />
                          </div>
                          <div className="mt-2 flex justify-between items-center text-xs">
                            <span className="font-bold text-foreground text-sm">{brl(fav.preco || 0)}</span>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(fav);
                              }}
                              className="bg-brand text-primary-foreground hover:opacity-90 font-semibold text-xs h-8"
                            >
                              <Plus className="size-3.5 mr-0.5" /> Adicionar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <div className="py-2.5 px-4 bg-muted/30 border-b flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Resultados da Busca ({filteredProdutos.length})
                    </span>
                    <span className="text-muted-foreground">
                      Buscando por "{searchTerm}"
                    </span>
                  </div>

                  <div>
                    {filteredProdutos.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Utensils className="size-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Nenhum produto encontrado para "{searchTerm}".</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Verifique a grafia ou tente buscar por categoria.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y max-h-[450px] overflow-y-auto">
                        {filteredProdutos.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                <Utensils className="size-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm">
                                  {prod.nome}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {prod.categoria?.nome || "Sem Categoria"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-bold text-foreground text-base">
                                {brl(prod.preco || 0)}
                              </span>
                              <Button
                                onClick={() => handleAddToCart(prod)}
                                className="bg-brand text-primary-foreground hover:opacity-90 font-semibold"
                              >
                                <Plus className="size-4 mr-0.5" /> Adicionar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card sticky top-4 border-2">
            <CardHeader className="py-4 border-b bg-muted/20">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="size-5 text-primary" /> Carrinho do Pedido
                </span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {carrinho.reduce((acc, i) => acc + i.quantidade, 0)} itens
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {carrinho.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <ShoppingCart className="size-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-medium">Seu carrinho está vazio.</p>
                  <p className="text-xs">
                    Clique em um favorito abaixo ou pesquise acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {carrinho.map((item) => {
                    const prod = produtosList.find((p) => p.id === item.produtoId);
                    return (
                      <div
                        key={item.produtoId}
                        className="p-3 border rounded-xl bg-card flex flex-col justify-between gap-2 text-xs shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-foreground text-sm">
                            {prod?.nome}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromCart(item.produtoId)}
                            className="size-6 text-destructive hover:text-destructive shrink-0"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center border-t pt-2 mt-1">
                          <span className="text-muted-foreground font-mono">
                            {brl(prod?.preco || 0)} un.
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg overflow-hidden bg-muted/40">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(item.produtoId, -1)}
                                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="px-2.5 font-bold font-mono text-xs">
                                {item.quantidade}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(item.produtoId, 1)}
                                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <span className="font-bold text-foreground text-sm w-16 text-right font-mono">
                              {brl(item.total || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-sm font-bold text-foreground">
                <span>Total a Lançar</span>
                <span className="text-lg text-brand font-mono">{brl(totalCarrinho)}</span>
              </div>

              <Button
                onClick={handleSubmitPedido}
                disabled={submitting || carrinho.length === 0}
                className="w-full h-12 text-sm font-bold bg-brand text-primary-foreground hover:opacity-90 shadow-md flex items-center justify-between px-4"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Enviando Pedido...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Enviar Pedido para Comanda</span>
                    </div>
                    <ChevronRight className="size-5 shrink-0" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
