import { useState } from "react";
import {
  Utensils,
  Plus,
  Receipt,
  Eye,
  Clock,
  CheckCircle2,
  User,
  ChevronRight,
  Truck,
  ShoppingBag,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mesa, Venda, ItemPedido } from "@/lib/api";
import { brl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

type SelectedGrupo =
  | { type: "MESA"; mesa: Mesa }
  | { type: "DELIVERY" }
  | { type: "RETIRADA" };

interface MapaMesasViewProps {
  mesasList: Mesa[];
  vendasAbertas: Venda[];
  allItensAbertos: ItemPedido[];
  onOpenNovaComanda: (mesaId?: string, tipoAtendimento?: string) => void;
  onVerItensComanda: (venda: Venda) => void;
  onLancarItens: (venda: Venda) => void;
  onFecharComanda: (venda: Venda) => void;
  onGerenciarMesas?: () => void;
}

export function MapaMesasView({
  mesasList,
  vendasAbertas,
  allItensAbertos,
  onOpenNovaComanda,
  onVerItensComanda,
  onLancarItens,
  onFecharComanda,
  onGerenciarMesas,
}: MapaMesasViewProps) {
  const [filterOcupacao, setFilterOcupacao] = useState<string>("todas");
  const [selectedGrupoParaComandas, setSelectedGrupoParaComandas] = useState<SelectedGrupo | null>(null);

  const getComandaData = (comanda: Venda) => {
    const itens = allItensAbertos.filter(
      (i) =>
        i.vendaId === comanda.id ||
        (i as any).vendaId === comanda.id ||
        i.pedido?.venda?.id === comanda.id
    );
    const subtotal = itens
      .filter((i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO")
      .reduce((acc, i) => acc + (i.total || 0), 0);
    const taxa = round2(comanda.taxaEntrega || 0);
    const totalConsumido = round2(subtotal + taxa);
    const itensCount = itens.filter(
      (i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO"
    ).length;

    return {
      itens,
      subtotal,
      taxa,
      totalConsumido,
      itensCount,
    };
  };

  const getMesaData = (mesa: Mesa) => {
    const comandas = vendasAbertas.filter(
      (v) => (v.mesa?.id === mesa.id || (v as any).mesaId === mesa.id) && v.statusVenda !== false
    );
    const isOcupada = comandas.length > 0;
    const totalConsumido = comandas.reduce(
      (acc, c) => acc + getComandaData(c).totalConsumido,
      0
    );

    return {
      comandas,
      countComandas: comandas.length,
      isOcupada,
      totalConsumido: round2(totalConsumido),
    };
  };

  const getDeliveryData = () => {
    const comandas = vendasAbertas.filter(
      (v) => (v.tipoAtendimento === "DELIVERY" || v.tipoAtendimento === "ENTREGA") && v.statusVenda !== false
    );
    const isEmUso = comandas.length > 0;
    const totalConsumido = round2(
      comandas.reduce((acc, c) => acc + getComandaData(c).totalConsumido, 0)
    );
    return {
      comandas,
      countComandas: comandas.length,
      isEmUso,
      totalConsumido,
    };
  };

  const getRetiradaData = () => {
    const comandas = vendasAbertas.filter(
      (v) => (v.tipoAtendimento === "RETIRADA" || v.tipoAtendimento === "BALCAO") && !v.mesa && v.statusVenda !== false
    );
    const isEmUso = comandas.length > 0;
    const totalConsumido = round2(
      comandas.reduce((acc, c) => acc + getComandaData(c).totalConsumido, 0)
    );
    return {
      comandas,
      countComandas: comandas.length,
      isEmUso,
      totalConsumido,
    };
  };

  const deliveryData = getDeliveryData();
  const retiradaData = getRetiradaData();

  const showDelivery =
    filterOcupacao === "todas" ||
    (filterOcupacao === "livres" && !deliveryData.isEmUso) ||
    (filterOcupacao === "ocupadas" && deliveryData.isEmUso);

  const showRetirada =
    filterOcupacao === "todas" ||
    (filterOcupacao === "livres" && !retiradaData.isEmUso) ||
    (filterOcupacao === "ocupadas" && retiradaData.isEmUso);

  const countEmUso =
    (deliveryData.isEmUso ? 1 : 0) +
    (retiradaData.isEmUso ? 1 : 0) +
    mesasList.filter((m) => getMesaData(m).isOcupada).length;

  const countLivres =
    (deliveryData.isEmUso ? 0 : 1) +
    (retiradaData.isEmUso ? 0 : 1) +
    mesasList.filter((m) => !getMesaData(m).isOcupada).length;

  const countTodas = mesasList.length + 2;

  const filteredMesas = mesasList.filter((m) => {
    const { isOcupada } = getMesaData(m);
    if (filterOcupacao === "livres" && isOcupada) return false;
    if (filterOcupacao === "ocupadas" && !isOcupada) return false;
    return true;
  });

  const currentModalInfo = (() => {
    if (!selectedGrupoParaComandas) return null;

    if (selectedGrupoParaComandas.type === "MESA") {
      const mData = getMesaData(selectedGrupoParaComandas.mesa);
      return {
        type: "MESA",
        title: selectedGrupoParaComandas.mesa.nome,
        subtitlePrefix: "Total acumulado na mesa",
        IconComponent: Utensils,
        iconBgClass: "bg-primary/10 text-primary",
        badgeClass: "bg-primary/10 text-primary border-primary/30",
        cardBorderHover: "hover:border-primary/60 hover:shadow-primary/5",
        comandas: mData.comandas,
        totalConsumido: mData.totalConsumido,
        novaComandaLabel: "Nova Comanda",
        onNovaComandaClick: () => {
          const mesaId = selectedGrupoParaComandas.mesa.id?.toString() || "";
          setSelectedGrupoParaComandas(null);
          onOpenNovaComanda(mesaId, "LOCAL");
        },
      };
    }

    if (selectedGrupoParaComandas.type === "DELIVERY") {
      const dData = getDeliveryData();
      return {
        type: "DELIVERY",
        title: "Delivery",
        subtitlePrefix: "Total acumulado em delivery",
        IconComponent: Truck,
        iconBgClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35",
        cardBorderHover: "hover:border-amber-500/60 hover:shadow-amber-500/5",
        comandas: dData.comandas,
        totalConsumido: dData.totalConsumido,
        novaComandaLabel: "Novo Delivery",
        onNovaComandaClick: () => {
          setSelectedGrupoParaComandas(null);
          onOpenNovaComanda("", "DELIVERY");
        },
      };
    }

    if (selectedGrupoParaComandas.type === "RETIRADA") {
      const rData = getRetiradaData();
      return {
        type: "RETIRADA",
        title: "Retirada",
        subtitlePrefix: "Total acumulado em retirada",
        IconComponent: ShoppingBag,
        iconBgClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
        badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/35",
        cardBorderHover: "hover:border-purple-500/60 hover:shadow-purple-500/5",
        comandas: rData.comandas,
        totalConsumido: rData.totalConsumido,
        novaComandaLabel: "Nova Retirada",
        onNovaComandaClick: () => {
          setSelectedGrupoParaComandas(null);
          onOpenNovaComanda("", "RETIRADA");
        },
      };
    }

    return null;
  })();

  const totalCardsVisible = (showDelivery ? 1 : 0) + (showRetirada ? 1 : 0) + filteredMesas.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filterOcupacao} onValueChange={setFilterOcupacao}>
          <TabsList className="h-9">
            <TabsTrigger
              value="todas"
              className="text-xs flex items-center gap-1.5 data-[state=active]:text-primary"
            >
              <Utensils className="size-3.5" />
              <span>Todas ({countTodas})</span>
            </TabsTrigger>
            <TabsTrigger
              value="livres"
              className="text-xs flex items-center gap-1.5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
            >
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>Livres ({countLivres})</span>
            </TabsTrigger>
            <TabsTrigger
              value="ocupadas"
              className="text-xs flex items-center gap-1.5 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400"
            >
              <Clock className="size-3.5 text-amber-500" />
              <span>Em uso ({countEmUso})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {onGerenciarMesas && (
          <Button
            variant="outline"
            onClick={onGerenciarMesas}
            className="text-xs h-9 cursor-pointer"
          >
            <Settings2 className="size-3.5 mr-1" /> Gerenciar Mesas
          </Button>
        )}
      </div>

      {totalCardsVisible === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground border rounded-xl p-6 text-center">
          <Utensils className="size-8 text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-foreground text-sm">
            Nenhum canal ou mesa encontrado neste filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {/* Card 1: Delivery */}
          {showDelivery && (
            <div
              onClick={() => {
                if (deliveryData.isEmUso) {
                  setSelectedGrupoParaComandas({ type: "DELIVERY" });
                } else {
                  onOpenNovaComanda("", "DELIVERY");
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-44 shadow-2xs group cursor-pointer ${
                deliveryData.isEmUso
                  ? "border-amber-500/40 bg-card hover:border-amber-500/80 hover:shadow-amber-500/5"
                  : "border-border/60 bg-card/60 hover:border-amber-500/60 hover:shadow-amber-500/5 hover:bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        deliveryData.isEmUso
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-muted text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:text-amber-400"
                      }`}
                    >
                      <Truck className="size-3.5" />
                    </div>
                    <span className="font-bold text-foreground text-sm truncate">Delivery</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${
                      deliveryData.isEmUso
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 font-semibold"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 font-semibold"
                    }`}
                  >
                    {deliveryData.isEmUso ? "Em uso" : "Livre"}
                  </Badge>
                </div>

                {deliveryData.isEmUso ? (
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                      Total Delivery
                    </span>
                    <p className="font-bold text-base font-mono text-foreground">
                      {brl(deliveryData.totalConsumido)}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Receipt className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-medium text-foreground">
                        {deliveryData.countComandas}{" "}
                        {deliveryData.countComandas === 1 ? "comanda aberta" : "comandas abertas"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col items-center justify-center text-center text-muted-foreground py-1">
                    <p className="text-xs font-medium">Canal Disponível</p>
                    <p className="text-[10px] text-muted-foreground/80">Pronto para atendimento</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t flex items-center gap-1">
                {deliveryData.isEmUso ? (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGrupoParaComandas({ type: "DELIVERY" });
                    }}
                    className="w-full h-9 text-xs font-medium border-amber-500/35 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                    title="Ver Comandas de Delivery"
                  >
                    <Eye className="size-3.5 mr-1" />
                    Ver Comandas ({deliveryData.countComandas})
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNovaComanda("", "DELIVERY");
                    }}
                    className="w-full h-9 text-xs bg-brand text-primary-foreground font-semibold cursor-pointer"
                  >
                    <Plus className="size-3.5 mr-1" /> Abrir Delivery
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Card 2: Retirada */}
          {showRetirada && (
            <div
              onClick={() => {
                if (retiradaData.isEmUso) {
                  setSelectedGrupoParaComandas({ type: "RETIRADA" });
                } else {
                  onOpenNovaComanda("", "RETIRADA");
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-44 shadow-2xs group cursor-pointer ${
                retiradaData.isEmUso
                  ? "border-purple-500/40 bg-card hover:border-purple-500/80 hover:shadow-purple-500/5"
                  : "border-border/60 bg-card/60 hover:border-purple-500/60 hover:shadow-purple-500/5 hover:bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        retiradaData.isEmUso
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : "bg-muted text-muted-foreground group-hover:bg-purple-500/10 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                      }`}
                    >
                      <ShoppingBag className="size-3.5" />
                    </div>
                    <span className="font-bold text-foreground text-sm truncate">Retirada</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${
                      retiradaData.isEmUso
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 font-semibold"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 font-semibold"
                    }`}
                  >
                    {retiradaData.isEmUso ? "Em uso" : "Livre"}
                  </Badge>
                </div>

                {retiradaData.isEmUso ? (
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                      Total Retirada
                    </span>
                    <p className="font-bold text-base font-mono text-foreground">
                      {brl(retiradaData.totalConsumido)}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Receipt className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="font-medium text-foreground">
                        {retiradaData.countComandas}{" "}
                        {retiradaData.countComandas === 1 ? "comanda aberta" : "comandas abertas"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col items-center justify-center text-center text-muted-foreground py-1">
                    <p className="text-xs font-medium">Canal Disponível</p>
                    <p className="text-[10px] text-muted-foreground/80">Pronto para atendimento</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t flex items-center gap-1">
                {retiradaData.isEmUso ? (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGrupoParaComandas({ type: "RETIRADA" });
                    }}
                    className="w-full h-9 text-xs font-medium border-purple-500/35 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                    title="Ver Comandas de Retirada"
                  >
                    <Eye className="size-3.5 mr-1" />
                    Ver Comandas ({retiradaData.countComandas})
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNovaComanda("", "RETIRADA");
                    }}
                    className="w-full h-9 text-xs bg-brand text-primary-foreground font-semibold cursor-pointer"
                  >
                    <Plus className="size-3.5 mr-1" /> Abrir Retirada
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Mesas */}
          {filteredMesas.map((mesa) => {
            const { countComandas, isOcupada, totalConsumido } = getMesaData(mesa);

            return (
              <div
                key={mesa.id}
                onClick={() => {
                  if (isOcupada) {
                    setSelectedGrupoParaComandas({ type: "MESA", mesa });
                  } else {
                    onOpenNovaComanda(mesa.id?.toString() || "", "LOCAL");
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-44 shadow-2xs group cursor-pointer ${
                  isOcupada
                    ? "border-primary/40 bg-card hover:border-primary hover:shadow-primary/5"
                    : "border-border/60 bg-card/60 hover:border-primary/60 hover:shadow-primary/5 hover:bg-card"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isOcupada
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Utensils className="size-3.5" />
                      </div>
                      <span className="font-bold text-foreground text-sm truncate">
                        {mesa.nome}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        isOcupada
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 font-semibold"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 font-semibold"
                      }`}
                    >
                      {isOcupada ? "Em uso" : "Livre"}
                    </Badge>
                  </div>

                  {isOcupada ? (
                    <div className="mt-2.5 space-y-1">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                        Total da Mesa
                      </span>
                      <p className="font-bold text-base font-mono text-foreground">
                        {brl(totalConsumido)}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Receipt className="size-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">
                          {countComandas} {countComandas === 1 ? "comanda aberta" : "comandas abertas"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col items-center justify-center text-center text-muted-foreground py-1">
                      <p className="text-xs font-medium">Mesa Disponível</p>
                      <p className="text-[10px] text-muted-foreground/80">Pronto para atendimento</p>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t flex items-center gap-1">
                  {isOcupada ? (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGrupoParaComandas({ type: "MESA", mesa });
                      }}
                      className="w-full h-9 text-xs font-medium border-primary/30 hover:bg-primary/10 hover:text-primary cursor-pointer"
                      title="Ver Comandas da Mesa"
                    >
                      <Eye className="size-3.5 mr-1" />
                      Ver Comandas ({countComandas})
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNovaComanda(mesa.id?.toString() || "", "LOCAL");
                      }}
                      className="w-full h-9 text-xs bg-brand text-primary-foreground font-semibold cursor-pointer"
                    >
                      <Plus className="size-3.5 mr-1" /> Abrir Comanda
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={selectedGrupoParaComandas !== null}
        onOpenChange={(open) => !open && setSelectedGrupoParaComandas(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          {currentModalInfo && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", currentModalInfo.iconBgClass)}>
                    <currentModalInfo.IconComponent className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <span>{currentModalInfo.title}</span>
                      <Badge variant="outline" className={cn("text-xs font-semibold", currentModalInfo.badgeClass)}>
                        {currentModalInfo.comandas.length}{" "}
                        {currentModalInfo.comandas.length === 1 ? "Comanda Aberta" : "Comandas Abertas"}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {currentModalInfo.subtitlePrefix}:{" "}
                      <span className="font-bold text-foreground font-mono">
                        {brl(currentModalInfo.totalConsumido)}
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {currentModalInfo.comandas.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border rounded-xl my-2">
                  <Receipt className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-xs font-semibold">Nenhuma comanda aberta neste canal no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                  {currentModalInfo.comandas.map((comanda) => {
                    const cData = getComandaData(comanda);
                    const isCadastrado = Boolean(comanda.cliente);
                    const clienteNome =
                      comanda.cliente?.nome || comanda.nomeCliente || (currentModalInfo.type === "DELIVERY" ? "Cliente Delivery" : currentModalInfo.type === "RETIRADA" ? "Cliente Retirada" : "Consumo Local");
                    const valorPago = comanda.valorPago || 0;
                    const saldoPendente = Math.max(0, round2(cData.totalConsumido - valorPago));

                    return (
                      <div
                        key={comanda.id}
                        onClick={() => onVerItensComanda(comanda)}
                        className={cn(
                          "p-3.5 border rounded-xl bg-card border-border/80 shadow-2xs space-y-3 transition-all flex flex-col justify-between cursor-pointer group",
                          currentModalInfo.cardBorderHover
                        )}
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "size-8 rounded-full flex items-center justify-center shrink-0",
                                  isCadastrado
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                )}
                              >
                                <User className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-foreground truncate">
                                    {clienteNome}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono px-1 py-0 border-muted-foreground/30"
                                  >
                                    #{comanda.id}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {comanda.cliente?.telefone
                                    ? comanda.cliente.telefone
                                    : comanda.enderecoEntrega
                                    ? `${comanda.enderecoEntrega.rua || ""}, ${comanda.enderecoEntrega.numero || ""}`
                                    : isCadastrado
                                    ? "Cliente Cadastrado"
                                    : currentModalInfo.type === "DELIVERY"
                                    ? "Entrega Delivery"
                                    : currentModalInfo.type === "RETIRADA"
                                    ? "Retirada"
                                    : "Consumo Local"}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[11px] text-muted-foreground block">
                                Total ({cData.itensCount} {cData.itensCount === 1 ? "item" : "itens"}
                                {cData.taxa > 0 ? ` + frete ${brl(cData.taxa)}` : ""})
                              </span>
                              <span className="text-base font-bold font-mono text-foreground">
                                {brl(cData.totalConsumido)}
                              </span>
                              {valorPago > 0 && (
                                <span className="text-[10px] text-primary block font-mono">
                                  Saldo: {brl(saldoPendente)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onVerItensComanda(comanda);
                              }}
                              className="size-9 cursor-pointer shrink-0"
                              title="Ver Itens"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onLancarItens(comanda);
                              }}
                              className="flex-1 h-9 text-xs bg-brand text-primary-foreground font-semibold cursor-pointer"
                            >
                              <Plus className="size-3.5 mr-1" /> Lançar
                            </Button>
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGrupoParaComandas(null);
                              onFecharComanda(comanda);
                            }}
                            className="w-full h-9 text-xs font-semibold bg-brand text-primary-foreground hover:opacity-90 flex items-center justify-between px-3.5 cursor-pointer"
                            title="Fechar Comanda"
                          >
                            <span className="flex items-center gap-1.5">
                              <Receipt className="size-3.5" /> Fechar Comanda
                            </span>
                            <ChevronRight className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <DialogFooter className="pt-3 border-t flex flex-row items-center justify-between sm:justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedGrupoParaComandas(null)}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={currentModalInfo.onNovaComandaClick}
                  className="bg-brand text-primary-foreground hover:opacity-90 text-xs font-semibold h-9 px-4 cursor-pointer"
                >
                  <Plus className="size-3.5 mr-1" /> {currentModalInfo.novaComandaLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
