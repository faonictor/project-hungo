package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.PagamentoComanda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagamentoComandaRepository extends JpaRepository<PagamentoComanda, Long> {
    List<PagamentoComanda> findByVendaIdOrderByDataPagamentoAsc(Long vendaId);
}
