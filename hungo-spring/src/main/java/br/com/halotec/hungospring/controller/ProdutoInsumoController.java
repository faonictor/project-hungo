package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.service.ProdutoInsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/produto-insumo")
public class ProdutoInsumoController {

    @Autowired
    private ProdutoInsumoService produtoInsumoService;

    @PostMapping
    public ResponseEntity<ProdutoInsumo> salvar(@RequestBody ProdutoInsumo produtoInsumo) {
        return produtoInsumoService.salvar(produtoInsumo);
    }

    @GetMapping
    public Iterable<ProdutoInsumo> listarTodos() {
        return produtoInsumoService.listarTodos();
    }
}

