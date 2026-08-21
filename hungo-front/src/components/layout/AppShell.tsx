import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Lock,
  Package,
  Tags,
  Users,
  Wallet,
  Utensils,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import { useState, memo, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const nav = [
  {
    title: "Visão geral",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operação",
    items: [
      { to: "/vendas", label: "Comandas", icon: Receipt },
      { to: "/pedidos", label: "Pedidos", icon: ShoppingBag },
    ],
  },
  {
    title: "Cardápio",
    items: [
      { to: "/produtos", label: "Produtos", icon: Package },
      { to: "/categorias", label: "Categorias", icon: Tags },
    ],
  },
  {
    title: "Gestão",
    items: [
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/vendas/encerradas", label: "Vendas encerradas", icon: Lock },
      { to: "/financeiro", label: "Financeiro", icon: Wallet },
    ],
  },
] as const;

const SidebarContent = memo(function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLElement>(null);
  const scrollTopRef = useRef<number>(0);

  const handleScroll = () => {
    if (navRef.current) {
      scrollTopRef.current = navRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (navRef.current && scrollTopRef.current > 0) {
      navRef.current.scrollTop = scrollTopRef.current;
    }
  });

  return (
    <div className="flex h-full flex-col bg-sidebar-gradient text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border/20">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-float ring-1 ring-black/5">
          <img
            src="/logo-hungo.svg"
            alt="Hungo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="leading-tight min-w-0">
          <p className="text-base font-bold tracking-tight text-sidebar-foreground">Hungo</p>
          <p className="text-xs text-sidebar-foreground/60">Gestão de restaurantes</p>
        </div>
      </div>

      <nav
        ref={navRef}
        onScroll={handleScroll}
        className="flex-1 space-y-6 overflow-y-auto scrollbar-none px-3 pb-6"
      >
        {nav.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.to === "/" ? pathname === "/" : pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      preload="intent"
                      resetScroll={false}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand text-sidebar-primary-foreground shadow-float"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4.5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>


    </div>
  );
});

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-0 p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SidebarContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos, produtos, clientes..."
                className="h-9 pl-9"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-brand text-xs text-primary-foreground">
                    LM
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">Léo Martins</span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="w-full sm:w-auto shrink-0">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
