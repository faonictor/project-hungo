package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ItemPedidoDTO;
import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.service.ItemPedidoService;
import br.com.halotec.hungospring.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;
    @Autowired
    private ItemPedidoService itemPedidoService;

    @PostMapping("/pedido/novo/{vendaId}")
    public ResponseEntity<PedidoDTO> salvar(@PathVariable Long vendaId, @RequestBody PedidoDTO pedidoDTO) {
       return pedidoService.salvar(vendaId, pedidoDTO);
    }

    @PutMapping("/pedido/{id}")
    public ResponseEntity<PedidoDTO> atualizar(@PathVariable Long id, @RequestBody PedidoDTO pedidoDTO) {
        pedidoDTO.setId(id);
        return pedidoService.atualizar(id, pedidoDTO);
    }

    // Endpoint para listar todos os pedidos
    @GetMapping("/pedido")
    public Iterable<Pedido> listarTodos() {
        return pedidoService.listarTodos();
    }

//    // Endpoint para buscar um pedido pelo ID
//    @GetMapping("/pedido/{id}")
//    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
//        return pedidoService.buscarPorId(id);
//    }

//    @GetMapping("pedido/{id}/itens")
//    public ResponseEntity<List<ItemPedidoDTO>> buscarItensPorPedido(@PathVariable Long id) {
//        List<ItemPedidoDTO> itens = pedidoService.buscarItensPorPedido(id);
//        if (itens.isEmpty()) {
//            return ResponseEntity.noContent().build();
//        }
//        return ResponseEntity.ok(itens);
//    }

    @DeleteMapping("/pedido/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return pedidoService.deletar(id);
    }

    @GetMapping("/pedido/venda/{vendaId}")
    public List<Pedido> getPedidosByVenda(@PathVariable Long vendaId) {
        return pedidoService.buscarPedidosPorVenda(vendaId);
    }

    @GetMapping("pedido/{id}")
    public ResponseEntity<PedidoDTO> buscarPedidoPorId(@PathVariable Long id) {
        try {
            PedidoDTO pedidoDTO = pedidoService.buscarPedidoComItens(id);
            return ResponseEntity.ok(pedidoDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
