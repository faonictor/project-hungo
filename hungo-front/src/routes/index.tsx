import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Plus, Loader2, RefreshCw, ShoppingBag, Utensils } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl, vendasSemana } from "@/lib/mock-data";
import {
  apiVendas,
  apiPedidos,
  apiMesas,
  Venda,
  Pedido,
  Mesa,
} from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hungo — Painel de gestão do restaurante" },
      {
        name: "description",
        content: "Acompanhe faturamento, pedidos e ocupação de mesas do seu restaurante em tempo real.",
      },
    ],
  }),
  component: DashboardPage,
});

const statusTone: Record<string, string> = {
  Aberto: "bg-info/12 text-info border-info/25",
  "Em preparo": "bg-warning/15 text-warning border-warning/35",
  Entregue: "bg-success/12 text-success border-success/25",
  Pago: "bg-success/20 text-success border-success/40",
  Cancelado: "bg-destructive/10 text-destructive border-destructive/25",
};

function DashboardPage() {
  const [vendasAbertas, setVendasAbertas] = useState<Venda[]>([]);
  const [vendasFechadas, setVendasFechadas] = useState<Venda[]>([]);
  const [pedidosList, setPedidosList] = useState<Pedido[]>([]);
  const [mesasList, setMesasList] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [abertas, fechadas, peds, ms] = await Promise.all([
        apiVendas.listarEmAberto(),
        apiVendas.listarFechadas(),
        apiPedidos.listar(),
        apiMesas.listar(),
      ]);
      setVendasAbertas(abertas);
      setVendasFechadas(fechadas);
      setPedidosList(peds);
      setMesasList(ms);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalFaturado = vendasFechadas.reduce((a, v) => a + (v.total || 0), 0);
  const totalEmAberto = vendasAbertas.reduce((a, v) => a + (v.total || 0), 0);
  const mesasOcupadas = mesasList.filter((m) => m.status === false).length;

  const kpis = [
    {
      title: "Faturamento Encerrado",
      value: brl(totalFaturado),
      hint: `${vendasFechadas.length} comandas pagas`,
      up: true,
    },
    {
      title: "Valor em Aberto",
      value: brl(totalEmAberto),
      hint: `${vendasAbertas.length} comandas ativas`,
      up: true,
    },
    {
      title: "Pedidos Registrados",
      value: pedidosList.length.toString(),
      hint: "Total acumulado",
      up: true,
    },
    {
      title: "Mesas Ocupadas",
      value: `${mesasOcupadas}/${mesasList.length}`,
      hint: mesasList.length > 0 ? `${Math.round((mesasOcupadas / mesasList.length) * 100)}% de ocupação` : "Sem mesas",
      up: mesasOcupadas > 0,
    },
  ];

  return (
    <AppShell
      title="Dashboard"
      description="Resumo da operação do restaurante em tempo real."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchDashboardData} title="Recarregar">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <a href="/vendas">
            <Button className="bg-brand text-primary-foreground hover:opacity-90">
              <Plus className="size-4 mr-1" /> Ir para Comandas
            </Button>
          </a>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="shadow-card">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 font-semibold text-success">
                  <ArrowUpRight className="size-3.5" />
                </span>
                {kpi.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Faturamento semanal estimado</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vendasSemana} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="dia" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                  formatter={(v: number) => brl(v)}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="size-4 text-primary" /> Comandas Abertas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendasAbertas.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">
                Nenhuma comanda aberta no salão.
              </p>
            ) : (
              vendasAbertas.slice(0, 4).map((v) => (
                <div key={v.id} className="flex justify-between items-center text-xs p-2.5 border rounded-lg bg-card">
                  <div>
                    <p className="font-semibold text-foreground">{v.mesa?.nome || "Retirada"}</p>
                    <p className="text-muted-foreground">Comanda #{v.id}</p>
                  </div>
                  <span className="font-bold text-foreground">{brl(v.total || 0)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle>Últimos Pedidos Lançados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex h-36 items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin mr-2" />
              Carregando últimos pedidos...
            </div>
          ) : pedidosList.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag className="size-6 mb-1 text-muted-foreground/60" />
              <p className="text-xs">Nenhum pedido lançado na base de dados.</p>
            </div>
          ) : (
            pedidosList.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono">#{p.id}</span>
                  <div>
                    <p className="text-sm font-medium">{p.cliente?.nome || "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.venda?.mesa?.nome || "Sem Mesa"} · {p.tipoPedido || "Mesa"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={statusTone[p.statusPedido || "Aberto"] || statusTone["Aberto"]}>
                  {p.statusPedido || "Aberto"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
