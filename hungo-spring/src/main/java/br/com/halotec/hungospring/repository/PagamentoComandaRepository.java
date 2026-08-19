package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.PagamentoComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagamentoComandaRepository extends JpaRepository<PagamentoComanda, Long> {
    List<PagamentoComanda> findByVendaIdOrderByDataPagamentoAsc(Long vendaId);
}
