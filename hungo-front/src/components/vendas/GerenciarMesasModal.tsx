import { useState } from "react";
import {
  Grid2X2Plus,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  Utensils,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mesa } from "@/lib/api";

const isMesaNumerica = (nome: string) => {
  return /^Mesa\s*\d+$/i.test((nome || "").trim());
};

interface GerenciarMesasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesasList: Mesa[];
  loadingMesas: boolean;
  onCreateIndividual: (nome: string) => Promise<void>;
  onGenerateLote: (prefix: string, qty: number) => Promise<void>;
  generatingLote: boolean;
  onDeleteMesa: (id: number) => Promise<void>;
  onSaveEditMesa: (mesa: Mesa, novoNome: string) => Promise<void>;
  savingEditMesa: boolean;
}

export function GerenciarMesasModal({
  open,
  onOpenChange,
  mesasList,
  loadingMesas,
  onCreateIndividual,
  onGenerateLote,
  generatingLote,
  onDeleteMesa,
  onSaveEditMesa,
  savingEditMesa,
}: GerenciarMesasModalProps) {
  const [categoriaMesaTab, setCategoriaMesaTab] = useState<string>("todas");
  const [modoCriacaoMesa, setModoCriacaoMesa] = useState<"individual" | "lote">("lote");
  const [novaMesaFisicaNome, setNovaMesaFisicaNome] = useState("");
  const [quantidadeLote, setQuantidadeLote] = useState<string>("5");
  const [prefixoLote, setPrefixoLote] = useState<string>("Mesa");

  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [editMesaNome, setEditMesaNome] = useState("");

  const handleOpenEdit = (mesa: Mesa) => {
    setEditingMesa(mesa);
    setEditMesaNome(mesa.nome);
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMesa || !editMesaNome.trim()) return;
    await onSaveEditMesa(editingMesa, editMesaNome.trim());
    setEditingMesa(null);
  };

  const filteredMesas = mesasList.filter((m) => {
    if (categoriaMesaTab === "numericas") return isMesaNumerica(m.nome || "");
    if (categoriaMesaTab === "especiais") return !isMesaNumerica(m.nome || "");
    return true;
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Grid2X2Plus className="size-5 text-primary" />
              Gerenciamento do Mapa de Mesas Físicas
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cadastre e organize as mesas físicas do salão, varanda e camarotes do restaurante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="p-4 border rounded-xl bg-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Plus className="size-4 text-primary" /> Adicionar Novas Mesas ao Salão
                </span>

                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setModoCriacaoMesa("lote")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      modoCriacaoMesa === "lote"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Gerar em Lote
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoCriacaoMesa("individual")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      modoCriacaoMesa === "individual"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Mesa Individual
                  </button>
                </div>
              </div>

              {modoCriacaoMesa === "lote" ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const qty = parseInt(quantidadeLote, 10);
                    if (qty > 0) {
                      await onGenerateLote(prefixoLote, qty);
                    }
                  }}
                  className="space-y-3 pt-1"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="prefLote" className="text-xs">
                        Prefixo da Mesa
                      </Label>
                      <Input
                        id="prefLote"
                        placeholder="Ex: Mesa"
                        value={prefixoLote}
                        onChange={(e) => setPrefixoLote(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qtdLote" className="text-xs">
                        Quantidade de Mesas
                      </Label>
                      <Input
                        id="qtdLote"
                        type="number"
                        min="1"
                        max="50"
                        value={quantidadeLote}
                        onChange={(e) => setQuantidadeLote(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex items-end">
                      <Button
                        type="submit"
                        disabled={generatingLote}
                        className="w-full bg-brand text-primary-foreground hover:opacity-90 font-semibold text-xs h-8"
                      >
                        {generatingLote ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin mr-1" /> Criando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3.5 mr-1" /> Gerar Lote
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cria sequência automática (ex: Mesa 01, Mesa 02, Mesa 03...) continuando a numeração existente.
                  </p>
                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (novaMesaFisicaNome.trim()) {
                      await onCreateIndividual(novaMesaFisicaNome.trim());
                      setNovaMesaFisicaNome("");
                    }
                  }}
                  className="flex gap-2 pt-1"
                >
                  <Input
                    placeholder="Ex: Mesa VIP, Varanda 02, Balcão Central..."
                    value={novaMesaFisicaNome}
                    onChange={(e) => setNovaMesaFisicaNome(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-brand text-primary-foreground hover:opacity-90 font-semibold text-xs h-8 shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" /> Cadastrar Mesa
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Tabs value={categoriaMesaTab} onValueChange={setCategoriaMesaTab} className="w-full sm:w-auto">
                  <TabsList className="h-8">
                    <TabsTrigger value="todas" className="text-xs px-3">
                      Todas ({mesasList.length})
                    </TabsTrigger>
                    <TabsTrigger value="numericas" className="text-xs px-3">
                      Numéricas ({mesasList.filter((m) => isMesaNumerica(m.nome || "")).length})
                    </TabsTrigger>
                    <TabsTrigger value="especiais" className="text-xs px-3">
                      Especiais ({mesasList.filter((m) => !isMesaNumerica(m.nome || "")).length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {loadingMesas ? (
                <div className="flex h-36 items-center justify-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Carregando mapa de mesas...
                </div>
              ) : filteredMesas.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground border rounded-xl p-4 text-center">
                  <Utensils className="size-6 text-muted-foreground/40 mb-1" />
                  <p className="text-xs font-semibold">Nenhuma mesa cadastrada nesta categoria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredMesas.map((mesa) => (
                    <div
                      key={mesa.id}
                      className="p-2.5 border rounded-xl bg-card hover:border-primary/40 flex items-center justify-between text-xs transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                          <Hash className="size-3" />
                        </div>
                        <span className="font-semibold text-foreground truncate">{mesa.nome}</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(mesa)}
                          className="size-6 text-muted-foreground hover:text-foreground"
                          title="Editar Nome"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        {mesa.id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteMesa(mesa.id!)}
                            className="size-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Remover Mesa"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingMesa !== null} onOpenChange={(o) => !o && setEditingMesa(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4 text-primary" /> Editar Apelido da Mesa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Altere a identificação desta mesa no mapa físico do salão.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editMesaInput">Nome da Mesa</Label>
              <Input
                id="editMesaInput"
                value={editMesaNome}
                onChange={(e) => setEditMesaNome(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full pt-3 border-t">
              <div className="flex items-center gap-2">
                {editingMesa?.id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const idToDelete = editingMesa.id!;
                      setEditingMesa(null);
                      onDeleteMesa(idToDelete);
                    }}
                    className="size-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 border-destructive/30"
                    title="Excluir Mesa"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMesa(null)}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  Cancelar
                </Button>
              </div>
              <Button
                type="submit"
                disabled={savingEditMesa}
                className="bg-brand text-primary-foreground font-semibold h-9 px-4 text-xs cursor-pointer"
              >
                {savingEditMesa ? (
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
    </>
  );
}
