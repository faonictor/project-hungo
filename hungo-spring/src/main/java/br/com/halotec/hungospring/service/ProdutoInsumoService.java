package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.repository.ProdutoInsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoInsumoService {
    @Autowired
    private ProdutoInsumoRepository produtoInsumoRepository;

    // Lógica para buscar os insumos de um produto
    public List<ProdutoInsumo> buscarInsumosPorProdutoId(Long produtoId) {
        Produto produto = new Produto();
        produto.setId(produtoId);  // Cria o objeto Produto apenas com o ID
        return produtoInsumoRepository.findByProduto(produto);
    }

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


