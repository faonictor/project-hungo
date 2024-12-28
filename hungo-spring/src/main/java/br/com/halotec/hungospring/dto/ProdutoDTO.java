package br.com.halotec.hungospring.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProdutoDTO {
    private Long id;
    private String nome;
    private Float preco;
    private Long categoriaId;
    private List<ProdutoInsumoDTO> insumos;
}