package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.ComandaExcluida;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComandaExcluidaRepository extends JpaRepository<ComandaExcluida, Long> {
}
