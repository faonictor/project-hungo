package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.repository.ProdutoInsumoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoInsumoService {

    private final ProdutoInsumoRepository produtoInsumoRepository;

    public ProdutoInsumoService(ProdutoInsumoRepository produtoInsumoRepository) {
        this.produtoInsumoRepository = produtoInsumoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProdutoInsumo> buscarInsumosPorProdutoId(Long produtoId) {
        Produto produto = new Produto();
        produto.setId(produtoId);
        return produtoInsumoRepository.findByProduto(produto);
    }

    @Transactional(readOnly = true)
    public List<ProdutoInsumo> listarTodos() {
        return produtoInsumoRepository.findAll();
    }

    @Transactional
    public ProdutoInsumo salvar(ProdutoInsumo produtoInsumo) {
        return produtoInsumoRepository.save(produtoInsumo);
    }

    @Transactional(readOnly = true)
    public ProdutoInsumo buscarPorId(Long id) {
        return produtoInsumoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ProdutoInsumo não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        if (!produtoInsumoRepository.existsById(id)) {
            throw new EntityNotFoundException("ProdutoInsumo não encontrado com o ID: " + id);
        }
        produtoInsumoRepository.deleteById(id);
    }
}
