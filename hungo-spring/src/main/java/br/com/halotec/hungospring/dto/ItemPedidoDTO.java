package br.com.halotec.hungospring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ItemPedidoDTO {
    private Long id;
    private Long produtoId;
    private int quantidade;
}

