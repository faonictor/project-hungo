import { Pedido, PedidoDTO, Produto, apiPedidos, apiProdutos } from "@/lib/api";
import { toast } from "sonner";

export interface PrintTicketOptions {
  produtosList?: Produto[];
}

export async function printKitchenTicket(
  pedidoInput: Pedido | PedidoDTO | null,
  options?: PrintTicketOptions
): Promise<void> {
  if (!pedidoInput || !pedidoInput.id) return;

  let fullPedido: any = pedidoInput;
  let fullItens: any[] = (pedidoInput as any).itens || [];

  let prods = options?.produtosList || [];
  if (prods.length === 0) {
    try {
      prods = await apiProdutos.listar();
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
    }
  }

  if (!fullItens || fullItens.length === 0) {
    try {
      const dto = await apiPedidos.buscarPorId(pedidoInput.id);
      if (dto && dto.itens) {
        fullItens = dto.itens;
        fullPedido = { ...pedidoInput, ...dto };
      }
    } catch (e) {
      console.error("Erro ao buscar detalhes do pedido para impressão:", e);
    }
  }

  const itensValidos = (fullItens || []).filter(
    (i: any) => String(i.statusItem || "").toUpperCase() !== "CANCELADO"
  );

  const comandaId = fullPedido.venda?.id || fullPedido.vendaId;
  const mesaNome = fullPedido.venda?.mesa?.nome || (fullPedido as any).mesa?.nome;

  let comandaMesaText = "";
  if (comandaId && mesaNome) {
    comandaMesaText = `Comanda #${comandaId} - ${mesaNome}`;
  } else if (comandaId) {
    comandaMesaText = `Comanda #${comandaId}`;
  } else if (mesaNome) {
    comandaMesaText = mesaNome;
  } else {
    comandaMesaText = "Balcão";
  }

  const clienteNome =
    fullPedido.cliente?.nome ||
    fullPedido.venda?.cliente?.nome ||
    fullPedido.venda?.nomeCliente ||
    fullPedido.nomeCliente ||
    "Cliente Balcão";

  const rawTipo = (fullPedido.tipoPedido || "").toUpperCase();
  const canal =
    rawTipo === "DELIVERY" || rawTipo === "ENTREGA"
      ? "Delivery"
      : rawTipo === "RETIRADA" || rawTipo === "BALCAO"
      ? "Retirada"
      : "Consumo Local";

  const dataHora = fullPedido.dataHora
    ? new Date(fullPedido.dataHora).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  const rowsHtml = itensValidos
    .map((item: any) => {
      const prodId = item.produtoId || item.produto?.id;
      const prod = prods.find((p) => p.id === prodId);
      const nomeProd =
        item.produto?.nome ||
        item.nomeProduto ||
        item.nome ||
        prod?.nome ||
        `Produto #${prodId || item.id || ""}`;
      const obsText = item.observacao || item.obs || "";

      return `
        <tr>
          <td class="qtd" style="font-weight:bold; font-size:13px; width:35px;">${item.quantidade || 1}x</td>
          <td>
            <div class="item-name" style="font-weight:bold; font-size:13px;">${nomeProd}</div>
            ${
              obsText
                ? `<div class="obs" style="font-size:11px; font-style:italic; margin-top:2px; padding-left:4px; font-weight:bold;">* Obs: ${obsText}</div>`
                : ""
            }
          </td>
        </tr>
      `;
    })
    .join("");

  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) {
    toast.error("Permita janelas pop-up para imprimir a via de produção.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Via de Produção - Pedido #${fullPedido.id}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            color: #000;
          }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .title { font-size: 16px; font-weight: bold; }
          .subtitle { font-size: 11px; margin-top: 4px; }
          .info { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; font-size: 11px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
          .items-table th { border-bottom: 1px solid #000; text-align: left; font-size: 11px; padding-bottom: 4px; }
          .items-table td { padding: 4px 0; vertical-align: top; border-bottom: 1px dotted #ccc; }
          .footer { text-align: center; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">HUNGO PDV</div>
          <div class="subtitle">*** VIA DE PRODUÇÃO / COZINHA ***</div>
        </div>
        <div class="info">
          <div class="info-row"><strong>PEDIDO #${fullPedido.id}</strong> <span>${dataHora}</span></div>
          <div class="info-row"><strong>Atendimento:</strong> <span>${canal}</span></div>
          <div class="info-row"><strong>Comanda/Mesa:</strong> <span>${comandaMesaText}</span></div>
          <div class="info-row"><strong>Cliente:</strong> <span>${clienteNome}</span></div>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>QTD</th>
              <th>ITEM / OBSERVAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="2" style="text-align:center; padding:10px;">Sem itens a preparar</td></tr>`}
          </tbody>
        </table>
        <div class="footer">
          <p>HUNGO PDV — Impresso em ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
