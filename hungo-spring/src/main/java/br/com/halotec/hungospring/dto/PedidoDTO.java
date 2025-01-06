package br.com.halotec.hungospring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@Data
public class PedidoDTO {
    private Long id;
    private Long clienteId;
    private Long enderecoId;
    private Long vendaId;
    private String tipoPedido;
    private String statusPedido;
    private LocalDateTime dataHora;
    private List<ItemPedidoDTO> itens;
}
