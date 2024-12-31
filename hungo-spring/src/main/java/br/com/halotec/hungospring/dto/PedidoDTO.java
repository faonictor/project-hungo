package br.com.halotec.hungospring.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;


@Data
public class PedidoDTO {
    private Long id;
    private Long clienteId;  // Aqui está o campo necessário
    private Long enderecoId;
    private Long vendaId;
    private LocalDateTime dataHora;
    private String tipoPedido;
    private String statusPedido;
    private List<ItemPedidoDTO> itens;
}
