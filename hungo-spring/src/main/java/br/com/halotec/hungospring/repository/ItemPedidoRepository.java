package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.ItemPedido;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemPedidoRepository extends CrudRepository<ItemPedido, Long> {
}

