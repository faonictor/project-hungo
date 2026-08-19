package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Categoria;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaRepository extends CrudRepository<Categoria, Long> {
    Optional<Categoria> findByNomeIgnoreCase(String nome);
}
