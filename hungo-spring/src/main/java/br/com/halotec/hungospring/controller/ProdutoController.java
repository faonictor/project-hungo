package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ProdutoDTO;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @PostMapping("/produto")
    public ResponseEntity<Produto> salvarProduto(@RequestBody ProdutoDTO produtoDTO) {
        return produtoService.salvarOuAtualizarProduto(produtoDTO);
    }

    @PutMapping("/produto/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody ProdutoDTO produtoDTO) {
        produtoDTO.setId(id);
        return produtoService.salvarOuAtualizarProduto(produtoDTO);
    }

    // Listar todos os produtos
    @GetMapping("/produtos")
    public Iterable<Produto> listarTodos() {
        return produtoService.listarTodos();
    }

    @GetMapping("/produto/{id}")
    public ResponseEntity<ProdutoDTO> buscarProdutoPorId(@PathVariable Long id) {
        return produtoService.buscarProdutoPorId(id);
    }

    @DeleteMapping("/produto/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return produtoService.deletar(id);
    }
}