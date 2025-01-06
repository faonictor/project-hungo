package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.Pedido;
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

    @PostMapping("/pedido/novo/{vendaId}")
    public ResponseEntity<PedidoDTO> salvar(@PathVariable Long vendaId, @RequestBody PedidoDTO pedidoDTO) {
       return pedidoService.salvar(vendaId, pedidoDTO);
    }

    // Endpoint para atualizar um pedido existente
    @PutMapping("/pedido/{id}")
    public ResponseEntity<PedidoDTO> atualizar(@PathVariable Long id, @RequestBody PedidoDTO pedidoDTO) {
        pedidoDTO.setId(id);  // Atualiza o ID do pedido com o valor passado na URL
        return pedidoService.salvar(id, pedidoDTO);
    }

    // Endpoint para listar todos os pedidos
    @GetMapping("/pedido")
    public Iterable<Pedido> listarTodos() {
        return pedidoService.listarTodos();
    }

    // Endpoint para buscar um pedido pelo ID
    @GetMapping("/pedido/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id);
    }

    // Endpoint para deletar um pedido
    @DeleteMapping("/pedido/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return pedidoService.deletar(id);
    }

    // Endpoint para buscar pedidos por vendaId
    @GetMapping("/pedido/venda/{vendaId}")
    public List<Pedido> getPedidosByVenda(@PathVariable Long vendaId) {
        return pedidoService.buscarPedidosPorVenda(vendaId);
    }
}
