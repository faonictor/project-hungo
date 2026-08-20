package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Venda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendaRepository extends JpaRepository<Venda, Long> {
    List<Venda> findByDataFimVendaIsNull();
    List<Venda> findByDataFimVendaIsNotNull();
    List<Venda> findByValorPagoGreaterThanAndDataFimVendaIsNull(Float valorPago);
    List<Venda> findByMesaIdAndDataFimVendaIsNull(Long mesaId);
}
