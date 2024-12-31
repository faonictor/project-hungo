package br.com.halotec.hungospring.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PedidoDTO {
    private Long id;

    private LocalDateTime dataHora;
    private String tipoPedido;
    private String statusPedido;
    private List<ItemPedidoDTO> itens;  // Lista de itens do pedido
}


//private Long clienteId;    // Relacionamento com Cliente
//private Long enderecoId;   // Relacionamento com Endereço
//private Long vendaId;      // Relacionamento com Venda