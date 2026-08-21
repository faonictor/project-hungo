import { useState, useEffect } from "react";
import {
  Utensils,
  ShoppingBag,
  Truck,
  Plus,
  Search,
  Check,
  User,
  Loader2,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Mesa, Cliente, Endereco, apiEnderecos } from "@/lib/api";
import { cn } from "@/lib/utils";

interface NovaComandaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTipoAtendimento?: string;
  initialMesaId?: string;
  mesasList: Mesa[];
  clientesList: Cliente[];
  onSubmit: (payload: {
    tipoAtendimento: string;
    mesaId?: string;
    clienteId?: string;
    nomeCliente?: string;
    enderecoId?: string;
    taxaEntrega?: number;
  }) => Promise<void>;
  submitting: boolean;
}

export function NovaComandaModal({
  open,
  onOpenChange,
  initialTipoAtendimento = "LOCAL",
  initialMesaId = "",
  mesasList,
  clientesList,
  onSubmit,
  submitting,
}: NovaComandaModalProps) {
  const [tipoAtendimento, setTipoAtendimento] = useState<string>(initialTipoAtendimento);
  const [selectedMesaId, setSelectedMesaId] = useState<string>(initialMesaId);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [clienteSearchTerm, setClienteSearchTerm] = useState<string>("");
  const [isClienteConfirmed, setIsClienteConfirmed] = useState<boolean>(false);
  const [isClienteDropdownOpen, setIsClienteDropdownOpen] = useState<boolean>(false);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [selectedEnderecoId, setSelectedEnderecoId] = useState<string>("");
  const [taxaEntrega, setTaxaEntrega] = useState<string>("0.00");

  useEffect(() => {
    if (open) {
      setTipoAtendimento(initialTipoAtendimento || "LOCAL");
      setSelectedMesaId(initialMesaId || (mesasList[0]?.id ? mesasList[0].id.toString() : ""));
      setSelectedClienteId("");
      setClienteSearchTerm("");
      setIsClienteConfirmed(false);
      setIsClienteDropdownOpen(false);
      setSelectedEnderecoId("");
      setEnderecosCliente([]);
      setTaxaEntrega("0.00");
    }
  }, [open, initialTipoAtendimento, initialMesaId, mesasList]);

  useEffect(() => {
    if (selectedClienteId) {
      const cid = parseInt(selectedClienteId, 10);
      if (!isNaN(cid)) {
        apiEnderecos
          .listarPorCliente(cid)
          .then((ends) => {
            setEnderecosCliente(ends || []);
            if (ends && ends.length > 0 && ends[0]?.id) {
              setSelectedEnderecoId(ends[0].id.toString());
            } else {
              setSelectedEnderecoId("");
            }
          })
          .catch(() => {
            setEnderecosCliente([]);
            setSelectedEnderecoId("");
          });
      }
    } else {
      setEnderecosCliente([]);
      setSelectedEnderecoId("");
    }
  }, [selectedClienteId, tipoAtendimento]);

  const filteredClientes = clientesList.filter((c) => {
    if (!clienteSearchTerm) return true;
    const term = clienteSearchTerm.toLowerCase();
    return (
      (c.nome && c.nome.toLowerCase().includes(term)) ||
      (c.telefone && c.telefone.includes(term)) ||
      (c.cpf && c.cpf.includes(term))
    );
  });

  const handleSelectCliente = (cliente: Cliente) => {
    if (!cliente.id) return;
    setSelectedClienteId(cliente.id.toString());
    setClienteSearchTerm(cliente.nome);
    setIsClienteConfirmed(true);
    setIsClienteDropdownOpen(false);
  };

  const handleClearCliente = () => {
    setSelectedClienteId("");
    setClienteSearchTerm("");
    setIsClienteConfirmed(false);
    setSelectedEnderecoId("");
    setEnderecosCliente([]);
  };

  const selectedClienteObj = selectedClienteId
    ? clientesList.find((c) => c.id?.toString() === selectedClienteId)
    : null;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tipoAtendimento === "LOCAL" && !selectedMesaId) {
      toast.warning("Selecione uma mesa física.");
      return;
    }

    await onSubmit({
      tipoAtendimento,
      mesaId: tipoAtendimento === "LOCAL" ? selectedMesaId : undefined,
      clienteId: selectedClienteId || undefined,
      nomeCliente: !selectedClienteId && clienteSearchTerm.trim() ? clienteSearchTerm.trim() : undefined,
      enderecoId: tipoAtendimento === "DELIVERY" && selectedEnderecoId ? selectedEnderecoId : undefined,
      taxaEntrega:
        tipoAtendimento === "DELIVERY"
          ? parseFloat(taxaEntrega.toString().replace(",", ".")) || 0
          : 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Nova Comanda de Atendimento
          </DialogTitle>
          <DialogDescription className="text-xs">
            Abra uma nova comanda selecionando o canal de atendimento e o cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitForm} className="space-y-4 py-2 text-xs">
          <div className="space-y-2">
            <Label className="text-xs">Canal de Atendimento</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipoAtendimento("LOCAL")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  tipoAtendimento === "LOCAL"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Utensils className="size-4" />
                <span>Local</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoAtendimento("RETIRADA")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  tipoAtendimento === "RETIRADA"
                    ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <ShoppingBag className="size-4" />
                <span>Retirada</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoAtendimento("DELIVERY")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  tipoAtendimento === "DELIVERY"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Truck className="size-4" />
                <span>Delivery</span>
              </button>
            </div>
          </div>

          {tipoAtendimento === "LOCAL" && (
            <div className="space-y-2">
              <Label htmlFor="mesaSelect" className="text-xs">
                Mesa
              </Label>
              <Select value={selectedMesaId || undefined} onValueChange={setSelectedMesaId}>
                <SelectTrigger id="mesaSelect" className="text-xs">
                  <SelectValue placeholder="Selecione a mesa..." />
                </SelectTrigger>
                <SelectContent>
                  {(mesasList || [])
                    .filter((m) => m.id !== undefined && m.id !== null)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id!.toString()}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full shrink-0",
                              m.status ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                          <span>{m.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">
              {tipoAtendimento === "DELIVERY"
                ? "Cliente (Obrigatório para Entrega)"
                : "Identificação do Cliente (Opcional)"}
            </Label>

            {isClienteConfirmed && (selectedClienteObj || clienteSearchTerm.trim()) ? (
              <div className="flex items-center justify-between p-2.5 border rounded-xl bg-muted/40 border-border shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0",
                      selectedClienteObj
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-foreground truncate">
                      {selectedClienteObj?.nome || clienteSearchTerm.trim()}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedClienteObj?.telefone
                        ? selectedClienteObj.telefone
                        : selectedClienteObj
                        ? "Cliente Cadastrado"
                        : "Consumo Local"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsClienteConfirmed(false)}
                    className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                    title="Editar nome do cliente"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearCliente}
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Remover cliente"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Popover
                open={
                  isClienteDropdownOpen &&
                  clienteSearchTerm.trim() !== "" &&
                  filteredClientes.length > 0
                }
                onOpenChange={setIsClienteDropdownOpen}
              >
                <PopoverAnchor asChild>
                  <div className="relative">
                    <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, telefone ou digitar nome avulso..."
                      value={clienteSearchTerm}
                      onChange={(e) => {
                        setClienteSearchTerm(e.target.value);
                        setSelectedClienteId("");
                        setIsClienteDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (clienteSearchTerm.trim() !== "" && filteredClientes.length > 0) {
                          setIsClienteDropdownOpen(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsClienteDropdownOpen(false);
                          if (clienteSearchTerm.trim()) {
                            setIsClienteConfirmed(true);
                          }
                        }, 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setIsClienteDropdownOpen(false);
                          if (clienteSearchTerm.trim()) {
                            setIsClienteConfirmed(true);
                          }
                        } else if (e.key === "Escape") {
                          setIsClienteDropdownOpen(false);
                        }
                      }}
                      className="pl-8 text-xs h-9"
                    />
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  className="w-[var(--radix-popover-anchor-width)] min-w-[280px] p-0 max-h-48 overflow-y-auto z-50 shadow-lg border rounded-lg bg-popover text-popover-foreground"
                  align="start"
                  sideOffset={4}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="divide-y text-xs">
                    {filteredClientes.slice(0, 6).map((cli) => (
                      <div
                        key={cli.id}
                        onClick={() => handleSelectCliente(cli)}
                        className="p-2.5 flex items-center justify-between hover:bg-muted/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">{cli.nome}</p>
                            {cli.telefone && (
                              <p className="text-[10px] text-muted-foreground">{cli.telefone}</p>
                            )}
                          </div>
                        </div>
                        {selectedClienteId === cli.id?.toString() && (
                          <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {tipoAtendimento === "DELIVERY" && (
            <div className="space-y-3 pt-2 border-t border-dashed">
              <div className="space-y-2">
                <Label className="text-xs">Endereço de Entrega</Label>
                {enderecosCliente.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic p-2 bg-muted/40 rounded-lg">
                    {selectedClienteId
                      ? "Nenhum endereço cadastrado para este cliente."
                      : "Selecione um cliente cadastrado para carregar os endereços de entrega."}
                  </p>
                ) : (
                  <Select value={selectedEnderecoId || undefined} onValueChange={setSelectedEnderecoId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Selecione o endereço..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(enderecosCliente || [])
                        .filter((end) => end.id !== undefined && end.id !== null)
                        .map((end) => (
                          <SelectItem key={end.id} value={end.id!.toString()}>
                            {end.rua}, Nº {end.numero} — {end.bairro}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxaEntregaInput" className="text-xs">
                  Taxa de Entrega (R$)
                </Label>
                <Input
                  id="taxaEntregaInput"
                  type="number"
                  step="0.50"
                  min="0"
                  value={taxaEntrega}
                  onChange={(e) => setTaxaEntrega(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t flex flex-row items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-9 px-4 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand text-primary-foreground font-bold h-9 px-4 text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" /> Abrindo comanda...
                </>
              ) : (
                <>
                  <span>Iniciar Comanda e Lançar</span>
                  <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
