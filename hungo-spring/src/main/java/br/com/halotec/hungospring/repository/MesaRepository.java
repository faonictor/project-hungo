package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Mesa;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MesaRepository extends CrudRepository<Mesa, Long> {
    List<Mesa> findByStatus(Boolean status);
}

