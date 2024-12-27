package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ProdutoDTO;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.service.ProdutoService;
import br.com.halotec.hungospring.service.ProdutoDTOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private ProdutoDTOService produtoDTOService;

    // Cadastro de Produto
    @PostMapping("/produto")
    public ResponseEntity<?> cadastrarProduto(@RequestBody ProdutoDTO produtoDTO) {
        try {
            Produto produto = produtoDTOService.cadastrarProduto(produtoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(produto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao cadastrar o produto.");
        }
    }

    // Listar todos os Produtos
    @GetMapping("/produtos")
    public Iterable<Produto> listarTodos() {
        return produtoService.listarTodos();
    }

    // Buscar Produto por ID
    @GetMapping("/produto/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return produtoService.buscarPorId(id);
    }

    // Editar Produto
    @PutMapping("/produto/{id}")
    public ResponseEntity<?> editarProduto(@PathVariable Long id, @RequestBody ProdutoDTO produtoDTO) {
        try {
            Produto produto = produtoDTOService.editarProduto(id, produtoDTO);
            return ResponseEntity.status(HttpStatus.OK).body(produto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao editar o produto.");
        }
    }

    // Excluir Produto
    @DeleteMapping("/produto/{id}")
    public ResponseEntity<?> excluirProduto(@PathVariable Long id) {
        try {
            produtoDTOService.excluirProduto(id);
            return ResponseEntity.ok("Produto excluído com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao excluir o produto: " + e.getMessage());
        }
    }
}