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

    // Endpoint para salvar ProdutoDTO
    @PostMapping("/produto")
    public ResponseEntity<Produto> salvarProduto(@RequestBody ProdutoDTO produtoDTO) {
        return produtoService.salvarProduto(produtoDTO);
    }

    // Endpoint para salvar Produto
//    @PostMapping("/produto")
//    public ResponseEntity<Produto> salvar(@RequestBody Produto produto) {
//        return produtoService.salvar(produto);
//    }

    // Listar todos os produtos
    @GetMapping("/produto")
    public Iterable<Produto> listarTodos() {
        return produtoService.listarTodos();
    }

    // Buscar produto por ID
//    @GetMapping("/produto/{id}")
//    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
//        return produtoService.buscarPorId(id);
//    }

    @GetMapping("/produto/{id}")
    public ResponseEntity<ProdutoDTO> buscarProdutoPorId(@PathVariable Long id) {
        return produtoService.buscarProdutoPorId(id);
    }

    // Deletar produto
    @DeleteMapping("/produto/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return produtoService.deletar(id);
    }

    // Atualizar produto
    @PutMapping("/produto/{id}")
    public ResponseEntity<Produto> atualizar(
            @PathVariable Long id,
            @RequestBody Produto produto) {
        produto.setId(id);
        return produtoService.salvar(produto);
    }
}