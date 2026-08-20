package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ProdutoDTO;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.service.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping("/produto")
    public ResponseEntity<Produto> salvarProduto(@RequestBody ProdutoDTO produtoDTO) {
        Produto salvo = produtoService.salvarOuAtualizarProduto(produtoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/produto/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody ProdutoDTO produtoDTO) {
        produtoDTO.setId(id);
        Produto atualizado = produtoService.salvarOuAtualizarProduto(produtoDTO);
        return ResponseEntity.ok(atualizado);
    }

    @GetMapping("/produtos")
    public ResponseEntity<List<Produto>> listarTodos() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/produto/{id}")
    public ResponseEntity<ProdutoDTO> buscarProdutoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarProdutoPorId(id));
    }

    @DeleteMapping("/produto/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.ok().build();
    }
}