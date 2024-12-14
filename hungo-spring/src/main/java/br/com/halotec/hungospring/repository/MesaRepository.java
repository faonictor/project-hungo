package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Mesa;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MesaRepository extends CrudRepository<Mesa, Long> {
}

