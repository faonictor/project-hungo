package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.service.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/pedido/novo/{vendaId}")
    public ResponseEntity<PedidoDTO> salvarNovoPedido(
            @PathVariable Long vendaId,
            @RequestBody PedidoDTO pedidoDTO) {
        PedidoDTO salvo = pedidoService.salvar(vendaId, pedidoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping("/pedido")
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/pedido/{id}")
    public ResponseEntity<PedidoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPedidoComItens(id));
    }

    @GetMapping("/pedido/venda/{vendaId}")
    public ResponseEntity<List<Pedido>> buscarPedidosPorVenda(@PathVariable Long vendaId) {
        return ResponseEntity.ok(pedidoService.buscarPedidosPorVenda(vendaId));
    }

    @GetMapping("/pedido/venda/{vendaId}/itens")
    public ResponseEntity<List<ItemPedido>> buscarItensPorVenda(@PathVariable Long vendaId) {
        return ResponseEntity.ok(pedidoService.buscarItensPorVenda(vendaId));
    }

    @GetMapping("/pedido/itens/abertos")
    public ResponseEntity<List<ItemPedido>> buscarTodosItensVendasEmAberto() {
        return ResponseEntity.ok(pedidoService.buscarTodosItensVendasEmAberto());
    }

    @PutMapping("/pedido/{id}")
    public ResponseEntity<PedidoDTO> atualizar(
            @PathVariable Long id,
            @RequestBody PedidoDTO pedidoDTO) {
        return ResponseEntity.ok(pedidoService.atualizar(id, pedidoDTO));
    }

    @DeleteMapping("/pedido/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        pedidoService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = {"/pedido/{id}/cancelar", "/pedido/cancelar/{id}"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Void> cancelarPedidoDaComanda(
            @PathVariable Long id,
            @RequestParam(required = false) @Nullable String motivo) {
        pedidoService.cancelarPedidoDaComanda(id, motivo);
        return ResponseEntity.ok().build();
    }
}