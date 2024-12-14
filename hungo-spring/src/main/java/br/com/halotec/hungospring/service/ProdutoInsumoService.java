package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.repository.ProdutoInsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ProdutoInsumoService {
    @Autowired
    private ProdutoInsumoRepository produtoInsumoRepository;

    public Iterable<ProdutoInsumo> listarTodos() {
        return produtoInsumoRepository.findAll();
    }

    public ResponseEntity<ProdutoInsumo> salvar(ProdutoInsumo produtoInsumo) {
        return new ResponseEntity<>(produtoInsumoRepository.save(produtoInsumo), HttpStatus.OK);
    }

    public ResponseEntity<ProdutoInsumo> buscarPorId(Long id) {
        return new ResponseEntity<>(produtoInsumoRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        produtoInsumoRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Removido com Sucesso\"}", HttpStatus.OK);
    }
}


