import { useState, useEffect } from "react";
import {
  Pencil,
  Utensils,
  ShoppingBag,
  Truck,
  Search,
  Check,
  User,
  Loader2,
  Trash2,
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
import { toast } from "sonner";
import { Venda, Mesa, Cliente, Endereco, apiEnderecos } from "@/lib/api";
import { cn } from "@/lib/utils";

interface EditarComandaModalProps {
  venda: Venda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesasList: Mesa[];
  clientesList: Cliente[];
  onSave: (payload: {
    tipoAtendimento: string;
    mesaId?: string;
    clienteId?: string;
    nomeCliente?: string;
    enderecoId?: string;
    taxaEntrega?: number;
  }) => Promise<void>;
  saving: boolean;
}

export function EditarComandaModal({
  venda,
  open,
  onOpenChange,
  mesasList,
  clientesList,
  onSave,
  saving,
}: EditarComandaModalProps) {
  const [editTipoAtendimento, setEditTipoAtendimento] = useState<string>("LOCAL");
  const [editMesaId, setEditMesaId] = useState<string>("");
  const [editSelectedClienteId, setEditSelectedClienteId] = useState<string>("");
  const [editClienteSearchTerm, setEditClienteSearchTerm] = useState<string>("");
  const [isClienteConfirmed, setIsClienteConfirmed] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [selectedEnderecoId, setSelectedEnderecoId] = useState<string>("");
  const [taxaEntrega, setTaxaEntrega] = useState<string>("0.00");

  useEffect(() => {
    if (venda && open) {
      const tipo = venda.tipoAtendimento || "LOCAL";
      setEditTipoAtendimento(tipo);
      setEditMesaId(venda.mesa?.id?.toString() || "");

      const cliId = venda.cliente?.id ? venda.cliente.id.toString() : "";
      setEditSelectedClienteId(cliId);

      if (cliId) {
        setEditClienteSearchTerm(venda.cliente?.nome || "");
        setIsClienteConfirmed(true);
      } else if (venda.cliente?.nome || venda.nomeCliente) {
        setEditClienteSearchTerm(venda.cliente?.nome || venda.nomeCliente || "");
        setIsClienteConfirmed(true);
      } else {
        setEditClienteSearchTerm("");
        setIsClienteConfirmed(false);
      }

      const endId = venda.endereco?.id ? venda.endereco.id.toString() : "";
      setSelectedEnderecoId(endId);
      setTaxaEntrega(venda.taxaEntrega ? Number(venda.taxaEntrega).toFixed(2) : "0.00");
      setIsDropdownOpen(false);
    }
  }, [venda, open]);

  useEffect(() => {
    if (editSelectedClienteId) {
      const cid = parseInt(editSelectedClienteId, 10);
      if (!isNaN(cid)) {
        apiEnderecos
          .listarPorCliente(cid)
          .then((ends) => {
            const list = ends || [];
            setEnderecosCliente(list);
            if (list.length > 0) {
              setSelectedEnderecoId((prev) => {
                if (prev && list.some((e) => e.id?.toString() === prev)) {
                  return prev;
                }
                return list[0]?.id ? list[0].id.toString() : "";
              });
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
  }, [editSelectedClienteId]);

  useEffect(() => {
    if (editTipoAtendimento === "DELIVERY" && enderecosCliente.length > 0 && !selectedEnderecoId) {
      if (enderecosCliente[0]?.id) {
        setSelectedEnderecoId(enderecosCliente[0].id.toString());
      }
    }
  }, [editTipoAtendimento, enderecosCliente, selectedEnderecoId]);

  if (!venda) return null;

  const filteredClientes = (clientesList || []).filter((c) => {
    if (!editClienteSearchTerm) return true;
    const term = editClienteSearchTerm.toLowerCase();
    return (
      (c.nome && c.nome.toLowerCase().includes(term)) ||
      (c.telefone && c.telefone.includes(term)) ||
      (c.cpf && c.cpf.includes(term))
    );
  });

  const handleSelectCliente = (cli: Cliente) => {
    if (!cli.id) return;
    setEditSelectedClienteId(cli.id.toString());
    setEditClienteSearchTerm(cli.nome);
    setIsClienteConfirmed(true);
    setIsDropdownOpen(false);
  };

  const handleClearCliente = () => {
    setEditSelectedClienteId("");
    setEditClienteSearchTerm("");
    setIsClienteConfirmed(false);
    setSelectedEnderecoId("");
    setEnderecosCliente([]);
  };

  const selectedClienteObj = editSelectedClienteId
    ? (clientesList || []).find((c) => c.id?.toString() === editSelectedClienteId)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTipoAtendimento === "LOCAL" && !editMesaId) {
      toast.warning("Por favor, selecione uma mesa para o atendimento no local.");
      return;
    }

    await onSave({
      tipoAtendimento: editTipoAtendimento,
      mesaId: editTipoAtendimento === "LOCAL" ? editMesaId : undefined,
      clienteId: editSelectedClienteId || undefined,
      nomeCliente:
        !editSelectedClienteId && editClienteSearchTerm.trim()
          ? editClienteSearchTerm.trim()
          : undefined,
      enderecoId:
        editTipoAtendimento === "DELIVERY" && selectedEnderecoId ? selectedEnderecoId : undefined,
      taxaEntrega:
        editTipoAtendimento === "DELIVERY"
          ? parseFloat(taxaEntrega.toString().replace(",", ".")) || 0
          : 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Pencil className="size-5 text-primary" />
            Editar Dados da Comanda #{venda.numeroComanda || venda.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Altere o canal de atendimento, a mesa ou o cliente desta comanda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="space-y-2">
            <Label className="text-xs">Canal de Atendimento</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEditTipoAtendimento("LOCAL")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  editTipoAtendimento === "LOCAL"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Utensils className="size-4" />
                <span>Local</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTipoAtendimento("RETIRADA")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  editTipoAtendimento === "RETIRADA"
                    ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <ShoppingBag className="size-4" />
                <span>Retirada</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTipoAtendimento("DELIVERY")}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                  editTipoAtendimento === "DELIVERY"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-2xs"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Truck className="size-4" />
                <span>Delivery</span>
              </button>
            </div>
          </div>

          {editTipoAtendimento === "LOCAL" && (
            <div className="space-y-2">
              <Label htmlFor="editMesaSelect" className="text-xs">
                Mesa
              </Label>
              <Select value={editMesaId || undefined} onValueChange={setEditMesaId}>
                <SelectTrigger id="editMesaSelect" className="text-xs">
                  <SelectValue placeholder="Selecione a mesa..." />
                </SelectTrigger>
                <SelectContent>
                  {(mesasList || [])
                    .filter((m) => m.id !== undefined && m.id !== null)
                    .map((m) => {
                      const isLivre = m.status || m.id?.toString() === venda?.mesa?.id?.toString();
                      return (
                        <SelectItem key={m.id} value={m.id!.toString()}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-2 rounded-full shrink-0",
                                isLivre ? "bg-emerald-500" : "bg-amber-500"
                              )}
                            />
                            <span>{m.nome}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">
              {editTipoAtendimento === "DELIVERY"
                ? "Cliente (Obrigatório para Entrega)"
                : "Identificação do Cliente (Opcional)"}
            </Label>

            {isClienteConfirmed && (selectedClienteObj || editClienteSearchTerm.trim()) ? (
              <div className="flex items-center justify-between p-2.5 border rounded-xl bg-muted/40 border-border shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0",
                      selectedClienteObj
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-foreground truncate">
                      {selectedClienteObj?.nome || editClienteSearchTerm.trim()}
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
                  isDropdownOpen &&
                  editClienteSearchTerm.trim() !== "" &&
                  filteredClientes.length > 0
                }
                onOpenChange={setIsDropdownOpen}
              >
                <PopoverAnchor asChild>
                  <div className="relative">
                    <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cliente cadastrado ou nome avulso..."
                      value={editClienteSearchTerm}
                      onChange={(e) => {
                        setEditClienteSearchTerm(e.target.value);
                        setEditSelectedClienteId("");
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (editClienteSearchTerm.trim() !== "" && filteredClientes.length > 0) {
                          setIsDropdownOpen(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsDropdownOpen(false);
                          if (editClienteSearchTerm.trim()) {
                            setIsClienteConfirmed(true);
                          }
                        }, 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setIsDropdownOpen(false);
                          if (editClienteSearchTerm.trim()) {
                            setIsClienteConfirmed(true);
                          }
                        } else if (e.key === "Escape") {
                          setIsDropdownOpen(false);
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
                        {editSelectedClienteId === cli.id?.toString() && (
                          <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {editTipoAtendimento === "DELIVERY" && (
            <div className="space-y-3 pt-2 border-t border-dashed">
              <div className="space-y-2">
                <Label className="text-xs">Endereço de Entrega</Label>
                {enderecosCliente.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic p-2 bg-muted/40 rounded-lg">
                    {editSelectedClienteId
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
                <Label htmlFor="editTaxaEntrega" className="text-xs">
                  Taxa de Entrega (R$)
                </Label>
                <Input
                  id="editTaxaEntrega"
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
              disabled={saving}
              className="h-9 px-4 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-brand text-primary-foreground font-semibold h-9 px-4 text-xs cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" /> Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
