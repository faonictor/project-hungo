package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/pedido/novo/{vendaId}")
    public ResponseEntity<PedidoDTO> salvar(@PathVariable Long vendaId, @RequestBody PedidoDTO pedidoDTO) {
       return pedidoService.salvar(vendaId, pedidoDTO);
    }

    @PutMapping("/pedido/{id}")
    public ResponseEntity<PedidoDTO> atualizar(@PathVariable Long id, @RequestBody PedidoDTO pedidoDTO) {
        pedidoDTO.setId(id);
        return pedidoService.atualizar(id, pedidoDTO);
    }

    @GetMapping("/pedido")
    public Iterable<Pedido> listarTodos() {
        return pedidoService.listarTodos();
    }

    @DeleteMapping("/pedido/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return pedidoService.deletar(id);
    }

    @PutMapping("/pedido/{id}/cancelar")
    public ResponseEntity<Void> cancelarPedidoDaComanda(
            @PathVariable Long id,
            @RequestParam(required = false) String motivo) {
        return pedidoService.cancelarPedidoDaComanda(id, motivo);
    }

    @GetMapping("/pedido/venda/{vendaId}")
    public List<Pedido> getPedidosByVenda(@PathVariable Long vendaId) {
        return pedidoService.buscarPedidosPorVenda(vendaId);
    }

    @GetMapping("/pedido/venda/{vendaId}/itens")
    public List<ItemPedido> getItensByVenda(@PathVariable Long vendaId) {
        return pedidoService.buscarItensPorVenda(vendaId);
    }

    @GetMapping("/pedido/itens/abertos")
    public List<ItemPedido> getItensVendasEmAberto() {
        return pedidoService.buscarTodosItensVendasEmAberto();
    }

    @GetMapping("/pedido/{id}")
    public ResponseEntity<PedidoDTO> buscarPedidoPorId(@PathVariable Long id) {
        try {
            PedidoDTO pedidoDTO = pedidoService.buscarPedidoComItens(id);
            return ResponseEntity.ok(pedidoDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}