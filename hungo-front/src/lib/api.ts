function getApiBaseUrl(): string {
  if (import.meta.env["VITE_API_URL"]) {
    return import.meta.env["VITE_API_URL"] as string;
  }
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:8080`;
  }
  return "http://localhost:8080";
}

export function formatFriendlyErrorMessage(rawMsg: string, status?: number): string {
  if (!rawMsg) return "Não foi possível carregar os dados do servidor.";

  const lower = rawMsg.toLowerCase();
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("econnrefused")
  ) {
    return "Não foi possível conectar ao servidor da API. Verifique se o backend está em execução.";
  }
  if (
    lower.includes("unknown database") ||
    lower.includes("jdbc") ||
    lower.includes("communications link failure") ||
    lower.includes("connection refused") ||
    lower.includes("access denied") ||
    lower.includes("sqlexception")
  ) {
    return "Erro de conexão com o banco de dados. Verifique se o serviço MySQL está ativo e com a base de dados criada.";
  }
  if (lower.includes("constraintviolation") || lower.includes("foreign key")) {
    return "Não foi possível concluir a ação pois este registro está vinculado a outros dados no sistema.";
  }
  if (
    lower.includes("result must not be null") ||
    lower.includes("nullpointerexception") ||
    (status === 500 && lower.includes("internal server error"))
  ) {
    return "O servidor encontrou uma instabilidade temporária ao processar esta solicitação. Tente novamente.";
  }
  return rawMsg;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor da API. Verifique se o backend está em execução."
    );
  }

  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      }
    } catch {}
    throw new Error(formatFriendlyErrorMessage(errorMessage, response.status));
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export interface Categoria {
  id?: number;
  nome: string;
}

export interface ProdutoDTO {
  id?: number;
  nome: string;
  preco: number;
  categoriaId?: number | null;
  tipo: boolean;
  favorito?: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  tipo: boolean;
  favorito?: boolean;
  categoria?: Categoria;
}

export interface Cliente {
  id?: number;
  nome: string;
  telefone?: string;
  email?: string;
  senha?: string;
  cpf?: string;
  dataCadastro?: string;
  status?: boolean;
}

export interface Endereco {
  id?: number;
  rua: string;
  numero: number;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep?: string;
  cliente?: Cliente;
}

export interface ClienteEnderecoDTO {
  nome: string;
  telefone?: string;
  email?: string;
  senha?: string;
  cpf?: string;
  rua: string;
  numero: number;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep?: string;
  status?: boolean;
}

export interface Mesa {
  id?: number;
  nome: string;
  status?: boolean;
}

export interface Venda {
  id?: number;
  numeroComanda?: number;
  tipoAtendimento?: string;
  mesa?: Mesa | null;
  cliente?: Cliente | null;
  nomeCliente?: string | null;
  endereco?: Endereco | null;
  taxaEntrega?: number;
  formaPagamento?: string;
  dataInicioVenda?: string;
  dataFimVenda?: string | null;
  dataVencimento?: string | null;
  statusPagamento?: "PAGO" | "PENDENTE" | "PARCIAL" | string | null;
  total?: number;
  valorPago?: number;
  desconto?: number;
  totalBruto?: number;
  status?: string;
  motivoCancelamento?: string;
}

export interface ItemPedidoDTO {
  id?: number;
  produtoId: number;
  quantidade: number;
  total?: number;
  statusItem?: string | null;
  motivoCancelamento?: string | null;
}

export interface PedidoDTO {
  id?: number;
  clienteId?: number | null;
  enderecoId?: number | null;
  vendaId: number;
  tipoPedido: string;
  statusPedido: string;
  dataHora?: string;
  dataInicioPreparo?: string | null;
  dataFimPreparo?: string | null;
  motivoCancelamento?: string | null;
  itens: ItemPedidoDTO[];
}

export interface Pedido {
  id: number;
  cliente?: Cliente;
  endereco?: Endereco | null;
  venda?: Venda;
  tipoPedido?: string;
  statusPedido?: string;
  dataHora?: string;
  dataInicioPreparo?: string | null;
  dataFimPreparo?: string | null;
  motivoCancelamento?: string | null;
  itens?: ItemPedido[];
}

export interface FluxoFinanceiro {
  id?: number;
  nome: string;
  descricao?: string;
  transacao: string;
  dataTransacao?: string;
  venda?: Venda | null;
  fluxo: number;
}

export const apiCategorias = {
  listar: () => request<Categoria[]>("/categoria"),
  buscarPorId: (id: number) => request<Categoria>(`/categoria/${id}`),
  salvar: (categoria: Omit<Categoria, "id">) =>
    request<Categoria>("/categoria", {
      method: "POST",
      body: JSON.stringify(categoria),
    }),
  atualizar: (id: number, categoria: Partial<Categoria>) =>
    request<Categoria>(`/categoria/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...categoria, id }),
    }),
  deletar: (id: number) =>
    request<void>(`/categoria/${id}`, {
      method: "DELETE",
    }),
};

