package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
