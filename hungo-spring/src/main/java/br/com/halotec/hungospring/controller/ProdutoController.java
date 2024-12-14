package br.com.halotec.hungospring.controller;

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
    public ResponseEntity<Produto> salvar (@RequestBody Produto produto){
        return produtoService.salvar(produto);
    }

    @GetMapping("/produto")
    public Iterable<Produto> listarTodos (){
        return produtoService.listarTodos();
    }

    @GetMapping("/produto/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id){
        return produtoService.buscarPorId(id);
    }

    @DeleteMapping("/produto/{id}")
    public ResponseEntity deletar(@PathVariable Long id){
        return produtoService.deletar(id);
    }

    @PutMapping("/produto/{id}")
    public ResponseEntity<Produto> atualizar(
            @PathVariable Long id,
            @RequestBody Produto produto){
        produto.setId(id);
        return produtoService.salvar(produto);
    }
}
