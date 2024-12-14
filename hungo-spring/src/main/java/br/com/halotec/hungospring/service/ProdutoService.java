package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ProdutoService {
    @Autowired
    private ProdutoRepository produtoRepository;

    public Iterable<Produto> listarTodos (){
        return produtoRepository.findAll();
    }

    public ResponseEntity<Produto> salvar (Produto produto){
        return new ResponseEntity<Produto>(produtoRepository.save(produto), HttpStatus.OK);
    }

    public ResponseEntity<Produto> buscarPorId(Long id) {
        return new ResponseEntity<Produto>(produtoRepository.findById(id).orElseThrow(),HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        produtoRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Produto Removido com Sucesso\"}",HttpStatus.OK);
    }
}
