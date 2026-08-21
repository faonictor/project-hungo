import { useState } from "react";
import {
  Plus,
  Eye,
  Receipt,
  User,
  Utensils,
  ShoppingBag,
  Truck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Venda, ItemPedido } from "@/lib/api";
import { brl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

interface ComandasListViewProps {
  vendasAbertas: Venda[];
  allItensAbertos: ItemPedido[];
  onOpenNovaComanda: () => void;
  onVerItensComanda: (venda: Venda) => void;
  onLancarItens: (venda: Venda) => void;
  onFecharComanda: (venda: Venda) => void;
  onExcluirComanda?: (venda: Venda) => void;
}

export function ComandasListView({
  vendasAbertas,
  allItensAbertos,
  onOpenNovaComanda,
  onVerItensComanda,
  onLancarItens,
  onFecharComanda,
}: ComandasListViewProps) {
  const [activeTab, setActiveTab] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const getVendaData = (venda: Venda) => {
    const itens = allItensAbertos.filter(
      (i) =>
        i.vendaId === venda.id ||
        (i as any).vendaId === venda.id ||
        i.pedido?.venda?.id === venda.id
    );

    const subtotal = round2(
      itens
        .filter((i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO")
        .reduce((acc, i) => acc + (i.total || 0), 0)
    );

    const taxa = round2(venda.taxaEntrega || 0);
    const totalConsumido = round2(subtotal + taxa);
    const valorPago = round2(venda.valorPago || 0);
    const saldoPendente = round2(Math.max(0, totalConsumido - valorPago));

    return {
      itensCount: itens.filter(
        (i) => !i.statusItem || i.statusItem.toUpperCase() !== "CANCELADO"
      ).length,
      subtotal,
      taxa,
      totalConsumido,
      valorPago,
      saldoPendente,
    };
  };

  const filteredVendas = vendasAbertas.filter((v) => {
    const tipo = (v.tipoAtendimento || "LOCAL").toUpperCase();
    if (activeTab === "LOCAL" && tipo !== "LOCAL" && tipo !== "SALAO") return false;
    if (activeTab === "RETIRADA" && tipo !== "RETIRADA" && tipo !== "BALCAO") return false;
    if (activeTab === "DELIVERY" && tipo !== "DELIVERY") return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      v.id?.toString().includes(q) ||
      (v.mesa?.nome && v.mesa.nome.toLowerCase().includes(q)) ||
      (v.cliente?.nome && v.cliente.nome.toLowerCase().includes(q)) ||
      (v.nomeCliente && v.nomeCliente.toLowerCase().includes(q))
    );
  });

  const countLocal = vendasAbertas.filter(
    (v) =>
      (v.tipoAtendimento || "LOCAL").toUpperCase() === "LOCAL" ||
      (v.tipoAtendimento || "").toUpperCase() === "SALAO"
  ).length;
  const countRetirada = vendasAbertas.filter(
    (v) =>
      (v.tipoAtendimento || "").toUpperCase() === "RETIRADA" ||
      (v.tipoAtendimento || "").toUpperCase() === "BALCAO"
  ).length;
  const countDelivery = vendasAbertas.filter(
    (v) => (v.tipoAtendimento || "").toUpperCase() === "DELIVERY"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9">
            <TabsTrigger
              value="TODOS"
              className="text-xs flex items-center gap-1.5 data-[state=active]:text-primary"
            >
              <Receipt className="size-3.5" />
              <span>Todas ({vendasAbertas.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="LOCAL"
              className="text-xs flex items-center gap-1.5 data-[state=active]:text-primary"
            >
              <Utensils className="size-3.5" />
              <span>Local ({countLocal})</span>
            </TabsTrigger>
            <TabsTrigger
              value="RETIRADA"
              className="text-xs flex items-center gap-1.5 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400"
            >
              <ShoppingBag className="size-3.5" />
              <span>Retirada ({countRetirada})</span>
            </TabsTrigger>
            <TabsTrigger
              value="DELIVERY"
              className="text-xs flex items-center gap-1.5 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400"
            >
              <Truck className="size-3.5" />
              <span>Delivery ({countDelivery})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          placeholder="Buscar comanda, mesa ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 sm:max-w-64 text-xs"
        />
      </div>

      {filteredVendas.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma comanda aberta neste filtro."
          description="Inicie um novo atendimento no local, retirada ou delivery."
          action={
            <Button
              onClick={onOpenNovaComanda}
              className="bg-brand text-primary-foreground font-semibold text-xs"
            >
              <Plus className="size-3.5 mr-1" /> Abrir Primeira Comanda
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVendas.map((venda) => {
            const { itensCount, taxa, totalConsumido, valorPago, saldoPendente } =
              getVendaData(venda);
            const clienteNome =
              venda.cliente?.nome || venda.nomeCliente || "";

            const rawTipo = (venda.tipoAtendimento || "LOCAL").toUpperCase();
            const isDelivery = rawTipo === "DELIVERY" || rawTipo === "ENTREGA";
            const isRetirada = rawTipo === "RETIRADA" || rawTipo === "BALCAO";

            const hoverBorderClass = isDelivery
              ? "hover:border-amber-500/80 hover:shadow-amber-500/5"
              : isRetirada
              ? "hover:border-purple-500/80 hover:shadow-purple-500/5"
              : "hover:border-primary/80 hover:shadow-primary/5";

            return (
              <div
                key={venda.id}
                onClick={() => onVerItensComanda(venda)}
                className={`p-4 rounded-2xl border bg-card transition-all flex flex-col justify-between shadow-2xs space-y-3 cursor-pointer group ${hoverBorderClass}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-base text-foreground">
                        Comanda #{venda.id}
                      </span>
                      <ChannelBadge
                        tipo={venda.tipoAtendimento}
                        mesaNome={venda.mesa?.nome}
                      />
                    </div>

                    {valorPago > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
                      >
                        Parcial Pago
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold truncate">
                      <User
                        className={cn(
                          "size-3.5 shrink-0",
                          venda.cliente
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-blue-600 dark:text-blue-400"
                        )}
                      />
                      <span className="truncate">
                        {clienteNome || (venda.mesa?.nome ? `Consumo Local (${venda.mesa.nome})` : "Consumo Local")}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">
                          Total ({itensCount} {itensCount === 1 ? "item" : "itens"}
                          {taxa > 0 ? ` + frete ${brl(taxa)}` : ""})
                        </span>
                        <span className="text-lg font-bold font-mono text-foreground">
                          {brl(totalConsumido)}
                        </span>
                      </div>

                      {valorPago > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">
                            Saldo Restante
                          </span>
                          <span className="text-sm font-bold font-mono text-primary">
                            {brl(saldoPendente)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerItensComanda(venda);
                      }}
                      className="h-9 text-xs"
                    >
                      <Eye className="size-3.5 mr-1" /> Ver
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLancarItens(venda);
                      }}
                      className="h-9 text-xs bg-brand text-primary-foreground font-semibold"
                    >
                      <Plus className="size-3.5 mr-1" /> Lançar
                    </Button>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFecharComanda(venda);
                    }}
                    className="w-full h-9 text-xs font-semibold bg-brand text-primary-foreground hover:opacity-90 flex items-center justify-between px-3.5"
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
    </div>
  );
}
