package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Endereco;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnderecoRepository extends CrudRepository<Endereco, Long> {
    
    List<Endereco> findByClienteId(Long clienteId);
}



