package br.com.halotec.hungospring.dto;

public class ProdutoInsumoDTO {
    private Long insumoId;
    private Integer quantidade;

    public ProdutoInsumoDTO() {}

    public Long getInsumoId() { return insumoId; }
    public void setInsumoId(Long insumoId) { this.insumoId = insumoId; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
}
