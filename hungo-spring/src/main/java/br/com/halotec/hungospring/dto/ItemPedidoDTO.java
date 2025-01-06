package br.com.halotec.hungospring.dto;

import lombok.Data;

@Data
public class ItemPedidoDTO {
    private Long id;
    private Long produtoId;
    private int quantidade;
}

