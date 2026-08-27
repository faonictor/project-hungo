package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.repository.ItemPedidoRepository;
import br.com.halotec.hungospring.repository.ProdutoRepository;
import br.com.halotec.hungospring.repository.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
public class ItemPedidoService {

    private final ItemPedidoRepository itemPedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final VendaRepository vendaRepository;

    public ItemPedidoService(
            ItemPedidoRepository itemPedidoRepository,
            ProdutoRepository produtoRepository,
            VendaRepository vendaRepository
    ) {
        this.itemPedidoRepository = itemPedidoRepository;
        this.produtoRepository = produtoRepository;
        this.vendaRepository = vendaRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemPedido> listarTodos() {
        return itemPedidoRepository.findAll();
    }

    @Transactional
    public ItemPedido salvar(ItemPedido itemPedido) {
        if (itemPedido.getProduto() == null || itemPedido.getProduto().getId() == null) {
            throw new IllegalArgumentException("Produto e ID do Produto são obrigatórios");
        }
        Long produtoId = Objects.requireNonNull(itemPedido.getProduto().getId());
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + produtoId));

        int qtd = itemPedido.getQuantidade() != null && itemPedido.getQuantidade() > 0 ? itemPedido.getQuantidade() : 1;
        itemPedido.setQuantidade(qtd);
        itemPedido.setTotal(produto.getPreco().multiply(BigDecimal.valueOf(qtd)));
        ItemPedido salvo = itemPedidoRepository.save(itemPedido);

        if (salvo.getPedido() != null && salvo.getPedido().getVenda() != null && salvo.getPedido().getVenda().getId() != null) {
            atualizarTotalVenda(salvo.getPedido().getVenda().getId());
        }
        return salvo;
    }

    @Transactional(readOnly = true)
    public ItemPedido buscarPorId(Long id) {
        return itemPedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ItemPedido não encontrado com o ID: " + id));
    }

    @Transactional
    public void cancelarItem(Long id, @Nullable String motivo) {
        ItemPedido item = itemPedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ItemPedido não encontrado com o ID: " + id));

        if (item.getPedido() != null) {
            String status = item.getPedido().getStatusPedido();
            if ("Concluído".equalsIgnoreCase(status) || "Concluido".equalsIgnoreCase(status)) {
                throw new IllegalStateException("Pedidos concluídos não podem ter itens cancelados.");
            }
        }
        item.setStatusItem("Cancelado");
        if (motivo != null && !motivo.trim().isEmpty()) {
            item.setMotivoCancelamento(motivo.trim());
        }
        itemPedidoRepository.save(item);

        if (item.getPedido() != null && item.getPedido().getVenda() != null && item.getPedido().getVenda().getId() != null) {
            atualizarTotalVenda(item.getPedido().getVenda().getId());
        }
    }

    @Transactional
    public void deletar(Long id) {
        ItemPedido item = itemPedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ItemPedido não encontrado com o ID: " + id));

        if (item.getPedido() != null) {
            String status = item.getPedido().getStatusPedido();
            if ("Concluído".equalsIgnoreCase(status) || "Concluido".equalsIgnoreCase(status)) {
                throw new IllegalStateException("Pedidos concluídos não podem ter itens removidos.");
            }
        }
        Long vendaId = (item.getPedido() != null && item.getPedido().getVenda() != null) ? item.getPedido().getVenda().getId() : null;
        itemPedidoRepository.delete(item);

        if (vendaId != null) {
            atualizarTotalVenda(vendaId);
        }
    }

    public void atualizarTotalVenda(Long vendaId) {
        if (vendaId == null) return;
        Venda venda = vendaRepository.findById(vendaId).orElse(null);
        if (venda != null) {
            BigDecimal totalItens = itemPedidoRepository.somarTotalPorVendaId(vendaId);
            if (totalItens == null) totalItens = BigDecimal.ZERO;
            BigDecimal taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : BigDecimal.ZERO;
            BigDecimal valorPago = venda.getValorPago() != null ? venda.getValorPago() : BigDecimal.ZERO;
            BigDecimal desconto = venda.getDesconto() != null ? venda.getDesconto() : BigDecimal.ZERO;

            BigDecimal totalConsumido = totalItens.add(taxa);
            BigDecimal saldo = totalConsumido.subtract(valorPago).subtract(desconto);
            venda.setTotal(saldo.compareTo(BigDecimal.ZERO) > 0 ? saldo : BigDecimal.ZERO);
            vendaRepository.save(venda);
        }
    }
}
