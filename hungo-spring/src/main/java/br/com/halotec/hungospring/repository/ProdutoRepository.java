package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}