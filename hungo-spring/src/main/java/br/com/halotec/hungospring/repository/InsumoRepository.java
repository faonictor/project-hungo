package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Insumo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsumoRepository extends CrudRepository<Insumo, Long> {
}

