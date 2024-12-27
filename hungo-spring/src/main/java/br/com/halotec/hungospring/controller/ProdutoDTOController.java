//package br.com.halotec.hungospring.controller;
//
//import br.com.halotec.hungospring.dto.ProdutoDTO;
//import br.com.halotec.hungospring.entity.Produto;
//import br.com.halotec.hungospring.service.ProdutoDTOService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@CrossOrigin(origins = "*")
//public class ProdutoDTOController {
//
//    @Autowired
//    private ProdutoDTOService produtoDTOService;
//
//    @PostMapping("/produto")
//    public ResponseEntity<?> cadastrarProduto(@RequestBody ProdutoDTO produtoDTO) {
//        try {
//            Produto produto = produtoDTOService.cadastrarProduto(produtoDTO);
//            return ResponseEntity.status(HttpStatus.CREATED).body(produto);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao cadastrar o produto.");
//        }
//    }
//
//    @PutMapping("produtos/{id}")
//    public ResponseEntity<?> editarProduto(@PathVariable Long id, @RequestBody ProdutoDTO produtoDTO) {
//        try {
//            Produto produto = produtoDTOService.editarProduto(id, produtoDTO);
//            return ResponseEntity.status(HttpStatus.OK).body(produto); // Retorna o produto editado
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao editar o produto.");
//        }
//    }
//
//    @DeleteMapping("produtos/{id}")
//    public ResponseEntity<?> excluirProduto(@PathVariable Long id) {
//        try {
//            produtoDTOService.excluirProduto(id);
//            return ResponseEntity.ok("Produto excluído com sucesso.");
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao excluir o produto: " + e.getMessage());
//        }
//    }
//
//    @GetMapping("/produtos")
//    public Iterable<Produto> listarTodos() {
//        return produtoDTOService.listarTodos();
//    }
//}