export const apiProdutos = {
  listar: () => request<Produto[]>("/produtos"),
  buscarPorId: (id: number) => request<ProdutoDTO>(`/produto/${id}`),
  salvar: (produto: ProdutoDTO) =>
    request<Produto>("/produto", {
      method: "POST",
      body: JSON.stringify(produto),
    }),
  atualizar: (id: number, produto: ProdutoDTO) =>
    request<Produto>(`/produto/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...produto, id }),
    }),
  deletar: (id: number) =>
    request<void>(`/produto/${id}`, {
      method: "DELETE",
    }),
};

export const apiClientes = {
  listar: () => request<Cliente[]>("/cliente"),
  buscarPorId: (id: number) => request<Cliente>(`/cliente/${id}`),
  salvar: (cliente: Omit<Cliente, "id">) =>
    request<Cliente>("/cliente", {
      method: "POST",
      body: JSON.stringify(cliente),
    }),
  salvarComEndereco: (dto: ClienteEnderecoDTO) =>
    request<Cliente>("/cliente-endereco", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  atualizar: (id: number, cliente: Partial<Cliente>) =>
    request<Cliente>(`/cliente/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...cliente, id }),
    }),
  deletar: (id: number) =>
    request<void>(`/cliente/${id}`, {
      method: "DELETE",
    }),
};

export const apiEnderecos = {
  listarTodos: () => request<Endereco[]>("/endereco"),
  listarPorCliente: (clienteId: number) => request<Endereco[]>(`/endereco/cliente/${clienteId}`),
  buscarPorId: (id: number) => request<Endereco>(`/endereco/${id}`),
  salvar: (endereco: Endereco) =>
    request<Endereco>("/endereco", {
      method: "POST",
      body: JSON.stringify(endereco),
    }),
  atualizar: (id: number, endereco: Endereco) =>
    request<Endereco>(`/endereco/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...endereco, id }),
    }),
  deletar: (id: number) =>
    request<void>(`/endereco/${id}`, {
      method: "DELETE",
    }),
};

export const apiMesas = {
  listar: () => request<Mesa[]>("/mesa"),
  listarDisponiveis: () => request<Mesa[]>("/venda/mesas-disponiveis"),
  buscarPorId: (id: number) => request<Mesa>(`/mesa/${id}`),
  salvar: (mesa: Omit<Mesa, "id">) =>
    request<Mesa>("/mesa", {
      method: "POST",
      body: JSON.stringify(mesa),
    }),
  atualizar: (id: number, mesa: Partial<Mesa>) =>
    request<Mesa>(`/mesa/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...mesa, id }),
    }),
  deletar: (id: number) =>
    request<void>(`/mesa/${id}`, {
      method: "DELETE",
    }),
};

