package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.service.ProdutoInsumoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProdutoInsumoController {

    private final ProdutoInsumoService produtoInsumoService;

    public ProdutoInsumoController(ProdutoInsumoService produtoInsumoService) {
        this.produtoInsumoService = produtoInsumoService;
    }

    @PostMapping("/produto-insumo")
    public ResponseEntity<ProdutoInsumo> salvar(@RequestBody ProdutoInsumo produtoInsumo) {
        ProdutoInsumo salvo = produtoInsumoService.salvar(produtoInsumo);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping("/produto-insumo/{id}")
    public ResponseEntity<ProdutoInsumo> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoInsumoService.buscarPorId(id));
    }

    @GetMapping("/produto-insumo")
    public ResponseEntity<List<ProdutoInsumo>> buscarInsumosPorProdutoId(@RequestParam Long produtoId) {
        List<ProdutoInsumo> produtoInsumos = produtoInsumoService.buscarInsumosPorProdutoId(produtoId);
        return ResponseEntity.ok(produtoInsumos);
    }

    @DeleteMapping("/produto-insumo/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        produtoInsumoService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/produto-insumo/{id}")
    public ResponseEntity<ProdutoInsumo> atualizar(
            @PathVariable Long id,
            @RequestBody ProdutoInsumo produtoInsumo) {
        produtoInsumo.setId(id);
        return ResponseEntity.ok(produtoInsumoService.salvar(produtoInsumo));
    }
}
