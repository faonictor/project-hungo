package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.ItemPedido;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemPedidoRepository extends CrudRepository<ItemPedido, Long> {
    void deleteByPedidoId(Long pedidoId);

    @Query("SELECT SUM(i.total) FROM ItemPedido i WHERE i.pedido.venda.id = :vendaId")
    float somarTotalPorVendaId(@Param("vendaId") Long vendaId);

    List<ItemPedido> findByPedidoId(Long pedidoId);
}

