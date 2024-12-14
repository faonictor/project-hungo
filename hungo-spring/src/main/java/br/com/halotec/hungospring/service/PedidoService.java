package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;

    public Iterable<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public ResponseEntity<Pedido> salvar(Pedido pedido) {
        return new ResponseEntity<>(pedidoRepository.save(pedido), HttpStatus.OK);
    }

    public ResponseEntity<Pedido> buscarPorId(Long id) {
        return new ResponseEntity<>(pedidoRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        pedidoRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Pedido Removido com Sucesso\"}", HttpStatus.OK);
    }
}
