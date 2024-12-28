package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.ProdutoInsumo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoInsumoRepository extends CrudRepository<ProdutoInsumo, Long> {
    void deleteByProduto(Produto produto);
    List<ProdutoInsumo> findByProduto(Produto produto);
}