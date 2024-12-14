package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.ProdutoInsumo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoInsumoRepository extends CrudRepository<ProdutoInsumo, Long> {
}