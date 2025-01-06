package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "*")
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/pedido")
    public ResponseEntity<PedidoDTO> salvar(@RequestBody PedidoDTO pedidoDTO) {
        return pedidoService.salvar(pedidoDTO);
    }

    @PutMapping("/pedido/{id}")
    public ResponseEntity<PedidoDTO> atualizar(@PathVariable Long id, @RequestBody PedidoDTO pedidoDTO) {
        pedidoDTO.setId(id);
        return pedidoService.salvar(pedidoDTO);
    }

    @GetMapping("/pedido")
    public Iterable<Pedido> listarTodos() {
        return pedidoService.listarTodos();
    }

    @GetMapping("/pedido/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id);
    }

    @DeleteMapping("/pedido/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return pedidoService.deletar(id);
    }

    @GetMapping("/pedido/venda/{vendaId}")
    public List<Pedido> getPedidosByVenda(@PathVariable Long vendaId) {
        return pedidoService.buscarPedidosPorVenda(vendaId);
    }
}
