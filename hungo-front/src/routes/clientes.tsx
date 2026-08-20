import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, RefreshCw, MapPin, User, Phone, Mail } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  apiClientes,
  apiEnderecos,
  Cliente,
  ClienteEnderecoDTO,
  Endereco,
} from "@/lib/api";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Hungo" },
      {
        name: "description",
        content: "Base de clientes, histórico de pedidos, contatos e endereços de entrega.",
      },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [includeEndereco, setIncludeEndereco] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("Fortaleza");
  const [cep, setCep] = useState("");
  const [complemento, setComplemento] = useState("");

  const [selectedClienteForEndereco, setSelectedClienteForEndereco] = useState<Cliente | null>(null);
  const [clienteEnderecos, setClienteEnderecos] = useState<Endereco[]>([]);
  const [loadingEnderecos, setLoadingEnderecos] = useState(false);
  const [isAddingEndereco, setIsAddingEndereco] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClientes.listar();
      setClientesList(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar clientes");
      toast.error("Erro ao conectar com a API de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCliente(null);
    setIncludeEndereco(true);
    setNome("");
    setTelefone("");
    setEmail("");
    setCpf("");
    setRua("");
    setNumero("");
    setBairro("");
    setCidade("Fortaleza");
    setCep("");
    setComplemento("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIncludeEndereco(false);
    setNome(cliente.nome || "");
    setTelefone(cliente.telefone || "");
    setEmail(cliente.email || "");
    setCpf(cliente.cpf || "");
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.warning("Por favor, informe o nome do cliente.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCliente && editingCliente.id) {
        await apiClientes.atualizar(editingCliente.id, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          cpf: cpf.trim(),
        });
        toast.success("Dados do cliente atualizados com sucesso!");
      } else if (includeEndereco) {
        if (!rua.trim() || !bairro.trim()) {
          toast.warning("Por favor, preencha a rua e o bairro do endereço.");
          setSubmitting(false);
          return;
        }
        const dto: ClienteEnderecoDTO = {
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          cpf: cpf.trim(),
          rua: rua.trim(),
          numero: parseInt(numero, 10) || 0,
          bairro: bairro.trim(),
          cidade: cidade.trim() || "Fortaleza",
          cep: cep.trim(),
          complemento: complemento.trim(),
          status: true,
        };
        await apiClientes.salvarComEndereco(dto);
        toast.success("Cliente e endereço cadastrados com sucesso!");
      } else {
        await apiClientes.salvar({
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          cpf: cpf.trim(),
          status: true,
        });
        toast.success("Cliente cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      fetchClientes();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar cliente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEnderecosModal = async (cliente: Cliente) => {
    if (!cliente.id) return;
    setSelectedClienteForEndereco(cliente);
    setIsAddingEndereco(false);
    try {
      setLoadingEnderecos(true);
      const ends = await apiEnderecos.listarPorCliente(cliente.id);
      setClienteEnderecos(ends);
    } catch (err: any) {
      toast.error("Erro ao carregar endereços do cliente.");
    } finally {
      setLoadingEnderecos(false);
    }
  };

  const handleAddEnderecoToCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteForEndereco || !selectedClienteForEndereco.id) return;
    if (!rua.trim() || !bairro.trim()) {
      toast.warning("Preencha rua e bairro.");
      return;
    }

    try {
      setSubmitting(true);
      await apiEnderecos.salvar({
        rua: rua.trim(),
        numero: parseInt(numero, 10) || 0,
        bairro: bairro.trim(),
        cidade: cidade.trim() || "Fortaleza",
        cep: cep.trim(),
        complemento: complemento.trim(),
        cliente: selectedClienteForEndereco,
      });
      toast.success("Novo endereço adicionado ao cliente!");
      setIsAddingEndereco(false);
      const ends = await apiEnderecos.listarPorCliente(selectedClienteForEndereco.id);
      setClienteEnderecos(ends);
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar endereço.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEndereco = async (endId: number) => {
    try {
      await apiEnderecos.deletar(endId);
      toast.success("Endereço removido.");
      if (selectedClienteForEndereco?.id) {
        const ends = await apiEnderecos.listarPorCliente(selectedClienteForEndereco.id);
        setClienteEnderecos(ends);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir endereço.");
    }
  };

  const handleDeleteCliente = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await apiClientes.deletar(deleteId);
      toast.success("Cliente excluído com sucesso!");
      setDeleteId(null);
      fetchClientes();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir cliente.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredClientes = clientesList.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.telefone && c.telefone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppShell
      title="Clientes"
      description="Cadastro de clientes e endereços de entrega."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchClientes} title="Recarregar">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-brand text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4 mr-1" /> Novo cliente
          </Button>
        </div>
      }
    >
      <Card className="shadow-card">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Input
              placeholder="Buscar cliente por nome, telefone ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 sm:max-w-80"
            />
            <span className="text-xs text-muted-foreground">
              Total de clientes: {filteredClientes.length}
            </span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando clientes da API...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchClientes} className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <p>Nenhum cliente encontrado.</p>
              <Button variant="link" onClick={handleOpenCreateModal}>
                Cadastrar primeiro cliente
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone / WhatsApp</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead className="text-center">Endereços</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{c.id}
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="size-4 text-muted-foreground shrink-0" />
                        {c.nome}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.telefone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" />
                            {c.telefone}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.email ? (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3 text-muted-foreground" />
                            {c.email}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {c.cpf || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEnderecosModal(c)}
                          className="h-8 text-xs"
                        >
                          <MapPin className="size-3 mr-1 text-primary" /> Ver Endereços
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(c)}
                            className="size-8"
                            title="Editar Cliente"
                          >
                            <Pencil className="size-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => c.id && setDeleteId(c.id)}
                            className="size-8 text-destructive hover:text-destructive"
                            title="Excluir Cliente"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              {editingCliente ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingCliente
                ? "Atualize as informações de contato do cliente."
                : "Cadastre um novo cliente com dados de contato e endereço inicial de entrega."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cliNome">Nome Completo</Label>
              <Input
                id="cliNome"
                placeholder="Ex: João da Silva, Maria Oliveira..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliTelefone">Telefone / WhatsApp</Label>
                <Input
                  id="cliTelefone"
                  placeholder="(85) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliCpf">CPF</Label>
                <Input
                  id="cliCpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliEmail">E-mail</Label>
              <Input
                id="cliEmail"
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!editingCliente && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Endereço de Entrega Inicial</Label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeEndereco}
                      onChange={(e) => setIncludeEndereco(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Incluir Endereço
                  </label>
                </div>

                {includeEndereco && (
                  <div className="space-y-3 bg-muted/40 p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 space-y-1">
                        <Label htmlFor="rua" className="text-xs">Rua / Logradouro</Label>
                        <Input
                          id="rua"
                          placeholder="Rua / Av..."
                          value={rua}
                          onChange={(e) => setRua(e.target.value)}
                          className="h-8 text-xs"
                          required={includeEndereco}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="numero" className="text-xs">Número</Label>
                        <Input
                          id="numero"
                          placeholder="123"
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          className="h-8 text-xs"
                          required={includeEndereco}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="bairro" className="text-xs">Bairro</Label>
                        <Input
                          id="bairro"
                          placeholder="Bairro"
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                          className="h-8 text-xs"
                          required={includeEndereco}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cidade" className="text-xs">Cidade</Label>
                        <Input
                          id="cidade"
                          placeholder="Cidade"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="cep" className="text-xs">CEP</Label>
                        <Input
                          id="cep"
                          placeholder="60000-000"
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="complemento" className="text-xs">Complemento</Label>
                        <Input
                          id="complemento"
                          placeholder="Apto 101, Bloco B..."
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-4 flex justify-end">
              <Button type="submit" className="bg-brand text-primary-foreground font-semibold" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" /> Salvando...
                  </>
                ) : editingCliente ? (
                  "Atualizar Cliente"
                ) : (
                  "Cadastrar Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedClienteForEndereco !== null}
        onOpenChange={(open) => !open && setSelectedClienteForEndereco(null)}
      >
        <DialogContent className="sm:max-w-md sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Endereços de {selectedClienteForEndereco?.nome}</DialogTitle>
            <DialogDescription>
              Gerencie os endereços cadastrados para este cliente.
            </DialogDescription>
          </DialogHeader>

          {loadingEnderecos ? (
            <div className="flex h-36 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              Carregando endereços...
            </div>
          ) : isAddingEndereco ? (
            <form onSubmit={handleAddEnderecoToCliente} className="space-y-3 py-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="newRua" className="text-xs">Rua</Label>
                  <Input
                    id="newRua"
                    placeholder="Rua / Av"
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newNum" className="text-xs">Número</Label>
                  <Input
                    id="newNum"
                    placeholder="Nº"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="newBairro" className="text-xs">Bairro</Label>
                  <Input
                    id="newBairro"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newCidade" className="text-xs">Cidade</Label>
                  <Input
                    id="newCidade"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="newCep" className="text-xs">CEP</Label>
                  <Input
                    id="newCep"
                    placeholder="60000-000"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newComp" className="text-xs">Complemento</Label>
                  <Input
                    id="newComp"
                    placeholder="Complemento"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingEndereco(false)}
                >
                  Voltar
                </Button>
                <Button type="submit" size="sm" className="bg-brand text-primary-foreground" disabled={submitting}>
                  Salvar Endereço
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {clienteEnderecos.length} endereço(s) encontrado(s)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRua("");
                    setNumero("");
                    setBairro("");
                    setCidade("Fortaleza");
                    setCep("");
                    setComplemento("");
                    setIsAddingEndereco(true);
                  }}
                  className="h-8 text-xs"
                >
                  <Plus className="size-3 mr-1" /> Adicionar Endereço
                </Button>
              </div>

              {clienteEnderecos.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">
                  Nenhum endereço cadastrado para este cliente.
                </p>
              ) : (
                <div className="space-y-2">
                  {clienteEnderecos.map((end) => (
                    <div
                      key={end.id}
                      className="p-3 border rounded-lg bg-card text-xs flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {end.rua}, Nº {end.numero}
                        </p>
                        <p className="text-muted-foreground">
                          {end.bairro} - {end.cidade} {end.cep ? `(CEP: ${end.cep})` : ""}
                        </p>
                        {end.complemento && (
                          <p className="text-muted-foreground italic mt-0.5">
                            Obs: {end.complemento}
                          </p>
                        )}
                      </div>
                      {end.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEndereco(end.id!)}
                          className="size-7 text-destructive hover:text-destructive shrink-0"
                          title="Remover Endereço"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá o cliente e seus registros vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCliente}
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
