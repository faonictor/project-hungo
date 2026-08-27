package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface VendaRepository extends JpaRepository<Venda, Long> {
    List<Venda> findByDataFimVendaIsNull();
    List<Venda> findByDataFimVendaIsNotNull();
    List<Venda> findByValorPagoGreaterThanAndDataFimVendaIsNull(BigDecimal valorPago);
    List<Venda> findByMesaIdAndDataFimVendaIsNull(Long mesaId);
    List<Venda> findByClienteIdAndStatusPagamentoIn(Long clienteId, List<String> statusPagamentos);
    List<Venda> findByStatusPagamentoIn(List<String> statusPagamentos);
    List<Venda> findByClienteId(Long clienteId);

    @Query("SELECT COALESCE(MAX(v.numeroComanda), 0) FROM Venda v WHERE v.dataInicioVenda >= :inicio AND v.dataInicioVenda <= :fim")
    Integer findMaxNumeroComandaBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