export const apiVendas = {
  listarEmAberto: () => request<Venda[]>("/venda/emAberto"),
  listarFechadas: () => request<Venda[]>("/venda/fechadas"),
  listarAPrazo: () => request<Venda[]>("/venda/a-prazo"),
  listarAPrazoPorCliente: (clienteId: number) =>
    request<Venda[]>(`/venda/cliente/${clienteId}/a-prazo`),
  buscarPorId: (id: number) => request<Venda>(`/venda/${id}`),
  salvar: (venda: Partial<Venda>) =>
    request<Venda>("/venda", {
      method: "POST",
      body: JSON.stringify(venda),
    }),
  atualizar: (id: number, venda: Partial<Venda>) =>
    request<Venda>(`/venda/${id}`, {
      method: "PUT",
      body: JSON.stringify(venda),
    }),
  fecharVenda: (id: number) =>
    request<Venda>(`/venda/${id}/fechar`, {
      method: "PUT",
    }),
  receberPagamentoAPrazo: (
    id: number,
    dto: { valorRecebido: number; formaPagamentoReal: string; desconto?: number }
  ) =>
    request<Venda>(`/venda/${id}/receber-a-prazo`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  deletar: (id: number, motivo?: string) =>
    request<void>(`/venda/${id}${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ""}`, {
      method: "DELETE",
    }),
};

export interface ItemPedido {
  id: number;
  produto: Produto;
  quantidade: number;
  total: number;
  statusItem?: string | null;
  motivoCancelamento?: string | null;
  pedido?: Pedido;
  vendaId?: number;
}

export const apiItemPedido = {
  cancelar: (id: number, motivo?: string) =>
    request<void>(`/item-pedido/${id}/cancelar${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ""}`, {
      method: "PUT",
    }),
  deletar: (id: number) =>
    request<void>(`/item-pedido/${id}`, {
      method: "DELETE",
    }),
};

export const apiPedidos = {
  listar: () => request<Pedido[]>("/pedido"),
  buscarItensEmAberto: () => request<ItemPedido[]>("/pedido/itens/abertos"),
  buscarPorId: (id: number) => request<PedidoDTO>(`/pedido/${id}`),
  buscarPorVenda: (vendaId: number) => request<Pedido[]>(`/pedido/venda/${vendaId}`),
  buscarItensPorVenda: (vendaId: number) => request<ItemPedido[]>(`/pedido/venda/${vendaId}/itens`),
  salvarNovo: (vendaId: number, dto: PedidoDTO) =>
    request<PedidoDTO>(`/pedido/novo/${vendaId}`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  atualizar: (id: number, dto: PedidoDTO) =>
    request<PedidoDTO>(`/pedido/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...dto, id }),
    }),
  deletar: (id: number) =>
    request<void>(`/pedido/${id}`, {
      method: "DELETE",
    }),
  cancelarDaComanda: (id: number, motivo?: string) =>
    request<void>(`/pedido/${id}/cancelar${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ""}`, {
      method: "PUT",
    }),
};

export const apiFluxoFinanceiro = {
  listar: () => request<FluxoFinanceiro[]>("/fluxo"),
  buscarPorId: (id: number) => request<FluxoFinanceiro>(`/fluxo/${id}`),
  salvar: (fluxo: Omit<FluxoFinanceiro, "id">) =>
    request<FluxoFinanceiro>("/fluxo", {
      method: "POST",
      body: JSON.stringify(fluxo),
    }),
  atualizar: (id: number, fluxo: Partial<FluxoFinanceiro>) =>
    request<FluxoFinanceiro>(`/fluxo/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...fluxo, id }),
    }),
  deletar: (id: number) =>
    request<void>(`/fluxo/${id}`, {
      method: "DELETE",
    }),
};

export interface PagamentoComanda {
  id?: number;
  venda?: Venda;
  valorPago: number;
  formaPagamento: string;
  tipo?: string;
  totalAntes?: number;
  saldoRestante?: number;
  desconto?: number;
  dataPagamento?: string;
}

export const apiPagamentosComanda = {
  salvar: (pagamento: Partial<PagamentoComanda>) =>
    request<PagamentoComanda>("/pagamentos-comanda", {
      method: "POST",
      body: JSON.stringify(pagamento),
    }),
  listarPorVenda: (vendaId: number) =>
    request<PagamentoComanda[]>(`/pagamentos-comanda/venda/${vendaId}`),
};
