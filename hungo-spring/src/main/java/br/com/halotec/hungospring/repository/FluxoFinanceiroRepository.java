package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.FluxoFinanceiro;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FluxoFinanceiroRepository extends CrudRepository<FluxoFinanceiro, Long> {
}

