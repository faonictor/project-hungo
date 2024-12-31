package br.com.halotec.hungospring.dto;

import lombok.Data;

@Data
public class ItemPedidoDTO {
    private Long id;
    private Long produtoId;  // Relacionamento com Produto
    private int quantidade;
    private float total;
}

