package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Funcionario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends CrudRepository<Funcionario, Long> {
}

