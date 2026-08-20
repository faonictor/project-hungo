package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsumoRepository extends JpaRepository<Insumo, Long> {
}
