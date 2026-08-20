package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
}
