package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.repository.ItemPedidoRepository;
import br.com.halotec.hungospring.repository.ProdutoRepository;
import br.com.halotec.hungospring.repository.VendaRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ItemPedidoService {
    @Autowired
    private ItemPedidoRepository itemPedidoRepository;
    @Autowired
    private ProdutoRepository produtoRepository;
    @Autowired
    private VendaRepository vendaRepository;

    public Iterable<ItemPedido> listarTodos() {
        return itemPedidoRepository.findAll();
    }

    public ResponseEntity<ItemPedido> salvar(ItemPedido itemPedido) {
        Produto produto = produtoRepository.findById(itemPedido.getProduto().getId()).get();
        itemPedido.setTotal(itemPedido.getQuantidade() * produto.getPreco());
        ItemPedido salvo = itemPedidoRepository.save(itemPedido);
        if (salvo.getPedido() != null && salvo.getPedido().getVenda() != null) {
            atualizarTotalVenda(salvo.getPedido().getVenda().getId());
        }
        return new ResponseEntity<>(salvo, HttpStatus.OK);
    }

    public ResponseEntity<ItemPedido> buscarPorId(Long id) {
        return new ResponseEntity<>(itemPedidoRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<Void> cancelarItem(Long id, String motivo) {
        ItemPedido item = itemPedidoRepository.findById(id).orElse(null);
        if (item != null) {
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

            if (item.getPedido() != null && item.getPedido().getVenda() != null) {
                atualizarTotalVenda(item.getPedido().getVenda().getId());
            }
        }
        return ResponseEntity.ok().build();
    }

    @Transactional
    public ResponseEntity deletar(Long id) {
        ItemPedido item = itemPedidoRepository.findById(id).orElse(null);
        if (item != null) {
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
        return new ResponseEntity("{\"mensagem\":\"Item Removido com Sucesso\"}", HttpStatus.OK);
    }

    private void atualizarTotalVenda(Long vendaId) {
        if (vendaId == null) return;
        Venda venda = vendaRepository.findById(vendaId).orElse(null);
        if (venda != null) {
            Float totalItens = itemPedidoRepository.somarTotalPorVendaId(vendaId);
            float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
            float valorPago = venda.getValorPago() != null ? venda.getValorPago() : 0.0f;
            float totalConsumido = (totalItens != null ? totalItens : 0.0f) + taxa;
            venda.setTotal(Math.max(0.0f, totalConsumido - valorPago));
            vendaRepository.save(venda);
        }
    }
}


