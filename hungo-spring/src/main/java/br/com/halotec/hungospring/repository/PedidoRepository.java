package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByVendaId(Long vendaId);
    List<Pedido> findByVendaIdAndStatusPedidoNot(Long vendaId, String statusPedido);
}
