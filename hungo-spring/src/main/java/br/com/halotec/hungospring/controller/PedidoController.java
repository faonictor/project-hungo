package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/pedido")
    public ResponseEntity<Pedido> salvar(@RequestBody Pedido pedido) {
        return pedidoService.salvar(pedido);
    }

    @GetMapping("/pedido")
    public Iterable<Pedido> listarTodos() {
        return pedidoService.listarTodos();
    }

    @GetMapping("/pedido/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    @DeleteMapping("/pedido/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return pedidoService.deletar(id);
    }

    @PutMapping("/pedido/{id}")
    public ResponseEntity<Pedido> atualizar(@PathVariable Long id, @RequestBody Pedido pedido) {
        pedido.setId(id);
        return pedidoService.salvar(pedido);
    }
}
