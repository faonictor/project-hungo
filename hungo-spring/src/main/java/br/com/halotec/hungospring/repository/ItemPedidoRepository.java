package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.ProdutoInsumo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemPedidoRepository extends CrudRepository<ItemPedido, Long> {
    void deleteByPedido(Pedido pedido);

//    List<ItemPedido> findByPedido(Pedido pedido);

//    Optional<Object> findByPedidoId(Long id);

    @Query("SELECT SUM(i.total) FROM ItemPedido i WHERE i.pedido.venda.id = :vendaId")
    float somarTotalPorVendaId(@Param("vendaId") Long vendaId);

    List<ItemPedido> findByPedidoId(Long pedidoId);
}

