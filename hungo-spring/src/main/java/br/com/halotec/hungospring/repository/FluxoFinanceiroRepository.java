package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.FluxoFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FluxoFinanceiroRepository extends JpaRepository<FluxoFinanceiro, Long> {
}
