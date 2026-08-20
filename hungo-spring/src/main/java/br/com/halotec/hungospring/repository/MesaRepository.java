package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MesaRepository extends JpaRepository<Mesa, Long> {
    List<Mesa> findByStatus(Boolean status);
}
