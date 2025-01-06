package br.com.halotec.hungospring.repository;

import br.com.halotec.hungospring.entity.Pedido;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends CrudRepository<Pedido, Long> {
    List<Pedido> findByVendaId(Long vendaId);
}

