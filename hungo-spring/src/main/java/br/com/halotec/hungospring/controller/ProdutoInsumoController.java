package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.service.ProdutoInsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class ProdutoInsumoController {

    @Autowired
    private ProdutoInsumoService produtoInsumoService;

    @PostMapping("/produto-insumo")
    public ResponseEntity<ProdutoInsumo> salvar(@RequestBody ProdutoInsumo produtoInsumo) {
        return produtoInsumoService.salvar(produtoInsumo);
    }

    @GetMapping("/produto-insumo")
    public Iterable<ProdutoInsumo> listarTodos() {
        return produtoInsumoService.listarTodos();
    }

    @GetMapping("/produto-insumo/{id}")
    public ResponseEntity<ProdutoInsumo> buscarPorId(@PathVariable Long id) {
        return produtoInsumoService.buscarPorId(id);
    }

    @DeleteMapping("/produto-insumo/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return produtoInsumoService.deletar(id);
    }

    @PutMapping("/produto-insumo/{id}")
    public ResponseEntity<ProdutoInsumo> atualizar(
            @PathVariable Long id,
            @RequestBody ProdutoInsumo produtoInsumo) {
        produtoInsumo.setId(id);
        return produtoInsumoService.salvar(produtoInsumo);
    }
}
