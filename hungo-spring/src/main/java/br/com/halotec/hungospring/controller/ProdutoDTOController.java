package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ProdutoDTO;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.service.ProdutoDTOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/produtodto")
@CrossOrigin(origins = "*")
public class ProdutoDTOController {

    @Autowired
    private ProdutoDTOService produtoService;

    @PostMapping
    public ResponseEntity<?> cadastrarProduto(@RequestBody ProdutoDTO produtoDTO) {
        try {
            Produto produto = produtoService.cadastrarProduto(produtoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(produto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao cadastrar o produto.");
        }
    }
}

