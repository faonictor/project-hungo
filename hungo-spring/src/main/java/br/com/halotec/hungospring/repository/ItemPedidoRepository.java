package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM ItemPedido i WHERE i.pedido.id = :pedidoId")
    void deleteByPedidoId(@Param("pedidoId") Long pedidoId);

    @Query("SELECT COALESCE(SUM(i.total), 0.0) FROM ItemPedido i WHERE i.pedido.venda.id = :vendaId AND (i.statusItem IS NULL OR UPPER(i.statusItem) <> 'CANCELADO') AND (i.pedido.statusPedido IS NULL OR UPPER(i.pedido.statusPedido) <> 'CANCELADO')")
    Float somarTotalPorVendaId(@Param("vendaId") Long vendaId);

    @Query("SELECT COALESCE(SUM(i.total), 0.0) FROM ItemPedido i WHERE i.pedido.venda.id = :vendaId AND (UPPER(i.pedido.statusPedido) = 'CONCLUÍDO' OR UPPER(i.pedido.statusPedido) = 'CONCLUIDO') AND (i.statusItem IS NULL OR UPPER(i.statusItem) <> 'CANCELADO')")
    Float somarTotalConcluidoPorVendaId(@Param("vendaId") Long vendaId);

    List<ItemPedido> findByPedidoId(Long pedidoId);
    List<ItemPedido> findByPedidoVendaId(Long vendaId);

    @Query("SELECT i FROM ItemPedido i WHERE i.pedido.venda.dataFimVenda IS NULL AND (i.statusItem IS NULL OR UPPER(i.statusItem) <> 'CANCELADO') AND (i.pedido.statusPedido IS NULL OR UPPER(i.pedido.statusPedido) <> 'CANCELADO')")
    List<ItemPedido> findItensVendasEmAberto();
}
