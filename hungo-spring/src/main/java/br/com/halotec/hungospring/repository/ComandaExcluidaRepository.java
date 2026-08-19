package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.ComandaExcluida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComandaExcluidaRepository extends JpaRepository<ComandaExcluida, Long> {
}
