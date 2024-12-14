package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Produto;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends CrudRepository<Produto,Long> {
}