package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.repository.ItemPedidoRepository;
import br.com.halotec.hungospring.repository.ProdutoRepository;
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

    public Iterable<ItemPedido> listarTodos() {
        return itemPedidoRepository.findAll();
    }

    public ResponseEntity<ItemPedido> salvar(ItemPedido itemPedido) {
        Produto produto = produtoRepository.findById(itemPedido.getProduto().getId()).get();
        itemPedido.setTotal(itemPedido.getQuantidade() * produto.getPreco());
        return new ResponseEntity<>(itemPedidoRepository.save(itemPedido), HttpStatus.OK);
    }

    public ResponseEntity<ItemPedido> buscarPorId(Long id) {
        return new ResponseEntity<>(itemPedidoRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        itemPedidoRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Item Removido com Sucesso\"}", HttpStatus.OK);
    }
}


