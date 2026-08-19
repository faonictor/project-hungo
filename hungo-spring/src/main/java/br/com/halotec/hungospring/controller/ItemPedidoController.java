package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.service.ItemPedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ItemPedidoController {

    @Autowired
    private ItemPedidoService itemPedidoService;

    @PostMapping("/item-pedido")
    public ResponseEntity<ItemPedido> salvar(@RequestBody ItemPedido itemPedido) {
        return itemPedidoService.salvar(itemPedido);
    }

    @GetMapping("/item-pedido")
    public Iterable<ItemPedido> listarTodos() {
        return itemPedidoService.listarTodos();
    }

    @GetMapping("/item-pedido/{id}")
    public ResponseEntity<ItemPedido> buscarPorId(@PathVariable Long id) {
        return itemPedidoService.buscarPorId(id);
    }

    @DeleteMapping("/item-pedido/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return itemPedidoService.deletar(id);
    }

    @RequestMapping(value = {"/item-pedido/{id}/cancelar", "/item-pedido/cancelar/{id}"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Void> cancelarItem(
            @PathVariable Long id,
            @RequestParam(required = false) String motivo) {
        return itemPedidoService.cancelarItem(id, motivo);
    }

    @PutMapping("/item-pedido/{id}")
    public ResponseEntity<ItemPedido> atualizar(
            @PathVariable Long id,
            @RequestBody ItemPedido itemPedido) {
        itemPedido.setId(id);
        return itemPedidoService.salvar(itemPedido);
    }

}
