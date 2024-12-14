package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Venda;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendaRepository extends CrudRepository<Venda, Long> {
}

