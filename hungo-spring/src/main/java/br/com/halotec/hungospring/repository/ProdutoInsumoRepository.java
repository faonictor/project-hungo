package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.ProdutoInsumo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoInsumoRepository extends JpaRepository<ProdutoInsumo, Long> {
    void deleteByProduto(Produto produto);
    List<ProdutoInsumo> findByProduto(Produto produto);
}