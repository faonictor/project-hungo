package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.service.ItemPedidoService;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ItemPedidoController {

    private final ItemPedidoService itemPedidoService;

    public ItemPedidoController(ItemPedidoService itemPedidoService) {
        this.itemPedidoService = itemPedidoService;
    }

    @PostMapping("/item-pedido")
    public ResponseEntity<ItemPedido> salvar(@RequestBody ItemPedido itemPedido) {
        ItemPedido salvo = itemPedidoService.salvar(itemPedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping("/item-pedido")
    public ResponseEntity<List<ItemPedido>> listarTodos() {
        return ResponseEntity.ok(itemPedidoService.listarTodos());
    }

    @GetMapping("/item-pedido/{id}")
    public ResponseEntity<ItemPedido> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(itemPedidoService.buscarPorId(id));
    }

    @DeleteMapping("/item-pedido/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        itemPedidoService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = {"/item-pedido/{id}/cancelar", "/item-pedido/cancelar/{id}"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Void> cancelarItem(
            @PathVariable Long id,
            @RequestParam(required = false) @Nullable String motivo) {
        itemPedidoService.cancelarItem(id, motivo);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/item-pedido/{id}")
    public ResponseEntity<ItemPedido> atualizar(
            @PathVariable Long id,
            @RequestBody ItemPedido itemPedido) {
        itemPedido.setId(id);
        return ResponseEntity.ok(itemPedidoService.salvar(itemPedido));
    }
}
