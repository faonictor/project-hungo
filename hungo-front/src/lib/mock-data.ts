export type StatusPedido = "Aberto" | "Em preparo" | "Entregue" | "Cancelado";

export const kpis = [
  { title: "Faturamento do dia", value: "R$ 4.820,00", delta: "+12%", up: true, hint: "vs. ontem" },
  { title: "Pedidos", value: "128", delta: "+8%", up: true, hint: "vs. ontem" },
  { title: "Ticket médio", value: "R$ 37,65", delta: "-3%", up: false, hint: "vs. semana passada" },
  { title: "Mesas ocupadas", value: "14/22", delta: "64%", up: true, hint: "de ocupação" },
];

export const vendasSemana = [
  { dia: "Seg", valor: 3200, pedidos: 88 },
  { dia: "Ter", valor: 2980, pedidos: 79 },
  { dia: "Qua", valor: 3610, pedidos: 96 },
  { dia: "Qui", valor: 4120, pedidos: 108 },
  { dia: "Sex", valor: 5890, pedidos: 152 },
  { dia: "Sáb", valor: 7240, pedidos: 187 },
  { dia: "Dom", valor: 4820, pedidos: 128 },
];

export const canais = [
  { canal: "Consumo Local", valor: 52 },
  { canal: "Delivery", valor: 31 },
  { canal: "Balcão", valor: 17 },
];

export const pedidos = [
  { id: 1042, cliente: "Marina Alves", mesa: "Mesa 04", canal: "Consumo Local", itens: 5, total: 148.9, status: "Em preparo" as StatusPedido, hora: "12:04" },
  { id: 1041, cliente: "Rafael Souza", mesa: "Delivery", canal: "Delivery", itens: 3, total: 89.5, status: "Aberto" as StatusPedido, hora: "11:58" },
  { id: 1040, cliente: "Bruna Lima", mesa: "Mesa 12", canal: "Consumo Local", itens: 7, total: 231.0, status: "Entregue" as StatusPedido, hora: "11:41" },
  { id: 1039, cliente: "Carlos Dias", mesa: "Balcão", canal: "Balcão", itens: 2, total: 42.0, status: "Entregue" as StatusPedido, hora: "11:30" },
  { id: 1038, cliente: "Juliana Reis", mesa: "Mesa 07", canal: "Consumo Local", itens: 4, total: 117.4, status: "Cancelado" as StatusPedido, hora: "11:12" },
  { id: 1037, cliente: "Pedro Nunes", mesa: "Delivery", canal: "Delivery", itens: 6, total: 176.2, status: "Em preparo" as StatusPedido, hora: "10:58" },
];

export const vendasAbertas = [
  { id: 318, mesa: "Mesa 04", garcom: "Léo", abertura: "11:50", itens: 5, total: 148.9 },
  { id: 317, mesa: "Mesa 09", garcom: "Ana", abertura: "11:32", itens: 8, total: 264.3 },
  { id: 316, mesa: "Mesa 12", garcom: "Léo", abertura: "11:05", itens: 7, total: 231.0 },
  { id: 315, mesa: "Balcão", garcom: "Rita", abertura: "10:47", itens: 2, total: 42.0 },
];

export const vendasFechadas = [
  { id: 312, mesa: "Mesa 02", pagamento: "Cartão de crédito", fechamento: "10:22", itens: 4, total: 132.5 },
  { id: 311, mesa: "Mesa 15", pagamento: "Pix", fechamento: "10:04", itens: 3, total: 78.9 },
  { id: 310, mesa: "Delivery", pagamento: "Dinheiro", fechamento: "09:51", itens: 6, total: 189.4 },
  { id: 309, mesa: "Mesa 08", pagamento: "Pix", fechamento: "09:30", itens: 2, total: 54.0 },
];

export const produtos = [
  { id: 1, nome: "Picanha na chapa", categoria: "Pratos principais", preco: 89.9, custo: 41.2, estoque: 24, ativo: true },
  { id: 2, nome: "Moqueca de camarão", categoria: "Pratos principais", preco: 78.0, custo: 36.4, estoque: 12, ativo: true },
  { id: 3, nome: "Bruschetta artesanal", categoria: "Entradas", preco: 28.5, custo: 9.8, estoque: 40, ativo: true },
  { id: 4, nome: "Pudim da casa", categoria: "Sobremesas", preco: 19.9, custo: 5.1, estoque: 8, ativo: true },
  { id: 5, nome: "Suco de caju", categoria: "Bebidas", preco: 12.0, custo: 3.2, estoque: 60, ativo: true },
  { id: 6, nome: "Risoto de funghi", categoria: "Pratos principais", preco: 68.0, custo: 30.0, estoque: 0, ativo: false },
];

export const categorias = [
  { id: 1, nome: "Entradas", descricao: "Petiscos e couvert", produtos: 9 },
  { id: 2, nome: "Pratos principais", descricao: "Carnes, massas e peixes", produtos: 24 },
  { id: 3, nome: "Sobremesas", descricao: "Doces e sorvetes", produtos: 7 },
  { id: 4, nome: "Bebidas", descricao: "Sucos, drinks e cervejas", produtos: 18 },
];

export const insumos = [
  { id: 1, nome: "Picanha bovina", unidade: "kg", estoque: 18, minimo: 10, custo: 74.9 },
  { id: 2, nome: "Camarão limpo", unidade: "kg", estoque: 6, minimo: 8, custo: 92.0 },
  { id: 3, nome: "Arroz arbóreo", unidade: "kg", estoque: 32, minimo: 15, custo: 21.5 },
  { id: 4, nome: "Leite condensado", unidade: "un", estoque: 4, minimo: 12, custo: 7.9 },
  { id: 5, nome: "Caju polpa", unidade: "kg", estoque: 25, minimo: 10, custo: 14.3 },
];

export const clientes = [
  { id: 1, nome: "Marina Alves", telefone: "(85) 99812-4410", email: "marina@email.com", cidade: "Fortaleza", pedidos: 32, ultima: "Hoje" },
  { id: 2, nome: "Rafael Souza", telefone: "(85) 99741-2093", email: "rafael@email.com", cidade: "Fortaleza", pedidos: 18, ultima: "Hoje" },
  { id: 3, nome: "Bruna Lima", telefone: "(85) 99655-7781", email: "bruna@email.com", cidade: "Eusébio", pedidos: 44, ultima: "Ontem" },
  { id: 4, nome: "Carlos Dias", telefone: "(85) 99500-1122", email: "carlos@email.com", cidade: "Caucaia", pedidos: 7, ultima: "3 dias" },
  { id: 5, nome: "Juliana Reis", telefone: "(85) 99432-8890", email: "juliana@email.com", cidade: "Fortaleza", pedidos: 21, ultima: "5 dias" },
];

export const fluxo = [
  { id: 1, descricao: "Vendas do turno da noite", tipo: "Entrada" as const, categoria: "Vendas", data: "12/08/2026", valor: 4820.0 },
  { id: 2, descricao: "Compra de hortifruti", tipo: "Saída" as const, categoria: "Insumos", data: "12/08/2026", valor: 612.35 },
  { id: 3, descricao: "Pagamento de fornecedor", tipo: "Saída" as const, categoria: "Fornecedores", data: "11/08/2026", valor: 1890.0 },
  { id: 4, descricao: "Vendas delivery", tipo: "Entrada" as const, categoria: "Vendas", data: "11/08/2026", valor: 2310.7 },
  { id: 5, descricao: "Energia elétrica", tipo: "Saída" as const, categoria: "Despesas fixas", data: "10/08/2026", valor: 1450.0 },
];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
